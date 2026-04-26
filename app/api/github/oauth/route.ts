import type { NextRequest } from "next/server";

/**
 * GitHub App user-to-server OAuth callback.
 * ADR 011 결정 1·3 — GitHub App + popup OAuth + postMessage 토큰 전달.
 *
 * 흐름:
 * 1. editor UI 의 "GitHub 연결" 버튼이 popup 으로 GitHub 인증 페이지 open
 * 2. GitHub 가 사용자 동의 후 우리 callback (이 route) 으로 redirect
 *    (?code=... &state=...)
 * 3. 이 route 가 server-side 에서 code → access_token 교환
 *    (client_secret 사용, 우리 서버 외부 노출 X)
 * 4. 응답 HTML 의 인라인 script 가 window.opener.postMessage 로
 *    토큰 + user 전달 + window.close()
 * 5. opener (/edit) 가 message 수신 → origin 검증 → state 검증 →
 *    Zustand store.setGithub({token, user})
 *
 * 토큰 위생 (ADR 011 결정 3):
 * - server 에 영구 저장 X. 응답 HTML 인라인 외 어디에도 저장 안 됨
 *   (DB · KV · cookie · 로그 모두 0 회 접촉)
 * - access_token 은 응답 HTML body 1 회성 등장. popup window.close 직후 휘발
 * - GitHub 응답의 access_token 은 POST body 로 받기 때문에 Vercel access
 *   log 의 path/query 에는 노출 안 됨
 */

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");

  if (errorParam) {
    return renderError(
      `GitHub 인증 실패: ${errorDescription ?? errorParam}`,
      req,
    );
  }
  if (!code || !state) {
    return renderError("필수 파라미터 누락 (code 또는 state)", req);
  }

  const clientId = process.env.NEXT_PUBLIC_GITHUB_APP_CLIENT_ID;
  const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return renderError(
      "GitHub App 환경변수 미설정 — NEXT_PUBLIC_GITHUB_APP_CLIENT_ID 또는 GITHUB_APP_CLIENT_SECRET 가 비어있습니다. .env.local 또는 Vercel Environment Variables 를 확인하세요.",
      req,
    );
  }

  let accessToken: string;
  let expiresIn: number | null = null;
  try {
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      },
    );
    if (!tokenRes.ok) {
      throw new Error(`HTTP ${tokenRes.status}`);
    }
    const tokenData = (await tokenRes.json()) as {
      access_token?: string;
      expires_in?: number;
      error?: string;
      error_description?: string;
    };
    if (!tokenData.access_token) {
      throw new Error(
        tokenData.error_description ?? tokenData.error ?? "no access_token",
      );
    }
    accessToken = tokenData.access_token;
    expiresIn =
      typeof tokenData.expires_in === "number" ? tokenData.expires_in : null;
  } catch (err) {
    return renderError(
      `토큰 교환 실패: ${err instanceof Error ? err.message : String(err)}`,
      req,
    );
  }

  let userLogin: string;
  try {
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!userRes.ok) {
      throw new Error(`HTTP ${userRes.status}`);
    }
    const userData = (await userRes.json()) as { login?: string };
    if (!userData.login) {
      throw new Error("login 누락");
    }
    userLogin = userData.login;
  } catch (err) {
    return renderError(
      `사용자 정보 조회 실패: ${err instanceof Error ? err.message : String(err)}`,
      req,
    );
  }

  const targetOrigin = resolveTargetOrigin(req);

  const html = `<!doctype html>
<html lang="ko">
<head><meta charset="utf-8"><title>GitHub 연결 완료</title></head>
<body style="font-family:system-ui,sans-serif;padding:2rem;text-align:center;color:#444">
<p>GitHub 연결 완료. 창이 자동으로 닫힙니다…</p>
<script>
(function(){
  var msg = {
    type: "github-oauth-success",
    token: ${JSON.stringify(accessToken)},
    user: ${JSON.stringify(userLogin)},
    state: ${JSON.stringify(state)},
    expiresIn: ${expiresIn === null ? "null" : String(expiresIn)}
  };
  if (window.opener) {
    window.opener.postMessage(msg, ${JSON.stringify(targetOrigin)});
  }
  window.close();
})();
</script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function renderError(message: string, req: NextRequest): Response {
  const targetOrigin = resolveTargetOrigin(req);
  const html = `<!doctype html>
<html lang="ko">
<head><meta charset="utf-8"><title>GitHub 연결 실패</title></head>
<body style="font-family:system-ui,sans-serif;padding:2rem;text-align:center;color:#444">
<p>GitHub 연결 실패</p>
<pre style="white-space:pre-wrap;text-align:left;background:#f7f5f0;padding:1rem;border-radius:4px">${escapeHtml(message)}</pre>
<script>
(function(){
  if (window.opener) {
    window.opener.postMessage(
      { type: "github-oauth-error", message: ${JSON.stringify(message)} },
      ${JSON.stringify(targetOrigin)}
    );
  }
})();
</script>
</body>
</html>`;
  return new Response(html, {
    status: 400,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/**
 * postMessage targetOrigin 결정.
 * NEXT_PUBLIC_SITE_URL 우선 (production 신뢰 origin), 미설정 시 callback
 * 요청의 origin 사용 (localhost dev 환경 자동 동작).
 */
function resolveTargetOrigin(req: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      // fall through
    }
  }
  return new URL(req.url).origin;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

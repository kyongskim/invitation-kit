"use client";

import { useEffect, useState } from "react";

import { useEditorStore } from "@/lib/editor/store";

/**
 * "GitHub 연결" 버튼 + popup OAuth 흐름 진입점.
 * ADR 011 결정 1·3 — popup OAuth + postMessage 토큰 수신 + state nonce
 * CSRF 검증.
 *
 * **Install + Authorize 통합 entrypoint** — `/login/oauth/authorize` 단독은
 * user 토큰만 발급되고 App installation 은 누락돼 template generate 가
 * 403 "Resource not accessible by integration" 으로 실패. 신규 사용자는
 * install 단계 자체가 필요. `/apps/<slug>/installations/new` URL 에 App
 * 설정의 "Request user authorization (OAuth) during installation" ON 을
 * 결합하면 install + authorize 가 한 흐름에 처리되고 같은 callback 으로
 * 돌아온다 (`installation_id` + `code` + `state` 포함). 2026-04-27 v2.0
 * 검증 중 새 GitHub 계정 시나리오에서 발견된 gap 반영.
 *
 * 토큰은 Zustand store 의 `github.token` 에 메모리만 저장 (ADR 010 의
 * partialize 약속). 새로고침 시 휘발 — 사용자는 commit/배포 단계만 짧게
 * 토큰을 보유.
 */

const POPUP_FEATURES = "width=620,height=720,resizable=yes,scrollbars=yes";
const STATE_KEY = "github_oauth_state";

type Status = "idle" | "pending" | "error";

type SuccessMessage = {
  type: "github-oauth-success";
  token: string;
  user: string;
  state: string;
  expiresIn: number | null;
};

type ErrorMessage = {
  type: "github-oauth-error";
  message: string;
};

function isSuccessMessage(data: unknown): data is SuccessMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { type?: unknown }).type === "github-oauth-success" &&
    typeof (data as { token?: unknown }).token === "string" &&
    typeof (data as { user?: unknown }).user === "string" &&
    typeof (data as { state?: unknown }).state === "string"
  );
}

function isErrorMessage(data: unknown): data is ErrorMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { type?: unknown }).type === "github-oauth-error" &&
    typeof (data as { message?: unknown }).message === "string"
  );
}

export function GithubConnect() {
  const github = useEditorStore((s) => s.github);
  const setGithub = useEditorStore((s) => s.setGithub);

  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const clientId = process.env.NEXT_PUBLIC_GITHUB_APP_CLIENT_ID;
  const appSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (isSuccessMessage(event.data)) {
        const expected = sessionStorage.getItem(STATE_KEY);
        if (expected !== event.data.state) {
          setStatus("error");
          setErrorMsg("state 불일치 (CSRF 의심) — 다시 시도해주세요.");
          return;
        }
        sessionStorage.removeItem(STATE_KEY);
        setGithub({ token: event.data.token, user: event.data.user });
        setStatus("idle");
        setErrorMsg(null);
        return;
      }
      if (isErrorMessage(event.data)) {
        setStatus("error");
        setErrorMsg(event.data.message);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [setGithub]);

  function handleConnect() {
    if (!clientId) {
      setStatus("error");
      setErrorMsg(
        "GitHub App 환경변수 미설정 (NEXT_PUBLIC_GITHUB_APP_CLIENT_ID).",
      );
      return;
    }
    if (!appSlug) {
      setStatus("error");
      setErrorMsg(
        "GitHub App slug 환경변수 미설정 (NEXT_PUBLIC_GITHUB_APP_SLUG). App 의 public URL 마지막 segment 입니다.",
      );
      return;
    }
    const nonce = crypto.randomUUID();
    sessionStorage.setItem(STATE_KEY, nonce);
    // Install + authorize 통합 URL — App 설정의 "Request user authorization
    // (OAuth) during installation" ON 전제. callback 은 `code` + `state` +
    // `installation_id` + `setup_action` 을 같이 받음.
    // `redirect_uri` 는 multi-Callback URL 환경에서 명시 필수 — 미설정 시
    // GitHub 이 Callback URL 목록의 첫 번째로 redirect 해서 prod 에서
    // 시도해도 localhost 로 회귀하는 회귀 발화 (2026-04-27 검증).
    const redirectUri = `${window.location.origin}/api/github/oauth`;
    const installUrl =
      `https://github.com/apps/${encodeURIComponent(appSlug)}/installations/new` +
      `?state=${encodeURIComponent(nonce)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;
    setStatus("pending");
    setErrorMsg(null);
    const popup = window.open(installUrl, "github-oauth", POPUP_FEATURES);
    if (!popup) {
      setStatus("error");
      setErrorMsg(
        "팝업이 차단되었습니다. 브라우저에서 이 사이트의 팝업을 허용해주세요.",
      );
    }
  }

  function handleDisconnect() {
    setGithub({ token: null, user: null });
    setStatus("idle");
    setErrorMsg(null);
  }

  if (github.token && github.user) {
    return (
      <section className="flex flex-col gap-2">
        <h2 className="text-primary font-serif text-lg">GitHub</h2>
        <p className="text-secondary text-sm">
          연결됨: <span className="text-primary">@{github.user}</span>
        </p>
        <button
          type="button"
          onClick={handleDisconnect}
          className="border-accent text-secondary hover:text-primary hover:border-primary self-start rounded-sm border px-3 py-1.5 text-xs tracking-wider uppercase transition-colors"
        >
          연결 해제
        </button>
        <p className="text-secondary/70 text-xs leading-relaxed">
          토큰은 브라우저 메모리에만 저장됩니다. 새로고침 시 다시 연결해야
          합니다.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-primary font-serif text-lg">GitHub</h2>
      <button
        type="button"
        onClick={handleConnect}
        disabled={status === "pending"}
        className="border-accent text-secondary hover:text-primary hover:border-primary self-start rounded-sm border px-3 py-1.5 text-xs tracking-wider uppercase transition-colors disabled:opacity-50"
      >
        {status === "pending" ? "연결 중…" : "GitHub 연결"}
      </button>
      {errorMsg && (
        <p className="text-xs leading-relaxed text-red-600">{errorMsg}</p>
      )}
      <p className="text-secondary/70 text-xs leading-relaxed">
        본인 GitHub 계정에 청첩장 repo 를 만들고 commit 합니다. 토큰은 브라우저
        메모리에만 저장됩니다 (서버 보관 X).
      </p>
    </section>
  );
}

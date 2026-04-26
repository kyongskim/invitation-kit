import type { NextRequest } from "next/server";

import type { InvitationConfig } from "@/invitation.config.types";
import { serializeConfig } from "@/lib/editor/serialize-config";

/**
 * `invitation.config.ts` commit endpoint.
 * ADR 011 결정 4 (단일 TS 파일 전체 재생성, server-side prettier).
 *
 * 흐름:
 * 1. client 가 `Authorization: Bearer <token>` + body `{ owner, repo, config }` POST
 * 2. server 가 `serializeConfig(config)` (prettier typescript parser) 로 본문 생성
 * 3. base64 인코딩 → GitHub Contents API PUT
 *    `/repos/{owner}/{repo}/contents/invitation.config.ts`
 * 4. 응답: 새 commit SHA + URL
 *
 * 토큰 위생: token 은 Authorization 헤더로 받아 즉시 GitHub API 로 forward.
 * server 메모리 외 어디에도 (DB · KV · cookie · log) 저장 안 됨. 함수 반환
 * 후 휘발. ADR 010·011 의 "데이터 보관 X" 약속 정합.
 *
 * Node runtime 명시 — prettier 가 Node-only.
 */

export const runtime = "nodejs";

const FILE_PATH = "invitation.config.ts";
const TYPES_FILE_PATH = "invitation.config.types.ts";
const RETRY_DELAY_MS = 1500;
const MAX_GET_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
  if (!token) {
    return Response.json(
      { error: "Authorization Bearer 토큰이 필요합니다." },
      { status: 401 },
    );
  }

  let body: {
    owner?: unknown;
    repo?: unknown;
    config?: unknown;
    branch?: unknown;
    message?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "JSON body 파싱 실패." }, { status: 400 });
  }

  if (
    typeof body.owner !== "string" ||
    typeof body.repo !== "string" ||
    typeof body.config !== "object" ||
    body.config === null
  ) {
    return Response.json(
      {
        error: "필수 필드 누락 (owner: string, repo: string, config: object).",
      },
      { status: 400 },
    );
  }

  const owner = body.owner;
  const repo = body.repo;
  const config = body.config as InvitationConfig;
  const branch = typeof body.branch === "string" ? body.branch : "main";
  const message =
    typeof body.message === "string"
      ? body.message
      : "chore(editor): update invitation.config.ts";

  let source: string;
  try {
    source = await serializeConfig(config);
  } catch (err) {
    return Response.json(
      {
        error: `직렬화 실패: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 500 },
    );
  }

  const base64 = Buffer.from(source, "utf-8").toString("base64");

  let existingSha: string | undefined;
  try {
    existingSha = await getExistingSha({
      owner,
      repo,
      path: FILE_PATH,
      branch,
      token,
    });
  } catch (err) {
    return Response.json(
      {
        error: `기존 파일 조회 실패: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 502 },
    );
  }

  try {
    const putRes = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          content: base64,
          branch,
          ...(existingSha ? { sha: existingSha } : {}),
        }),
      },
    );

    if (!putRes.ok) {
      const text = await putRes.text().catch(() => "");
      throw new Error(`HTTP ${putRes.status}: ${text}`);
    }

    const data = (await putRes.json()) as {
      commit?: { sha?: string; html_url?: string };
      content?: { html_url?: string };
    };

    return Response.json({
      commitSha: data.commit?.sha ?? null,
      commitUrl: data.commit?.html_url ?? null,
      fileUrl: data.content?.html_url ?? null,
      hint: existingSha
        ? null
        : `참고: ${TYPES_FILE_PATH} 가 같은 repo 에 존재하는지 확인하세요. template generate 직후라면 자동 포함됩니다.`,
    });
  } catch (err) {
    return Response.json(
      {
        error: `Commit 실패: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 502 },
    );
  }
}

async function getExistingSha(args: {
  owner: string;
  repo: string;
  path: string;
  branch: string;
  token: string;
}): Promise<string | undefined> {
  for (let attempt = 0; attempt < MAX_GET_ATTEMPTS; attempt++) {
    const res = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(args.owner)}/${encodeURIComponent(args.repo)}/contents/${args.path}?ref=${encodeURIComponent(args.branch)}`,
      {
        headers: {
          Authorization: `Bearer ${args.token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    if (res.ok) {
      const data = (await res.json()) as { sha?: string };
      return typeof data.sha === "string" ? data.sha : undefined;
    }

    if (res.status === 404) {
      // template generate 직후 file 이 아직 propagate 안 됐을 수 있음 — retry
      if (attempt < MAX_GET_ATTEMPTS - 1) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      return undefined; // 정말 없으면 신규 생성 (PUT without sha)
    }

    throw new Error(`HTTP ${res.status}`);
  }
  return undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

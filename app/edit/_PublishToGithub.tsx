"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { generateRepo } from "@/lib/editor/github-create-repo";
import { useEditorStore } from "@/lib/editor/store";

/**
 * GitHub 연결 후 노출되는 publish 흐름.
 * ADR 011 결정 2·4 — template generate 로 사용자 본인 repo 생성 +
 * `serializeConfig` server-side prettier 로 `invitation.config.ts` commit.
 *
 * 흐름:
 * 1. repo 이름 + private 토글 입력
 * 2. submit → `generateRepo` (client → GitHub API 직접) →
 *    신규 repo 생성 (template 의 모든 파일 squash 된 single initial commit)
 * 3. → POST `/api/github/commit` (server-side serialize + Contents API PUT)
 *    로 사용자 form 입력 반영된 invitation.config.ts 덮어쓰기
 * 4. 결과 URL 노출 — 사용자가 본인 repo 에서 확인
 *
 * 토큰: 메모리의 `github.token` 을 client 에서 직접 GitHub API 호출 +
 * commit 호출 시 Authorization 헤더로 forward. server 비저장 (ADR 010·011).
 */

const REPO_NAME_PATTERN = "[a-zA-Z0-9_.-]+";

type Status = "idle" | "submitting" | "success" | "error";

type SuccessResult = {
  repoUrl: string;
  commitUrl: string | null;
};

export function PublishToGithub() {
  const github = useEditorStore((s) => s.github);
  const config = useEditorStore((s) => s.config);

  const [repoName, setRepoName] = useState("our-wedding");
  const [isPrivate, setIsPrivate] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<SuccessResult | null>(null);

  if (!github.token || !github.user) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!github.token || !github.user) return;
    const token = github.token;
    const user = github.user;

    setStatus("submitting");
    setErrorMsg(null);
    setResult(null);

    try {
      const repo = await generateRepo({
        token,
        name: repoName,
        description: `${config.groom.name} ♥ ${config.bride.name} 청첩장`,
        isPrivate,
      });

      const commitRes = await fetch("/api/github/commit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          owner: user,
          repo: repoName,
          config,
        }),
      });

      const commitData = (await commitRes.json().catch(() => ({}))) as {
        commitUrl?: string | null;
        error?: string;
      };

      if (!commitRes.ok) {
        throw new Error(commitData.error ?? `commit ${commitRes.status}`);
      }

      setStatus("success");
      setResult({
        repoUrl: repo.html_url,
        commitUrl: commitData.commitUrl ?? null,
      });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-primary font-serif text-lg">청첩장 만들기</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-secondary text-xs tracking-wider uppercase">
            Repo 이름
          </span>
          <input
            value={repoName}
            onChange={(e) => setRepoName(e.target.value)}
            required
            pattern={REPO_NAME_PATTERN}
            className="border-accent text-text w-full rounded-sm border bg-transparent px-3 py-2 text-sm"
          />
          <span className="text-secondary/70 text-xs">
            영문·숫자·`_.-` 만 허용. 본인 GitHub 계정에 같은 이름 repo 가 없어야
            합니다.
          </span>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
          />
          <span className="text-text">
            비공개 repo (Vercel free tier 는 빌드 불가, Pro 필요)
          </span>
        </label>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="border-accent text-secondary hover:text-primary hover:border-primary self-start rounded-sm border px-3 py-1.5 text-xs tracking-wider uppercase transition-colors disabled:opacity-50"
        >
          {status === "submitting"
            ? "만드는 중… (5~10초)"
            : "GitHub 에 청첩장 만들기"}
        </button>
      </form>

      {status === "success" && result && (
        <div className="flex flex-col gap-1 rounded-sm border border-emerald-700/30 bg-emerald-50/50 px-3 py-2 text-xs">
          <p className="text-emerald-900">청첩장 repo 가 만들어졌습니다.</p>
          <a
            href={result.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            {result.repoUrl}
          </a>
          {result.commitUrl && (
            <a
              href={result.commitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary underline"
            >
              초기 commit 보기
            </a>
          )}
          <p className="text-secondary/70 mt-1">
            다음 단계 (Phase 4): Vercel 배포 자동화. 지금은 본인 Vercel 에서 이
            repo 를 import 해야 청첩장이 배포됩니다.
          </p>
        </div>
      )}

      {status === "error" && errorMsg && (
        <p className="text-xs leading-relaxed text-red-600">{errorMsg}</p>
      )}
    </section>
  );
}

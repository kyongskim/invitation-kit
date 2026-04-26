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
 * 두 모드:
 * - 첫 publish 모드 (`publishedRepo === null`): repo 이름 + private 토글
 *   입력 → generateRepo + /api/github/commit. 성공 시 publishedRepo 저장
 * - re-commit 모드 (`publishedRepo` 있음): 같은 repo 에 config 만 다시
 *   commit. 갤러리 이미지 업로드 (Phase 3-b) 후 src 갱신을 반영하는
 *   주된 사용처
 *
 * 토큰: 메모리의 `github.token` 을 client → GitHub API + commit endpoint
 * 모두 Authorization 헤더로 forward. server 비저장 (ADR 010·011).
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
  const publishedRepo = useEditorStore((s) => s.publishedRepo);
  const setPublishedRepo = useEditorStore((s) => s.setPublishedRepo);

  if (!github.token || !github.user) return null;

  if (publishedRepo) {
    return (
      <RepublishMode
        token={github.token}
        publishedRepoUrl={publishedRepo.htmlUrl}
        owner={publishedRepo.owner}
        repo={publishedRepo.name}
        config={config}
        onForget={() => setPublishedRepo(null)}
      />
    );
  }

  return (
    <FirstPublishMode
      token={github.token}
      user={github.user}
      config={config}
      onSuccess={(repo) =>
        setPublishedRepo({
          owner: repo.owner,
          name: repo.name,
          htmlUrl: repo.htmlUrl,
          branch: repo.branch,
        })
      }
    />
  );
}

function FirstPublishMode(props: {
  token: string;
  user: string;
  config: ReturnType<typeof useEditorStore.getState>["config"];
  onSuccess: (repo: {
    owner: string;
    name: string;
    htmlUrl: string;
    branch: string;
  }) => void;
}) {
  const [repoName, setRepoName] = useState("our-wedding");
  const [isPrivate, setIsPrivate] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<SuccessResult | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg(null);
    setResult(null);

    try {
      const repo = await generateRepo({
        token: props.token,
        name: repoName,
        description: `${props.config.groom.name} ♥ ${props.config.bride.name} 청첩장`,
        isPrivate,
      });

      const commitRes = await fetch("/api/github/commit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${props.token}`,
        },
        body: JSON.stringify({
          owner: props.user,
          repo: repoName,
          config: props.config,
        }),
      });

      const commitData = (await commitRes.json().catch(() => ({}))) as {
        commitUrl?: string | null;
        error?: string;
      };

      if (!commitRes.ok) {
        throw new Error(commitData.error ?? `commit ${commitRes.status}`);
      }

      props.onSuccess({
        owner: repo.owner.login,
        name: repo.name,
        htmlUrl: repo.html_url,
        branch: repo.default_branch,
      });

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
            이제 갤러리에 본인 사진을 업로드하거나 form 을 더 수정한 후
            &quot;변경사항 commit&quot; 으로 같은 repo 에 반영할 수 있습니다.
          </p>
        </div>
      )}

      {status === "error" && errorMsg && (
        <p className="text-xs leading-relaxed text-red-600">{errorMsg}</p>
      )}
    </section>
  );
}

function RepublishMode(props: {
  token: string;
  publishedRepoUrl: string;
  owner: string;
  repo: string;
  config: ReturnType<typeof useEditorStore.getState>["config"];
  onForget: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [commitUrl, setCommitUrl] = useState<string | null>(null);

  async function handleRecommit() {
    setStatus("submitting");
    setErrorMsg(null);
    setCommitUrl(null);

    try {
      const commitRes = await fetch("/api/github/commit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${props.token}`,
        },
        body: JSON.stringify({
          owner: props.owner,
          repo: props.repo,
          config: props.config,
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
      setCommitUrl(commitData.commitUrl ?? null);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-primary font-serif text-lg">청첩장 commit</h2>
      <p className="text-secondary text-xs leading-relaxed">
        저장 위치:{" "}
        <a
          href={props.publishedRepoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline"
        >
          {props.owner}/{props.repo}
        </a>
      </p>

      <button
        type="button"
        onClick={handleRecommit}
        disabled={status === "submitting"}
        className="border-accent text-secondary hover:text-primary hover:border-primary self-start rounded-sm border px-3 py-1.5 text-xs tracking-wider uppercase transition-colors disabled:opacity-50"
      >
        {status === "submitting" ? "commit 중…" : "변경사항 commit"}
      </button>

      {status === "success" && (
        <div className="flex flex-col gap-1 rounded-sm border border-emerald-700/30 bg-emerald-50/50 px-3 py-2 text-xs">
          <p className="text-emerald-900">commit 완료.</p>
          {commitUrl && (
            <a
              href={commitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary underline"
            >
              {commitUrl}
            </a>
          )}
          <p className="text-secondary/70 mt-1">
            Vercel 자동 재배포가 트리거됩니다 (보통 1~2 분).
          </p>
        </div>
      )}

      {status === "error" && errorMsg && (
        <p className="text-xs leading-relaxed text-red-600">{errorMsg}</p>
      )}

      <button
        type="button"
        onClick={props.onForget}
        className="text-secondary/70 hover:text-secondary self-start text-xs underline-offset-2 hover:underline"
      >
        다른 repo 에 새로 만들기
      </button>
    </section>
  );
}

/**
 * GitHub template generate API wrapper.
 * ADR 011 결정 2 — `POST /repos/{template_owner}/{template_repo}/generate`.
 *
 * client-side · server-side 모두 호출 가능. fetch 만 사용 (Octokit 미도입,
 * ADR 011 의 "endpoint 4 개로 충분, Octokit 의 추상화 가치가 작음" 정책).
 *
 * 사용자가 본인 fork 의 editor 를 운영할 때는 template owner/repo 상수를
 * 본인 repo 로 변경 (또는 NEXT_PUBLIC_TEMPLATE_OWNER/REPO env 도입).
 */

const DEFAULT_TEMPLATE_OWNER = "kyongskim";
const DEFAULT_TEMPLATE_REPO = "invitation-kit";

export type GenerateRepoParams = {
  /** GitHub App user-to-server access token */
  token: string;
  /** 신규 repo 이름 (예: 'our-wedding-2027') */
  name: string;
  /** repo 설명 — GitHub UI 의 About 표시 */
  description?: string;
  /** true 시 비공개 repo. Vercel free tier 는 private repo 빌드 불가 (Pro 필요) */
  isPrivate?: boolean;
  /**
   * 신규 repo 의 owner. 미설정 시 GitHub 가 토큰의 사용자 본인 계정으로 자동.
   * org 에 만들고 싶은 경우 org 이름 명시 (App 이 해당 org 에 install 된 상태여야).
   */
  owner?: string;
  /** template repo override (fork 사용자용). 미설정 시 OSS 기본 */
  templateOwner?: string;
  templateRepo?: string;
};

export type GeneratedRepo = {
  /** 'username/reponame' */
  full_name: string;
  /** GitHub web UI URL */
  html_url: string;
  /** 기본 branch 이름 ('main' 일반적) */
  default_branch: string;
  /** repo owner login */
  owner: { login: string };
  /** repo name */
  name: string;
};

export async function generateRepo(
  params: GenerateRepoParams,
): Promise<GeneratedRepo> {
  const templateOwner = params.templateOwner ?? DEFAULT_TEMPLATE_OWNER;
  const templateRepo = params.templateRepo ?? DEFAULT_TEMPLATE_REPO;

  const res = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(templateOwner)}/${encodeURIComponent(templateRepo)}/generate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...(params.owner ? { owner: params.owner } : {}),
        name: params.name,
        ...(params.description ? { description: params.description } : {}),
        private: params.isPrivate ?? false,
        include_all_branches: false,
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 422) {
      throw new Error(
        `이미 같은 이름의 repo 가 있거나 template repo 가 아닙니다. 다른 이름을 시도하거나 OSS 운영자에게 'Template repository' 토글 활성화를 요청하세요. (HTTP 422)`,
      );
    }
    throw new Error(`Repo 생성 실패 (HTTP ${res.status}): ${text}`);
  }

  return res.json() as Promise<GeneratedRepo>;
}

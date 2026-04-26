/**
 * 갤러리 이미지 GitHub Contents API 업로드.
 * ADR 010 결정 2 — 사용자 본인 repo 의 `public/images/gallery/` 에 직접
 * commit. 추가 SaaS (Cloudinary 등) 0 건, 이미지 자산 100% 사용자 소유,
 * Vercel push trigger 로 자동 재배포 한 흐름.
 *
 * client-side 호출 가능 — fetch 직접 GitHub API. CORS 허용. 토큰은
 * `useEditorStore.github.token` 에서 메모리 패스스루.
 *
 * 한 파일 = 한 commit. 사용자가 사진 9 장 업로드 시 9 commits 추가됨.
 * Vercel build trigger 가 짧은 시간 다중 push 를 합쳐 처리하므로 build
 * 횟수는 보통 1~2 회로 수렴.
 *
 * 클라이언트 단 사이즈 가드 (5MB) 만 본 호흡에 포함. 자동 resize / quality
 * compression 은 Phase 5 (image-resize.ts) 후보.
 */

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type UploadImageParams = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  file: File;
};

export type UploadImageResult = {
  /** `invitation.config.ts` 의 `gallery[i].src` 에 그대로 들어갈 path */
  src: string;
  /** GitHub commit URL — 사용자 확인용 */
  commitUrl: string | null;
};

export async function uploadImage(
  params: UploadImageParams,
): Promise<UploadImageResult> {
  if (params.file.size > MAX_BYTES) {
    throw new Error(
      `파일이 너무 큽니다 (${(params.file.size / 1024 / 1024).toFixed(1)}MB). 5MB 이하로 줄여주세요.`,
    );
  }
  if (!ALLOWED_TYPES.has(params.file.type)) {
    throw new Error(
      `지원하지 않는 형식입니다 (${params.file.type}). JPG/PNG/WebP/GIF 만 가능합니다.`,
    );
  }

  const ext = pickExtension(params.file);
  const id = randomId();
  const repoPath = `public/images/gallery/${id}.${ext}`;
  const base64 = await fileToBase64(params.file);

  const res = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(params.owner)}/${encodeURIComponent(params.repo)}/contents/${repoPath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${params.token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `chore(editor): upload ${repoPath}`,
        content: base64,
        branch: params.branch,
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`이미지 업로드 실패 (HTTP ${res.status}): ${text}`);
  }

  const data = (await res.json()) as {
    commit?: { html_url?: string };
  };

  return {
    src: `/${repoPath.replace(/^public\//, "")}`,
    commitUrl: data.commit?.html_url ?? null,
  };
}

function pickExtension(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^(jpg|jpeg|png|webp|gif)$/.test(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "jpg";
  }
}

function randomId(): string {
  return crypto.randomUUID().split("-")[0];
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

import type { InvitationConfig } from "@/invitation.config.types";

/**
 * Vercel Deploy Button URL 빌더.
 * ADR 012 결정 1·2 — Vercel REST API 직접 호출 거부, 사용자가 본인 Vercel
 * UI 안에서 import + env + 배포 진행. 우리는 URL 한 개만 발급, 토큰 보유
 * 0 = "데이터 보관 X" 약속 가장 강한 형태.
 *
 * 출력 URL 형식:
 *   https://vercel.com/new/clone
 *     ?repository-url=https://github.com/user/repo
 *     &project-name=our-wedding
 *     &env=NEXT_PUBLIC_KAKAO_APP_KEY,NEXT_PUBLIC_FIREBASE_API_KEY,...
 *     &envDescription=...
 *     &envLink=...
 *
 * envKeys 는 config 의 활성 섹션 보고 동적 결정 — guestbook/rsvp 미사용
 * 시 Firebase 6 키 + App Check 키 누락 (사용자 입력 단계 0).
 */

const DEPLOY_URL = "https://vercel.com/new/clone";

const FIREBASE_KEYS = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

const APP_CHECK_KEY = "NEXT_PUBLIC_RECAPTCHA_SITE_KEY";
const KAKAO_KEY = "NEXT_PUBLIC_KAKAO_APP_KEY";

const ENV_DESCRIPTION =
  "이 청첩장에 필요한 API 키 목록입니다. 각 값의 발급 절차는 envLink 의 가이드를 참조하세요. 미설정 키는 해당 기능만 비활성화되며 사이트 자체는 정상 동작합니다.";

const ENV_LINK_DEFAULT =
  "https://github.com/kyongskim/invitation-kit/blob/main/docs/api-keys.md";

export function selectEnvKeys(config: InvitationConfig): string[] {
  const keys: string[] = [];
  // 카카오 — Maps SDK 가 venue 에서 항상 사용 + 카카오 공유 share buttons
  keys.push(KAKAO_KEY);
  // Firebase — guestbook 또는 rsvp 활성 시. App Check 도 같이 (Firebase 봇 방어)
  if (config.guestbook.enabled || config.rsvp.enabled) {
    keys.push(...FIREBASE_KEYS, APP_CHECK_KEY);
  }
  return keys;
}

export type BuildDeployUrlParams = {
  /** GitHub repo HTTPS URL — 예: https://github.com/user/repo */
  repoUrl: string;
  /** Vercel project 이름 — 보통 GitHub repo 이름과 같게 */
  projectName: string;
  /** config 의 활성 섹션 보고 envKeys 자동 결정 */
  config: InvitationConfig;
  /** env 발급 가이드 URL — 미설정 시 OSS 기본 (docs/api-keys.md) */
  envLink?: string;
};

export function buildDeployButtonUrl(params: BuildDeployUrlParams): string {
  const envKeys = selectEnvKeys(params.config);
  const search = new URLSearchParams();
  search.set("repository-url", params.repoUrl);
  search.set("project-name", params.projectName);
  if (envKeys.length > 0) {
    search.set("env", envKeys.join(","));
    search.set("envDescription", ENV_DESCRIPTION);
    search.set("envLink", params.envLink ?? ENV_LINK_DEFAULT);
  }
  return `${DEPLOY_URL}?${search.toString()}`;
}

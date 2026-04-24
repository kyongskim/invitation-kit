/**
 * 한국 결혼식 공유 경로에서 흔한 인앱 웹뷰 시그니처.
 * false-positive 낮은 확실한 토큰만 포함 (Android `;wv` 같은 광범위 토큰 제외).
 */
const IN_APP_SIGNATURES = /KAKAOTALK|Instagram|FBAN|FBAV|NAVER|Line\//;

export function isInAppBrowser(ua: string | null | undefined): boolean {
  if (!ua) return false;
  return IN_APP_SIGNATURES.test(ua);
}

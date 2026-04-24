/**
 * 클립보드 텍스트 복사 헬퍼.
 *
 * secure context (HTTPS · localhost) + 사용자 제스처 안에서만 동작한다.
 * 실패 시 false 를 반환하므로 호출부에서 토스트로 수동 복사 유도.
 */
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

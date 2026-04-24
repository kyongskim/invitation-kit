/**
 * 캘린더 딥링크 모음.
 *
 * `lib/map.ts` 와 같은 패턴 — SDK 없이 순수 HTTPS URL 만 생성.
 * 구글 캘린더 `render?action=TEMPLATE` 형식은 로그인 상태면 앱/웹
 * 어디서든 "이벤트 추가" 화면으로 바로 이동. 미로그인 상태는
 * 로그인 페이지로 리다이렉트 — 사용자가 수용 가능한 기본 UX.
 *
 * Apple Calendar / iCloud · Outlook 등은 `.ics` 파일 다운로드가
 * 정석이지만 모바일 UX 가 어설퍼서 MVP 에서는 미도입.
 * 수요 발생 시 별도 함수 (`icsDataUrl`) 로 분리.
 */

/** `Date` → `YYYYMMDDTHHmmssZ` (UTC basic format). 구글 캘린더 `dates` 파라미터용. */
function toUtcBasic(d: Date): string {
  // toISOString() → "2026-05-17T03:00:00.000Z"
  // 하이픈·콜론·밀리초 제거 → "20260517T030000Z"
  return d.toISOString().replace(/[-:]|\.\d{3}/g, "");
}

export function googleCalendarUrl({
  title,
  start,
  durationMinutes,
  location,
  description,
}: {
  title: string;
  start: Date | string;
  /** 기본 90 분 — 결혼식 + 식후 사진 시간 포함한 실용 기본값 */
  durationMinutes?: number;
  location?: string;
  description?: string;
}): string {
  const startDate = typeof start === "string" ? new Date(start) : start;
  const duration = durationMinutes ?? 90;
  const endDate = new Date(startDate.getTime() + duration * 60_000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toUtcBasic(startDate)}/${toUtcBasic(endDate)}`,
  });
  if (location) params.set("location", location);
  if (description) params.set("details", description);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

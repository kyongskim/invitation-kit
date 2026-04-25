/**
 * 캘린더 딥링크 모음.
 *
 * `lib/map.ts` 와 같은 패턴 — SDK 없이 순수 HTTPS URL 만 생성.
 *
 * Google Calendar — `render?action=TEMPLATE` 형식. 로그인 상태면 앱/웹
 * 어디서든 "이벤트 추가" 화면으로 바로 이동. 미로그인 상태는 로그인
 * 페이지로 리다이렉트 — 사용자가 수용 가능한 기본 UX.
 *
 * Apple Calendar — RFC 5545 (.ics) 파일 + `data:text/calendar` URL.
 * iOS Safari 가 .ics MIME 을 자동 인식해 Calendar 앱의 "이벤트 추가"
 * 시트 호출. 데스크톱·Android 는 다운로드로 떨어지지만 더블클릭 시
 * 기본 캘린더 앱이 열려 같은 결과. webcal:// 스킴은 별도 호스팅
 * 필요해서 채택 안 함 (data URL 로 self-contained).
 *
 * Outlook / Naver / Yahoo 등 추가 캘린더는 v1.2+ 후보 — 사용자 수요
 * 발생 시 동일 패턴 (URL 생성 함수 + 버튼 한 줄 추가) 으로 확장.
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

/** RFC 5545 §3.3.11 TEXT escape: backslash, comma, semicolon, newline. */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\r?\n/g, "\\n");
}

/**
 * iOS Safari·macOS Calendar 가 인식하는 RFC 5545 .ics data URL 생성.
 *
 * iPhone Safari 에서 링크 탭 → "캘린더에 추가" 시트가 자동 노출.
 * 데스크톱 브라우저에선 .ics 다운로드 → 더블클릭 → 기본 캘린더 앱 열림.
 *
 * `webcal://` 대신 `data:text/calendar` 사용 — 별도 hosting 없이
 * self-contained, OSS 템플릿 정체성과 일관 (Vercel 정적 호스팅만 가정).
 */
export function appleCalendarUrl({
  title,
  start,
  durationMinutes,
  location,
  description,
}: {
  title: string;
  start: Date | string;
  /** 기본 90 분 — googleCalendarUrl 과 동일 */
  durationMinutes?: number;
  location?: string;
  description?: string;
}): string {
  const startDate = typeof start === "string" ? new Date(start) : start;
  const duration = durationMinutes ?? 90;
  const endDate = new Date(startDate.getTime() + duration * 60_000);

  const dtStart = toUtcBasic(startDate);
  const dtEnd = toUtcBasic(endDate);
  // UID 는 stable (재방문 시 같은 이벤트 인식) — title + start 조합으로 충분.
  const uid = `${dtStart}-${title.replace(/\s+/g, "-")}@invitation-kit`;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//invitation-kit//Wedding//KO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toUtcBasic(new Date())}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(title)}`,
  ];
  if (location) lines.push(`LOCATION:${escapeIcsText(location)}`);
  if (description) lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");

  // RFC 5545 는 CRLF 줄바꿈 필수. 대부분 클라이언트는 LF 도 허용하지만
  // iOS Calendar 는 CRLF 가 안전.
  const ics = lines.join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

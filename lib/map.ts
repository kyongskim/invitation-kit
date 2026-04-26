/**
 * 지도 딥링크 모음.
 *
 * SDK 의존 없는 순수 URL 생성기. 카카오맵 / 네이버 지도 / T맵 모두
 * 같은 파라미터 셰이프 ({name, coords}) 를 받아 호출부 일관성 유지.
 *
 * 카카오맵·네이버는 HTTPS URL — 앱 설치 시 앱 열리고 미설치 시 웹 폴백.
 * T맵은 `tmap://` 커스텀 스킴 only — 웹 폴백 없음. 미설치 시 동작 안 함
 * (사용자가 카카오맵·네이버 지도 두 버튼으로 우회 가능). 정책 배경은
 * `.claude/rules/kakao-sdk.md` 의 "카카오맵 딥링크" 섹션.
 */

export function kakaoMapDeeplink({
  name,
  coords,
}: {
  name: string;
  coords: { lat: number; lng: number };
}): string {
  return `https://map.kakao.com/link/to/${encodeURIComponent(name)},${coords.lat},${coords.lng}`;
}

export function naverMapDeeplink({
  name,
  coords,
}: {
  name: string;
  coords: { lat: number; lng: number };
}): string {
  const query = encodeURIComponent(name);
  // `c=lng,lat,zoom,angle,pitch,bearing,mapType` — 좌표 중심 + 2D(`dh`) 뷰로
  // 동명이인 장소가 다수 있을 때도 정확한 위치를 우선 표시.
  return `https://map.naver.com/v5/search/${query}?c=${coords.lng},${coords.lat},16,0,0,0,dh`;
}

/**
 * T맵 길찾기 딥링크.
 *
 * **HTTPS 폴백 없음** — T맵은 웹 지도가 따로 없어 앱 미설치 사용자에겐
 * 동작 안 함 (브라우저가 unknown scheme 으로 무반응 또는 "열 수 없음").
 * 카카오맵·네이버 지도와 달리 사용자에게 "T맵 앱 필요" 라는 묵시적 전제.
 * 한국 결혼식 하객 다수가 T맵 사용자라 운영상 가치 있음 + 미설치 사용자는
 * 카카오맵·네이버로 우회 가능.
 *
 * URL 파라미터: `goalx` = 경도 (longitude), `goaly` = 위도 (latitude).
 * lat/lng 순서 직관과 다름 — 헷갈리지 말 것.
 */
export function tmapDeeplink({
  name,
  coords,
}: {
  name: string;
  coords: { lat: number; lng: number };
}): string {
  return `tmap://route?goalname=${encodeURIComponent(name)}&goalx=${coords.lng}&goaly=${coords.lat}`;
}

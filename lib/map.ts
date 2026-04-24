/**
 * 지도 딥링크 모음.
 *
 * SDK 의존 없는 순수 HTTPS URL 생성기. 카카오맵 / 네이버 지도 모두
 * 같은 파라미터 셰이프 ({name, coords}) 를 받아 호출부 일관성 유지.
 *
 * 정책 배경: `.claude/rules/kakao-sdk.md` 의 "카카오맵 딥링크" 섹션.
 * `kakaomap://` / `nmap://` 같은 커스텀 스킴은 사용하지 않는다 —
 * 앱 미설치 시 iOS Safari 가 차단하거나 "페이지를 열 수 없음" 에러로
 * 떨어져 UX 가 최악. HTTPS URL 은 앱 설치 시 자동으로 앱이 열리고
 * 미설치 시 웹 지도로 폴백되는 단일 코드패스.
 *
 * 네이버 지도 형제 함수 (`naverMapDeeplink`) 는 후속 커밋에서 추가.
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

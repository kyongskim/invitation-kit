# Kakao SDK 규칙

> 이 프로젝트에서 카카오톡 공유·카카오맵 딥링크를 구현할 때 따르는 원칙. CLAUDE.md 의 Progressive Disclosure 로 "카카오 SDK 관련 작업 시" 자동 참조.

## Scope

**이 규칙의 적용 범위**:

- 카카오톡 공유 (Kakao JavaScript SDK `Kakao.Share`)
- 카카오맵 딥링크 — SDK 없이 순수 URL. 편의상 같은 파일에서 규칙화

**적용 범위 밖 (별도 규칙 파일 없이 당장 도입 금지)**:

- 카카오 로그인 (OAuth)
- 카카오페이먼츠
- 플러스친구, 챗봇, 알림톡 등 비즈니스 채널

범위 확장이 필요해지는 순간 이 파일을 먼저 갱신하거나 별도 규칙 파일을 분리한다.

## SDK 버전·설치

- **Kakao JavaScript SDK v2** 를 사용. npm 패키지 아님 — 공식 CDN 스크립트로 로드.
- **버전 번호와 `integrity` 해시는 이 파일에 하드코딩하지 않는다.** Kakao 가 해시 포함 최신 `<script>` 태그를 공식 다운로드 페이지에 매번 게시하므로, 실제 도입 시점에 [공식 docs](https://developers.kakao.com/docs/latest/ko/javascript/download) 에서 복사해 사용.
- Next.js 에서는 **`next/script` 컴포넌트 + `strategy="afterInteractive"`** 로 삽입. `layout.tsx` 에 전역 삽입하지 않고, 공유 버튼을 포함하는 섹션 컴포넌트(또는 그 직상위 client boundary) 에서 로드.

## 초기화

```ts
// 의사코드 — 실제 구현 시 lib/kakao.ts 에 캡슐화
if (
  typeof window !== "undefined" &&
  window.Kakao &&
  !window.Kakao.isInitialized()
) {
  window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_APP_KEY);
}
```

- **반드시 `isInitialized()` 가드 선행.** 중복 init 호출 시 Kakao SDK 는 예외를 던짐.
- 페이지 라이프사이클당 1회로 충분. 재마운트되는 컴포넌트에서 호출해도 가드 덕에 안전.
- SSR 단계에서 호출되지 않도록 반드시 `typeof window !== "undefined"` 또는 `useEffect` 안에서 실행.

## 환경 변수

- **`NEXT_PUBLIC_KAKAO_APP_KEY`** — JavaScript 키. 공개 키이며 클라이언트 번들에 포함돼도 안전 (Kakao 설계상 public).
- Admin/REST/Native 키는 **절대 클라이언트에 노출 금지.** 이 프로젝트는 서버리스 + client-only Firebase 구조라 공개 키 외에는 필요 없다. 만약 REST 호출이 필요해지는 시점이 오면 Next.js Route Handler(서버) 로 분리.
- 개발자 로컬은 `.env.local`, 프로덕션은 Vercel Environment Variables 에 등록. 두 곳 외의 위치(예: 코드, `.env`, README 예시) 에 실제 키를 기록하지 않는다.
- **`.env.example` 은 실제 카카오 키 사용을 시작하는 커밋에서 추가** (본 규칙 커밋엔 포함하지 않음). `NEXT_PUBLIC_KAKAO_APP_KEY=` 같은 빈 문자열 샘플만.

## 도메인 등록 (Kakao 개발자 콘솔)

**카카오 콘솔은 도메인을 두 개의 다른 필드로 관리한다.** 둘 다 등록해야 공유 카드가 정상 동작한다 (2026-04-24 5주차 실기기 검증으로 확정).

| 필드                  | 콘솔 경로                             | 검증 대상                                                       |
| --------------------- | ------------------------------------- | --------------------------------------------------------------- |
| JavaScript SDK 도메인 | [앱] > 플랫폼 키 > JavaScript 키      | `Kakao.init()` 호출 허용 (origin)                               |
| **웹 도메인**         | **[앱] > 제품 링크 관리 > 웹 도메인** | **`content.link.webUrl` · `buttons[].link.webUrl` 호스트 검증** |

한 필드만 등록했을 때의 증상:

- **JavaScript SDK 도메인만 등록**: `Kakao.init()` 는 성공하고 `sendDefault` 도 에러 없이 카드를 보내지만, 카드 본문·버튼의 링크 호스트가 strip 돼서 PC 카톡에는 "모바일에서 확인해주세요", iPhone 에서는 카드 탭 무반응 + `공유하기` 버튼만 노출 (5주차 실기기 재현).
- **웹 도메인만 등록**: SDK 스크립트가 origin 미등록으로 거부 → `initKakao` silent skip → `isKakaoShareReady()` false → 폴백 경로(URL 복사 토스트) 로 자연 처리.

**필수 등록** (두 필드 모두에):

- 프로덕션 URL (예: `https://our-wedding.vercel.app`)
- `share.buttons.map` 활성 시 `https://map.kakao.com` 도 웹 도메인 쪽에 추가 — 아래 `buttons[].link.webUrl` 하위 섹션 참조
- 로컬 `http://localhost:3000` 은 아래 "dev 환경 검증 무효" 정책상 쓸모 없음 — 생략 권장

**Vercel 프리뷰 URL 은 등록 대상이 아니다.** 프리뷰는 커밋마다 서브도메인이 달라져 사전 등록 불가. 프리뷰에서는:

- SDK 스크립트 로드 및 초기화 에러 없이 진행되는지까지만 검증.
- 실제 `Kakao.Share.sendDefault` 는 "등록되지 않은 도메인" 에러로 실패할 수 있음 — 정상 동작.
- 전체 공유 플로우 (템플릿 렌더, 썸네일, 버튼 링크) 의 end-to-end 검증은 **반드시 프로덕션 도메인에서 실기기 + 카카오톡 설치 환경으로 수행.**

### `link.webUrl` 도 등록 도메인이어야 한다 — 미등록 시 default 로 강제 치환

`Kakao.Share.sendDefault` 의 `buttons[].link.webUrl` / `mobileWebUrl` 호스트가 콘솔 등록 도메인과 다르면 **카카오는 카드를 거부하지 않고 콘솔의 default 도메인으로 host 를 강제 치환**해서 카드를 만든다. path/query 만 우리가 보낸 값이 살아남고 host 는 사라짐. 받은 사람이 카드 버튼을 누르면 엉뚱한 default 도메인으로 이동.

- 카카오 디벨로퍼톡 공식 답변 (https://devtalk.kakao.com/t/localhost-3000/124973): "Links are only permitted for registered site domains; others redirect to the default domain."
- 4주차 dev 환경에서 직접 확인: `meta.siteUrl: "https://example.vercel.app"` (콘솔 미등록) + 콘솔 default `http://localhost:3000` 환경에서 보낸 카드 버튼이 `http://localhost:3000/...` 로 이동.

→ **`invitation.config.ts` 의 `meta.siteUrl` 은 카카오 콘솔 등록 도메인과 정확히 일치해야 한다.** dev 환경에서 카카오 공유 end-to-end 검증을 시도하지 말 것 — 콘솔에 localhost 를 default 로 등록 + meta.siteUrl 도 localhost 로 맞추는 임시 우회는 가능하지만 카카오 캐시·default 우선순위 등 추가 변수가 많아 시간 대비 가치 없음. 진짜 검증은 프로덕션 도메인 + 실기기 카카오톡으로만.

### `buttons[].link.webUrl` 의 외부 서비스 도메인도 각각 등록 필요

위 강제 치환 규칙은 `content.link` 뿐 아니라 **`buttons[].link` 에도 동일하게 적용된다.** 카드 본문 탭 URL 과 별개로 버튼별 링크 호스트가 웹 도메인에 없으면 그 버튼도 default 로 strip.

**5주차 실기기에서 걸린 사례 (2026-04-24)**:

- `share.buttons.site.link` → `meta.siteUrl = https://invitation-kit.vercel.app` (웹 도메인 등록 ✓) — 정상 동작
- `share.buttons.map.link` → `kakaoMapDeeplink` 가 반환하는 `https://map.kakao.com/link/to/...` (웹 도메인 미등록) — host strip → "지도 보기" 탭 시 청첩장 홈으로 이동하는 버그
- **`map.kakao.com` 을 우리 앱의 웹 도메인에 추가 등록하자 정상 동작.** 카카오 자사 도메인이라도 "다른 앱 관점에선 외부 도메인" 이라 별도 등록 필요.

운영 규칙:

- `share.buttons.map` 활성 시 웹 도메인에 `https://map.kakao.com` 추가 필수.
- 향후 네이버 지도 버튼 도입 시 `https://map.naver.com` 도 동일. 새 외부 딥링크 서비스 버튼 추가할 때마다 웹 도메인 등록 체크리스트에 포함.
- **v0.2+ 후보 (현 MVP 범위 밖)**: 우리 도메인 위에 `/map?to=...` redirect route (Next.js Route Handler 302) 를 두어 버튼 URL 호스트를 우리 도메인으로 고정 → 외부 서비스 도메인 등록 의존을 제거. 지금은 등록 한 줄로 해결되므로 MVP 스코프에선 채택 안 함.

## 공유 템플릿 원칙

- **default 템플릿 + `feed` 타입만 사용.** 커스텀 템플릿 ID 는 Kakao 콘솔에 별도 등록/심사가 필요해 OSS 배포 맥락에서 사용자별 설정이 복잡해진다.
- 필수 파라미터:
  - `title` — `invitation.config.ts` 의 `share.title`
  - `description` — `share.description`
  - `imageUrl` — `share.thumbnailUrl` (**반드시 절대 URL**, 호스트가 등록 도메인이어야 함)
  - `imageWidth`, `imageHeight` — 최소 Kakao 권장값 (현재 800×400 권장, 공식 docs 확인 후 반영)
  - `link.mobileWebUrl` / `link.webUrl` — 둘 다 `meta.siteUrl`
- **buttons 는 2개 이하 유지**. 스키마는 `invitation.config.ts` 의 `share.buttons.site` / `share.buttons.map` 고정 시그니처 — 배열 아님. URL 은 각각 `meta.siteUrl` · `venue.coords` 에서 자동 유도하고 사용자는 `enabled` / `label` 만 지정 (설계 근거는 `docs/adr/004-share-buttons-schema.md`):
  1. `site` — `"청첩장 보기"` → `meta.siteUrl` (기본 ON)
  2. `map` — `"지도 보기"` → 아래 카카오맵 딥링크 (기본 OFF)
- `buttons` 를 전부 끄거나 미설정 시 카드 전체가 `meta.siteUrl` 로 이동하는 효과 (Kakao feed 기본 동작). MVP 는 `site` 하나만으로도 충분.

## 카카오맵 딥링크 (SDK 미사용)

- URL 패턴: `https://map.kakao.com/link/to/{encodeURIComponent(name)},{lat},{lng}`
  - `name` 은 표시용 라벨. `venue.name` 그대로 사용하되 반드시 `encodeURIComponent`.
  - `lat`, `lng` 은 `venue.coords.lat`, `venue.coords.lng`.
- **`kakaomap://` 커스텀 스킴은 사용하지 않는다.** 이유:
  - 앱 미설치 시 브라우저가 "페이지를 열 수 없음" 에러로 떨어져 UX 가 최악.
  - iOS Safari 는 `kakaomap://` 를 사용자 제스처 없는 컨텍스트에서 차단함.
  - 위 HTTPS URL 하나로 앱 설치 시 자동으로 앱 열리고, 미설치 시 웹 카카오맵으로 폴백 — 운영상 단일 코드패스 유지가 훨씬 단순.
- SDK 의존 없음. `lib/map.ts` (또는 `lib/kakao.ts` 의 별도 export) 에 순수 함수로 분리.
- 네이버 지도 딥링크도 같은 파일에 형제 함수로 두는 걸 권장 (CLAUDE.md WHY 섹션의 "네이버·카카오 지도").

## Next.js 통합 패턴

- 카카오 관련 코드는 **전부 Client Component** (`'use client'`) — SDK 가 `window` 전역에 의존.
- **글로벌 Provider/Context 만들지 않음.** 공유 버튼은 보통 1~2 곳에서만 쓰므로 해당 컴포넌트 내부에서 init 하면 충분. 전역화는 오버엔지니어링.
- SDK 로드 실패·미초기화 케이스 **반드시 폴백 경로 마련**: 공유 버튼 클릭 시
  1. `window.Kakao?.Share?.sendDefault` 존재 체크
  2. 없으면 → URL 클립보드 복사 + "링크가 복사되었습니다" 토스트
  3. 이 폴백은 "카카오톡 미설치 데스크톱/인앱 웹뷰" 시나리오에서 특히 중요

## 테스트

- **데스크톱 Chrome/Safari**: `Kakao.Share.sendDefault` 호출 시 새 창에 카카오 웹 공유 UI 가 열림. 실제 공유는 불가하나 **템플릿 렌더·이미지 로드·버튼 링크** 를 눈으로 확인 가능.
- **실기기 카카오톡 end-to-end**: 공유 대화방으로 실제 카드 전송하여 썸네일·텍스트·버튼 탭 동작 모두 확인. iOS Safari 26 의 최근 SDK 관련 회귀 사례가 있으므로 별도 확인.
- **썸네일 캐시 무효화**: Kakao 가 `imageUrl` 을 자사 CDN 에 강하게 캐시한다. 이미지를 교체해도 즉시 반영되지 않음. 변경 후 즉시 검증하려면 `share.thumbnailUrl` 에 `?v={timestamp}` 쿼리스트링을 붙여 새 URL 로 취급시킴.

## Gotcha

- **인앱 웹뷰 제약**: 카카오톡 자체 웹뷰·인스타그램 웹뷰·페이스북 웹뷰 안에서 청첩장을 열면 `Kakao.Share.sendDefault` 가 실패하거나 무반응일 수 있다. 이 경우 "외부 브라우저(Safari/Chrome) 로 열어 공유해주세요" 안내가 필요. UI 에 전제 문구를 넣거나 User-Agent 분기로 버튼을 비활성화하는 선택지 있음 — MVP 에서는 공유 실패 시 폴백(링크 복사) 로 자연 해소되므로 별도 처리 안 해도 무방.
- **Vercel 프리뷰 공유 검증 불가**: 위 "도메인 등록" 참조. 공유 변경사항은 프리뷰에서 100% 검증되지 않는다는 전제로 PR 을 리뷰.
- **동일 URL 로 여러 번 공유 시 썸네일 고정**: Kakao 가 `imageUrl` 을 URL 키로 캐시하므로, 같은 URL 을 재공유하면 과거 캐시된 이미지가 노출된다. 임시 해결은 위 `?v=` 쿼리.

## 이 규칙 파일을 갱신해야 하는 순간

- Kakao JavaScript SDK 의 **메이저 버전** 이 바뀔 때 (v2 → v3 등)
- **카카오 콘솔 UI 개편** 으로 메뉴 경로·필드 이름이 바뀔 때 — "도메인 등록" 섹션 표가 필드·경로 이름을 참조 기준으로 쓰고 있음
- 공유 템플릿 구조 변경 (buttons 최대 개수, 새로운 템플릿 타입)
- **스코프 확장**: 카카오 로그인·페이먼츠·알림톡 등 도입 결정 시 — 별도 규칙 파일로 분리 권장
- `invitation.config.ts` 의 `share` / `venue` 블록 스키마가 변할 때 (이 문서가 필드명 기준으로 쓰여있음)

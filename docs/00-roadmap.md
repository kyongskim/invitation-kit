# 📍 invitation-kit · 12주 로드맵

> **살아있는 문서 (Living document).** 매 주차 끝날 때 이 문서를 업데이트하세요.
> 지난 주차는 "실제 한 것" 기준으로 기록하고, 남은 주차는 필요에 따라 재설계해도 됩니다.

**마지막 업데이트:** 2026-04-25 (8주차 Day1~Day3 완료 시점)

---

## 🎯 프로젝트 한 줄

한국 결혼식에 최적화된 오픈소스 모바일 청첩장 템플릿. Config 파일 하나만 수정하면 5분 안에 배포되는 `config-driven` 구조.

**기간:** 3개월(12주) · **시작일:** 2026-04-22 · **v1.0.0 목표:** 2026-06-30 (10주차 말)

---

## 📊 전체 진행 상황

| 단계                      |    주차    |    상태    | 마일스톤                                        |
| ------------------------- | :--------: | :--------: | ----------------------------------------------- |
| 1단계: 기획 + 셋업        |  Week 1-2  |  ✅ 완료   | 자동 배포 환경 + 디자인 토큰                    |
| 2단계: Must 기능 개발     |  Week 3-6  |  ✅ 완료   | v0.1.0 MVP                                      |
| 3단계: Should 기능 + 테마 |  Week 7-8  |  ✅ 완료   | 다중 테마 (Classic·Modern·Floral) + 방명록      |
| 4단계: 문서화 + QA        |   Week 9   | 🔄 진행 중 | 비개발자도 5분 배포 + v0.2 릴리스               |
| 5단계: 릴리스 + 홍보      | Week 10-11 |  ⏳ 예정   | v1.0.0 + 커뮤니티 공개                          |
| 6단계: 유지보수 기반      |  Week 12   |  ⏳ 예정   | 루틴 정착                                       |

**현재 진행도:** ⬛⬛⬛⬛⬛⬛⬛⬛⬜⬜⬜⬜ 8/12 주 (67%)

---

## ✅ 지난 주차 기록

> 이 섹션은 **실제로 한 것** 을 기준으로 작성합니다. 원래 계획과 달랐어도 괜찮아요. 실제 남긴 흔적이 가장 정확한 기록입니다.

### Week 1 · 기획 + 레퍼런스 분석

- **완료 기준:** README 초안, 기능 명세, 경쟁 분석
- **실제 결과물:**
  - `9e8202c` 레포 생성 + `invitation.config.ts` 스키마 초안 + 한/영 README 초안
  - `abb81f7` ADR 001 (App Router) + ADR 002 (config-driven 원칙)
  - `e299b47` `docs/04-design-decisions.md` — Classic 프리셋 확정 (팔레트 A Warm Beige + P1 Pretendard/Cormorant)
  - `6d9a6af` 이슈/PR 템플릿 + Issue #1 v0.1.0 MVP 마일스톤 등록
  - `f5b7a5b` 1주차 회고
- **배운 것:**
  - ADR 작성 직후에도 관련 문서(이슈 본문 등)에 과거 관례가 스며들 수 있어 교차 검토 필요
  - 팔레트·폰트 자유 조합은 유연성보다 궁합 실패·선택 피로 비용이 커서 v0.1.0은 프리셋 단일
  - Config-driven 템플릿은 레이아웃이 섹션 단위로 정형화돼 Figma 대신 텍스트 사양서로 충분
- **예상과 달랐던 점:**
  - 프로젝트 보드(칸반)는 단일 기여자 기준 중복이라 v0.1.0 이후로 연기
  - 디자인 레퍼런스 보드는 사용자가 Pinterest에 직접 채울 후속 TODO로 분리

### Week 2 · 프로젝트 셋업 + 디자인 토큰

- **완료 기준:** Next.js + CI + Vercel 자동배포 + 기본 테마 토큰
- **실제 결과물:**
  - `3bbb378` Next.js 16 초기화 (temp-dir + 화이트리스트 복사로 기존 파일 보존, ADR 003 스냅샷)
  - `a1ea246` Classic 팔레트 5색을 Tailwind v4 `@theme` 토큰으로 등록
  - `3216dc1` 커밋 컨벤션 한국어 우선 정책으로 업데이트 · `e5f7705` Pretendard + Cormorant self-host
  - `4de23be` Prettier 셋업 + `0081159` 기존 파일 일괄 포맷 + `3018926` GitHub Actions CI (lint/typecheck/format:check/build)
  - `5dc8b1d` 신랑·신부 이름 최소 메인 페이지 · `576e667` 2주차 회고 · `9a4e94d` CLAUDE.md 갱신
- **배운 것:**
  - `@latest` 는 문서가 가정한 버전과 달라질 수 있음 — snapshot은 ADR에 남기고 운영 문서에는 런타임 가드레일만
  - 비어있지 않은 디렉토리 scaffold 충돌 회피는 temp-dir + 화이트리스트가 표준 (`create-next-app .` 의 자동 충돌 해소 신뢰 금지)
  - Prettier 도입은 "설정 + 일괄 포맷 + CI 편입" 3 스텝 분리가 각 커밋 의미를 깔끔히 유지
- **예상과 달랐던 점:**
  - `create-next-app@latest` 가 Next 16.2.4 를 설치 (계획은 15) → ADR 003 으로 스냅샷 후 16 유지
  - `prettier-plugin-tailwindcss@latest` 가 `0.0.0-insiders.*` 인사이더 빌드였음 (Tailwind v4 호환용)

### Week 3 · Must 기능 전반전 (추정)

- **원래 계획:** 메인 · 인사말 · 갤러리 · Lightbox
- **실제 결과물:**
  - `a4ed074` `page.tsx` 의 inline JSX 를 `components/sections/Main.tsx` 로 분리 (`<main>` / `<section>` 소유권 규칙 확립)
  - `4a8864d` framer-motion 설치 + Main 히어로 CSS 페이드인 (첫 시도 iPhone 흰 화면 → CSS `@keyframes` 로 선회)
  - `256eee1` `.claude/rules/kakao-sdk.md` 초안 (117줄, 11개 섹션)
  - `invitation.config.ts` 스키마 오디트 — 코드 변경 없음, MVP 범위는 현 스키마로 이미 커버 확인
  - `85210b5` 3주차 회고
- **배운 것:**
  - framer-motion 의 `motion.* initial` 은 SSR HTML 에 invisible 인라인 스타일을 박는데 iOS Safari 26 에서 풀리지 않아 영구 invisible → on-mount 페이드는 CSS, framer-motion 은 `whileInView`/`AnimatePresence`/제스처 같은 JS-only 영역 전용
  - `translateY` 를 뷰포트 크기 섹션에 직접 걸면 스크롤바 플래시 발생 — 내부 텍스트 래퍼에만 적용
  - 모바일 Safari 1순위 원칙은 매 커밋마다 실기기 검증으로 풀어야 유효 (데스크톱 Chrome 만으론 SSR 제약을 놓침)
- **4주차로 넘긴 것:**
  - 태스크 1: `share` 스키마의 카카오 `buttons` 필드 결정 (+ ADR 기록)
  - 태스크 2: `.env.example` 생성 (`NEXT_PUBLIC_KAKAO_APP_KEY`)
  - 태스크 3: Greeting 섹션 도입 (`whileInView` 스크롤 트리거 첫 시도 예정)
  - 태스크 4: Venue 섹션 + 카카오맵 딥링크 (`lib/map.ts` 신규)
  - 태스크 5: 카카오톡 공유 버튼 (`Kakao.Share.sendDefault` + URL 복사 폴백)

### Week 4 · Must 기능 후반전 (예식 정보 + 공유)

- **원래 계획:** `share.buttons` 스키마, `.env.example`, Greeting, Venue + 카카오맵, 카카오톡 공유 — MVP Must 마감
- **실제 결과물:**
  - `522165a` `ShareConfig.buttons = { site?, map? }` 고정 시그니처 추가 + ADR 004 (배열 대신 고정 시그니처 근거 4가지)
  - `ef4a8bd` Greeting `whileInView` 첫 시도 → `89699a1` CSS `animate-fade-in-up` 으로 회귀 (iOS Safari 26 재현)
  - `2e94d43` 새로고침 시 첫 화면부터 나오도록 `scrollRestoration = "manual"` (보너스)
  - `6e9d3ac` Venue 섹션 + `lib/map.ts` 의 `kakaoMapDeeplink` (HTTPS URL 통일, `kakaomap://` 배제)
  - `ce69b73` Kakao SDK v2.8.1 (CDN + SRI 해시 직접 계산) + `shareInvitation` wrapper + URL 복사 폴백 + `.env.example`
  - `b04ee19` 4주차 회고 + kakao-sdk.md 에 `link.webUrl` 도메인 강제 치환 정책 명문화
- **배운 것:**
  - framer-motion 의 `initial → animate` 메커니즘 자체가 iOS 26 에서 깨짐 — 위치(히어로 vs 스크롤)와 무관. `whileInView` 도 동일하게 금지, CLAUDE.md "애니메이션 사용 규칙" 으로 영구화
  - 카카오는 콘솔 미등록 도메인의 `link.webUrl` 을 거부하지 않고 default 도메인으로 host 를 강제 치환 — dev 환경(localhost/LAN IP) 카카오 공유 end-to-end 는 카카오 정책상 정상 흐름 아님
  - CSS `@keyframes` 가 SSR-safe 한 이유: 브라우저가 JS 와 무관하게 keyframe 을 무조건 실행하므로 JS 가 안 돌아도 끝까지 진행 (framer-motion 은 JS animate 가 인라인 invisible 을 풀어야 함)
- **5주차로 넘긴 것:**
  - 태스크 1: Vercel 계정 생성 + 첫 배포 (카카오 공유 end-to-end 검증의 전제)
  - 태스크 2: 카카오 공유 end-to-end 실기기 검증
  - 태스크 3: 네이버 지도 형제 함수 + Venue 두 번째 버튼
  - 태스크 4: GitHub Actions Node 24 업그레이드 (2026-06-02 강제 전환 전)
  - 태스크 5: OG 이미지 제작·추가 · 태스크 6: README 작성

### Week 5 · Vercel 배포 + 카카오 공유 실검증 + MVP 현실화

- **원래 계획:** Vercel 첫 배포 · 카카오 공유 end-to-end · 네이버 지도 · Node 24 · OG 이미지 · README
- **실제 결과물:**
  - `80737ff` 12 주 로드맵 문서 신규 (1-4 주차 실제 기록 반영) · `ef4bf68` 그 문서 Prettier 포맷 정리
  - `0c3717a` `meta.siteUrl` + `share.thumbnailUrl` 프로덕션 도메인 (`invitation-kit.vercel.app`) 으로 치환 (Vercel 첫 배포 완료)
  - `20b215e` `.claude/rules/kakao-sdk.md` 에 새 콘솔 UI 의 도메인 2 필드 분리 표 + `buttons[].link.webUrl` 검증 하위 섹션 추가 (5 주차 실기기 검증 산물)
  - `c3463c2` `lib/map.ts` 에 `naverMapDeeplink` 추가 + Venue 섹션 두 번째 버튼 (네이버 지도)
  - `0864e02` `actions/checkout`·`actions/setup-node` v4 → v6 (Node 24 런타임 선제 대응)
  - `22e90ad` README 한·영 동시 현실화 — 1주차 aspirational draft 를 4-5 주차 실제 구현 기준으로 교체
  - `726c12b` OG 이미지 `public/images/og.png` (800×396) + `app/layout.tsx` 의 `openGraph`·`twitter` metadata (회고 작성 직후 이미지 자원 준비돼 태스크 5 마감)
- **배운 것:**
  - 카카오 콘솔이 UI 개편으로 도메인 2 필드 분리 (`JavaScript SDK 도메인` = init 허용 · `웹 도메인` = link.webUrl 검증). 한 필드만 등록하면 sendDefault 는 성공하지만 카드 안 링크가 strip 되어 PC "모바일에서 확인" / iPhone 탭 무반응 증상
  - `buttons[].link.webUrl` 도 `content.link` 와 동일 검증 대상 — "지도 보기" 가 청첩장 홈으로 이동하는 버그로 재현, `map.kakao.com` 을 웹 도메인에 추가해 해결. 카카오 자사 도메인도 "다른 앱 관점에선 외부 도메인"
  - Kakao 공유 증상 시 "폴백 경로 vs 정상 경로" 를 가르는 3 질문 (토스트·팝업·앱 열림) 은 Network 탭 없이 사용자 증언만으로 진단 가능
  - README 는 매 주차 종료 시 "모든 구체적 기능 언급이 실제 코드와 일치하는지" 리뷰 리듬이 필요. 4주 누적되면 fiction·dead link 로 OSS 첫 방문자 신뢰도 훼손
- **6주차로 넘긴 것:**
  - 태스크 1: 계좌번호 복사 섹션 (MVP Must 의 남은 핵심 기능)
  - 태스크 2: 사진 갤러리 + lightbox (사진 자원 블로커)
  - 태스크 3: D-day 카운트다운 (난이도 낮아 MVP 로 당길 수도)
  - 태스크 4: 인앱 웹뷰 안내 UI (UA 분기로 "외부 브라우저에서 열어주세요" 토스트)

### Week 6 · MVP Must 마감 + Should 당겨 포함 (v0.1.0 릴리스 직전)

- **원래 계획:** 계좌 복사 · 사진 갤러리 · D-day · 인앱 웹뷰 안내 — 5 주차 회고의 우선 후보 4 건
- **실제 결과물:**
  - `b704fb5` 계좌번호 복사 섹션 — `lib/clipboard.ts` (`copyText`) · `components/sections/Accounts.tsx` (아코디언 + 신랑/신부 토글 + 하이픈 제거 복사) · Share 섹션 헬퍼 공용화
  - `fa9b78f` 사진 갤러리 + 라이트박스 — CSS `columns-2 sm:columns-3` masonry + framer-motion `AnimatePresence` 조건부 마운트 라이트박스 (좌우 버튼 · ArrowLeft/Right · 스와이프 · 백드롭 · Escape · wrap-around) + body scroll lock. 사진 9 장 `sample-01 ~ sample-09.jpg`
  - `e059dcb` D-day 배지 (`lib/date.ts` · `components/DDayBadge.tsx`) → `61a468d` fix(dday): React 19 신규 rule `react-hooks/set-state-in-effect` 대응, `useSyncExternalStore` 기반 `useIsClient` 훅으로 리팩터
  - `84f1037` 인앱 웹뷰 감지 상단 배너 — `lib/userAgent.ts` + `components/InAppBrowserNotice.tsx`, sessionStorage dismiss
  - 사진 자원 정리 — `wed*.{jpg,png}` → `sample-*.jpg` 리네이밍 (wed02.png 는 q90 JPG 변환 914KB→128KB), `.gitignore` 의 `!sample-*.jpg` 예외 활용해 Vercel 배포 자산으로 편입
- **배운 것:**
  - React 19 `react-hooks/set-state-in-effect` rule 은 `useEffect` 안 `setState` 를 cascading render 로 경고. 로컬 `.eslintcache` 가 규칙을 캐시에서 놓쳐 "로컬 통과/CI 실패" 갈림 — 이후 품질 게이트에 `rm .eslintcache` 습관 편입. `useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)` 기반 `useIsClient` 훅이 Client Component 의 마운트 감지 기본 템플릿으로 자리 잡음 (2 곳에서 사용)
  - `AnimatePresence` 자식은 **조건부 마운트** 라 SSR HTML 에 요소 자체가 없음 → iOS Safari invisible 인라인 스타일 회귀와 무관. CLAUDE.md 애니메이션 규칙이 명시 허용한 "JS-only 영역" 첫 실사용 (Gallery 라이트박스)
  - OSS 템플릿의 `.gitignore` 에서 `!sample-*.jpg` 예외는 "교체 전제 데모 사진" 자리를 위한 설계. 본인 실사용 자원은 `wed*.jpg` 같은 다른 이름으로 fork 로컬에만 — 파일명 규칙으로 OSS 정체성과 개인 사이트 정체성 분리
- **7주차로 넘긴 것:**
  - 태스크 1: `v0.1.0` 태그 + `CHANGELOG.md` + GitHub Release 노트 (릴리스 가능 상태 도달, 7 주차 첫 세션 기본 추천)
  - 태스크 2: 다중 테마 시스템 설계 — Classic 외 Modern/Floral 2 종, `theme` config 값으로 폰트·팔레트·섹션 스타일 분기
  - 태스크 3: 방명록 (Firebase) — 원 Week 6 계획의 이월. `.claude/rules/firebase.md` 신규 필요
  - 태스크 4: 구글 캘린더 버튼 (`google.com/calendar/render` 딥링크, Venue 섹션)
  - **프로젝트 정체성 재확인 결과 v1.1 이후로 연기**: 웹 에디터 UI — 사용자 의도였으나 3 개월 로드맵 scope 밖. v0.1.0 릴리스 후 실사용 수요 보고 v1.1 방향 재검토

### Week 7 · v0.1.0 공개 릴리스 + 다중 테마 인프라 + 구글 캘린더

- **원래 계획:** v0.1.0 태그 + CHANGELOG + 릴리스 노트 · 다중 테마 리팩터 · 테마 2종 중 1종 착수 · (여유 시) 구글 캘린더 버튼
- **실제 결과물:**
  - `b629ba6` v0.1.0 릴리스 노트 · `CHANGELOG.md` (Keep a Changelog, 한국어 primary) · `package.json` 메타 6 필드 보강 (`author` · `repository` · `bugs` · `homepage` · `description` · `license`)
  - Annotated tag `v0.1.0` + GitHub Release `v0.1.0 — MVP 최초 릴리스` (published · Latest · 영문 summary + 한국어 본문)
  - `099f0b4` ADR 005 `다중 테마 전환 메커니즘 — data-theme 속성 + CSS 변수 override` (거부된 대안 A~E 포함, 147 줄)
  - `9f01ff2` `feat(theme)` — `app/globals.css` 에 `:root[data-theme="modern"]` override 블록 + `--radius-sm` 토큰, `app/layout.tsx` 에 Playfair Display 상시 로드 + `<html data-theme={config.theme}>`, `invitation.config.ts` union 을 `"classic" | "modern"` 로 축소 · 기본값 `"classic"`. **컴포넌트 파일 수정 0 건.**
  - `7a4ebac` `feat(calendar)` — `lib/calendar.ts` (googleCalendarUrl pure function, `YYYYMMDDTHHmmssZ` UTC 변환) + Venue 섹션 3 번째 버튼 "캘린더에 일정 추가". config 스키마 무변화.
- **배운 것:**
  - Tailwind v4 가 다중 커스텀 테마 공식 가이드 제공 안 함 — `:root[data-theme]` CSS 변수 cascade override 가 사실상 표준. `@theme` 가 토큰을 CSS 변수로 생성하는 성질 덕에 컴포넌트의 `bg-primary` · `rounded-sm` 등 토큰 유틸이 자동으로 테마 전환에 반응. **컴포넌트 수정 0 건** 이라는 이 접근의 핵심 이득은 ADR 005 의 거부된 대안 A~E 와 나란히 비교해 근거 고정
  - `@theme inline` modifier 는 토큰 참조를 CSS 에 박아버려 런타임 override 무효화 — ADR 에 "사용 금지" 명시
  - Tailwind v4 가 `--radius-sm` 같은 기본 토큰 네임스페이스를 사용자 정의로 덮어써도 `rounded-md/lg/full` 인접 유틸 생성은 자동 유지 — 프로덕션 CSS 빌드 artifact 직접 grep 으로 검증 (`.next/static/chunks/*.css`)
  - v0.1.0 태그 지점은 **CHANGELOG 커밋 (`b629ba6`)**. 처음 Plan 엔 `485055f` 가정이었으나 "태그 지점에 릴리스 아티팩트가 존재해야 한다" 는 제약 때문에 조정. Plan 리뷰 체크리스트 개선 포인트
  - CHANGELOG 이중언어는 매 릴리스마다 복리 동기화 비용 — 한국어 primary 단일 유지. README (이중언어) 정책과 분리
- **8주차로 넘긴 것:**
  - 태스크 1: Floral 테마 추가 (Week 7 인프라 위에 `:root[data-theme="floral"]` 블록 + union 확장 + Google Font serif 1 개로 가벼운 확장)
  - 태스크 2: 방명록 Firebase — `.claude/rules/firebase.md` 신규 (스키마 · 보안 규칙 · 비밀번호 해싱 · 욕설 필터) + Firestore 설정 + CRUD UI
  - 태스크 3: 구글 캘린더 실기기 검증 (Android 구글 앱 · iOS Safari 에서 KST 12:00 표시 확인) — 기회 생길 때
  - 후보: Modern accent 색 재검토 (`#e2e8f0` 이 약해 보이면 포인트 색 도입) — 사용자 피드백 트리거

### Week 8 · Floral 테마 + Firebase 방명록 + ADR 006 (Day1~Day3)

- **원래 계획:** Floral 테마 1종 · `firebase.md` 규칙 신규 · Firebase 프로젝트 + Firestore 초기화 · 방명록 CRUD + 욕설 필터 · (기회 시) 구글 캘린더 실기기 검증
- **실제 결과물:** Day1~Day3 누적 12 커밋
  - **Floral 테마 (`1f5b3a5` + `b52f44e`)**: `:root[data-theme="floral"]` Blush Rose & Mauve 팔레트 + Italiana serif + `--radius-sm: 0.625rem`. `ThemeName` union 3종 (`"classic" | "modern" | "floral"`). 컴포넌트 수정 0 건. **단, 인상 만족도 부족 → 재검토 보류 (메모리 항목)**
  - **`.claude/rules/firebase.md` 신규 (`c51fd39`)** — 스코프 5건 (in/out · SDK · 삭제 전략 C 채택 · 욕설 필터) 명문화. Progressive Disclosure placeholder 첫 실체화
  - **Firebase SDK 통합 (`3fd18bf`)** — `lib/firebase.ts` 싱글톤 (`getApps().length` 가드), `.env.example` 6 키, Firebase Console UI 갱신 (Standard / asia-northeast3 / 프로덕션 모드). 의존성 +1 (`firebase`)
  - **방명록 헬퍼 (`9887f2a`)** — `lib/hash.ts` (`hashPassword`, bcryptjs salt 10, 60자 고정), `lib/profanity.ts` (`containsProfanity` + badwords-ko 574 단어 내재화). 의존성 +1 (`bcryptjs`)
  - **`useIsClient` 추출 (`c1ac4a1`)** — rule-of-three 트리거. `lib/hooks.ts` 신설, DDayBadge·InAppBrowserNotice 마이그레이션. 회귀 0
  - **방명록 UI (`f06e325`)** — `components/sections/Guestbook.tsx` 신규. `getDocs` 1회 + optimistic prepend, 4상태 (loading/ready/error/empty), cancelled flag 패턴, Accounts↔Share 사이 마운트
  - **ADR 006 (`b71d365`) + 자음 변형 보강 (`ccc8c7a`)** — "ㅅㅂ 통과" 사례 트리거. 외부 패키지 (korcen) 거부 결정 명문화. `ADDITIONAL_PROFANITY` 별도 배열 10항목, false positive 위험 5건 (ㅗ·ㄴㄴ·ㅈㅅ·ㅂㄹ·ㅂㅂ) 의식적 제외
  - **`firestore.rules` + `firebase.json` 레포 포함 (`3412ef5`)** — 콘솔 미배포 deny-all 사례 후속. emulator 포트 8080 정의. `.firebaserc` 는 사용자별이라 `.gitignore`
  - **Guestbook 3분할 (`3b93f48`)** — 364줄 → 159 (orchestrator) + 196 (Form) + 69 (List). 책임별 분리, props 인터페이스 (`GuestbookSubmitInput`)
  - **메시지 삭제 운영자 안내 (`2ca5aee`)** — 폼 아래 "메시지 삭제는 신랑·신부에게 문의해주세요". 삭제 전략 C 경로의 UI 가시화
- **배운 것:**
  - 7주차 약속 ("컴포넌트 수정 0 건") 이 Floral 추가에서 그대로 통과. 단, 토큰 인프라가 자유롭다고 디자인 인상 결정도 자유로운 건 아님 — 재설정은 별도 세션 호흡
  - 규칙 파일 (`firebase.md`) 을 SDK 통합 *이전* 에 작성해두면 결정 (스코프 · 삭제 전략 · 욕설 필터) 이 코드보다 먼저 박혀 후속 변경이 "기존 결정의 연장" 으로 자연스러움. ADR 006 도 firebase.md 의 "변형 정규화 보류" 한 줄이 트리거 메모로 작동
  - `firestore.rules` 는 SDK 통합 커밋과 같이 레포에 두는 게 맞음. 별도 커밋으로 보강했지만 "프로덕션 모드 deny-all → Missing or insufficient permissions" 한 번 우회 가능 구간
  - React 19 `react-hooks/set-state-in-effect` 룰 재발 (5주차→6주차→8주차). firebase.md 메모를 "주의" → "fetch effect 는 초기 state 로 상태 표현, 동기 setState 절대 금지" 로 격상 후보
  - badwords-ko 가 정상 한글 표기 위주 → 자음 변형 (ㅅㅂ 등) 미커버. 외부 패키지 (korcen) 의 trade-off (Apache-2.0 NOTICE · bundle · 의존성) 가 청첩장 스코프엔 과도 — ADR 006 으로 자체 데이터 (`ADDITIONAL_PROFANITY`) 채택
  - `gh run view` polling 형태가 hook 정책에 false positive 차단 — `.claude/settings.json` 에 명시 허용 필요
- **9주차로 넘긴 것:**
  - 태스크 1 (회고 1번): v0.2 태그 + GitHub Release. v0.1.0 → v0.2 누적 12 커밋 묶어 릴리스. 7주차 v0.1.0 패턴 미러
  - 태스크 2 (회고 2번): Week 9 가이드 — `docs/config-guide.md` · `docs/api-keys.md` · `docs/theme-guide.md`. 비개발자 5분 배포 약속의 본격 준비
  - 태스크 3 (회고 3번): 구글 캘린더 실기기 검증. v0.2 배포 직후 자연 발생
  - 태스크 4 (회고 4번): firebase.md 의 set-state-in-effect 메모 격상. 1줄 수정
  - 태스크 5 (회고 5번): `.claude/settings.json` 의 `gh run view` polling 허용 명시
  - **보류 (사용자 트리거 시):** Floral 디자인 재설정, Modern accent 색 재검토

---

## 🔜 남은 주차 계획

> 지난 5주 경험을 반영해 재조정합니다. 여기 적힌 건 계획일 뿐, 주차가 끝날 때 "실제 한 것"으로 위 섹션에 옮겨 적으세요.

### Week 9 · v0.2 릴리스 + 비개발자 가이드 + 최종 QA 진입

**목표:** 8주차 누적 12 커밋을 v0.2 로 닫고, "비개발자도 5분 배포" 약속을 실제로 지킬 수 있도록 가이드 3종 작성. v1.0 직전 QA 의 시작.

- [ ] **v0.2 릴리스** — `CHANGELOG.md` 의 v0.2 섹션 (Modern·Floral · 캘린더 · 방명록 · firestore.rules 등 누적), annotated tag `v0.2.0`, GitHub Release 노트 (한국어 primary + 영문 summary). 7주차 v0.1.0 패턴 미러
- [ ] `docs/config-guide.md` — 모든 config 필드 설명 (meta · theme · groom·bride · venue · gallery · share · accounts · guestbook · music)
- [ ] `docs/api-keys.md` — 카카오/네이버/Firebase 키 발급 단계별 스크린샷. firebase.md 의 콘솔 가이드를 사용자 시점으로 재정리
- [ ] `docs/theme-guide.md` — 새 테마 기여 방법 (`:root[data-theme]` override + 폰트 변수 + ThemeName union)
- [ ] 구글 캘린더 실기기 검증 (Android 구글 앱 · iOS Safari) — v0.2 배포 직후 자연 발생
- [ ] firebase.md 의 set-state-in-effect 메모 격상 (1줄 수정)
- [ ] `.claude/settings.json` 에 `gh run view` polling 명시 허용
- [ ] (가능 시) `README.md` 스크린샷 · GIF · 데모 링크 정리. 5주차 현실화 이후 v1.0 대비 재정비

**보류 (사용자 트리거 시):**

- Floral 디자인 재설정 — 8주차 1차 구현 인상 부족, 별도 세션 호흡 필요
- Modern accent 색 (`#e2e8f0` 약함) — 실사용자 피드백 시

### Week 10 · v1.0.0 마감 + 릴리스

- [ ] `README.md` 영문 섹션 보강 (5주차 이후 변경 반영)
- [ ] 브라우저/기기 매트릭스 테스트 · Lighthouse 90+ 목표
- [ ] 성능 최적화 (이미지, 번들 사이즈)
- [ ] `CHANGELOG.md` v0.2 → v1.0.0 누적 정리 · 라이선스/저작권 고지 최종 점검
- [ ] 영상 튜토리얼 1개 (5~10분, YouTube 또는 Loom) — 선택
- [ ] v1.0.0 태그 + GitHub 릴리스 노트
- [ ] 데모 사이트 배포 (가상의 커플 예시)
- [ ] Product Hunt 제출 준비 (Ship 페이지)
- [ ] 홍보용 스크린샷/GIF 제작

### Week 11 · 공개 및 홍보

- [ ] velog/브런치에 개발 회고 포스트
- [ ] X/Twitter 쓰레드 (개발 과정 스토리텔링)
- [ ] OKKY, 개발자 Discord, 페이스북 그룹 공유
- [ ] Awesome Korean 개발자 리스트에 PR
- [ ] Hacker News "Show HN" 제출 (영문)
- [ ] 첫 외부 Contributor 환영 준비 (CONTRIBUTING.md 최종 점검)

**목표:** ⭐ 50개, 실사용 커플 1쌍 확보

### Week 12 · 유지보수 기반 다지기

- [ ] 들어온 이슈/PR 분류
- [ ] `v1.1` 마일스톤 정의 (RSVP, 웹 에디터 UI 등)
- [ ] 기여자에게 감사 표현 (릴리스 노트, README)
- [ ] 전체 회고 작성 (`docs/retrospective/project-v1.md`)
- [ ] 주 1~2회 이슈/PR 응답 루틴 정착

---

## 📐 로드맵 재조정 원칙

계획은 계획일 뿐이에요. 아래 조건이 맞으면 로드맵을 바꾸세요.

**바꿔도 되는 경우**

- 예상보다 한 기능이 크게 늘어남 → 주차를 늘리거나 Should → Could로 강등
- 새로운 요구사항 발견 (결혼 준비하며 "아 이것도 필요하네") → 우선순위 재검토
- 외부 사정 (결혼식 일정, 본업 바쁨) → 페이스 조절

**바꾸면 안 되는 경우**

- "재미없어서" 기본 기능 스킵 → MVP가 아닌 것만 남음
- "완벽하게 하고 싶어서" 한 기능에 3주 → 3개월 안에 완성 실패
- 새 트렌드에 혹해서 아키텍처 재설계 → 시간 블랙홀

**의심될 때 질문:** _"이걸 안 하면 v1.0을 공개할 수 없나?"_ 답이 NO면 v1.1로 넘기세요.

---

## 🔗 관련 문서

- 프로젝트 전체 기획: `docs/01-project-brief.md`
- 1주차 일자별 가이드: `docs/02-week01-daily-guide.md`
- Claude Code 세팅: `docs/03-claude-code-setup.md`
- 주차별 회고: `docs/retrospective/week-XX.md`
- 설계 결정 기록: `docs/adr/`
- Claude 작업 원칙: `CLAUDE.md`

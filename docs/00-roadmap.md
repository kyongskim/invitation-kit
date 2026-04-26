# 📍 invitation-kit · 12주 로드맵

> **살아있는 문서 (Living document).** 매 주차 끝날 때 이 문서를 업데이트하세요.
> 지난 주차는 "실제 한 것" 기준으로 기록하고, 남은 주차는 필요에 따라 재설계해도 됩니다.

**마지막 업데이트:** 2026-04-25 (12주차 마지막 호흡 — v1.0.0 closure)

---

## 🎯 프로젝트 한 줄

한국 결혼식에 최적화된 오픈소스 모바일 청첩장 템플릿. Config 파일 하나만 수정하면 5분 안에 배포되는 `config-driven` 구조.

**기간:** 3개월(12주) · **시작일:** 2026-04-22 · **v1.0.0 목표:** 2026-06-30 (10주차 말)

---

## 📊 전체 진행 상황

| 단계                       |   주차   |  상태   | 마일스톤                                                               |
| -------------------------- | :------: | :-----: | ---------------------------------------------------------------------- |
| 1단계: 기획 + 셋업         | Week 1-2 | ✅ 완료 | 자동 배포 환경 + 디자인 토큰                                           |
| 2단계: Must 기능 개발      | Week 3-6 | ✅ 완료 | v0.1.0 MVP                                                             |
| 3단계: Should 기능 + 테마  | Week 7-8 | ✅ 완료 | 다중 테마 (Classic·Modern·Floral) + 방명록                             |
| 4단계: 문서화 + QA         |  Week 9  | ✅ 완료 | 비개발자도 5분 배포 + v0.2 릴리스                                      |
| 5단계: v1.0 릴리스         | Week 10  | ✅ 완료 | v1.0.0 (데모 가시화 + Performance 측정 사이클 + CONTRIBUTING)          |
| 6단계: 홍보 (제외 결정)    | Week 11  | 🚫 스킵 | 본 12주 호흡 스코프에서 제외 (사용자 결정). velog 초안만 자산으로 보존 |
| 7단계: v1.0 보완 + closure | Week 12  | ✅ 완료 | 본인 삭제 (ADR 007 C') · PNG 최적화 · Performance lazy · v1.1 마일스톤 |

**현재 진행도:** ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛ 12/12 주 (100%) · v1.0.0 closure

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
  - 규칙 파일 (`firebase.md`) 을 SDK 통합 _이전_ 에 작성해두면 결정 (스코프 · 삭제 전략 · 욕설 필터) 이 코드보다 먼저 박혀 후속 변경이 "기존 결정의 연장" 으로 자연스러움. ADR 006 도 firebase.md 의 "변형 정규화 보류" 한 줄이 트리거 메모로 작동
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

### Week 9 · v0.2 릴리스 + 비개발자 가이드 3종 + 회고 우선 태스크 일괄 마감 (Day1~Day2)

- **원래 계획:** v0.2 태그 + 가이드 3종 (`api-keys` · `config-guide` · `theme-guide`) + 캘린더 실기기 검증 + firebase.md 메모 격상 + settings 명시 + quality gate 시퀀스 명시. 8주차 회고 우선 태스크 6 항목.
- **실제 결과물:** Day1~Day2 누적 10 커밋 (회고 커밋 제외)
  - **`v0.2.0` 릴리스 (`aa122f8`)** — `CHANGELOG.md` `[0.2.0]` 섹션 (Added 6 카테고리 · Changed 2 · Decisions 2 · Known Limitations 4 · Not yet 7), `package.json` `0.1.0 → 0.2.0`, annotated tag, GitHub Release Latest 공개. 7주차 `v0.1.0` (`b629ba6`) 패턴 미러
  - **표준 quality gate 시퀀스 (`c58b50f`)** — CLAUDE.md 라인 94 에 `rm -f .eslintcache && lint && typecheck && format:check && build` 명시. 회고 우선 6번
  - **`firebase.md` 환경변수 + Console 8단계 + Gotcha 영구화 (`b3ec400`)** — v0.2 직후 dev 만 동작 / prod 작성 실패 사례 후속. Vercel Environment Variables 6 키 등록 + Production·Preview 체크 + 재배포 단계 명시. 회고 외 보너스
  - **`firebase.md` set-state-in-effect 톤 격상 (`05f13fc`)** — "주의" → "절대 금지", fetch effect 초기 state 패턴 명시. 5주차→6주차→8주차 3 회 재발 후 회고 격상. 회고 우선 4번
  - **`docs/api-keys.md`** (204줄, `1851f89`) — 카카오 + Firebase 키 발급 사용자 시점. 카카오 도메인 2 필드 표 + Firebase Console 핵심 4 가지 + Vercel Production·Preview + 재배포 + 흔한 실수 5건. 회고 우선 2번 (1/3)
  - **`docs/config-guide.md`** (394줄, `212fd04`) — `invitation.config.ts` 11 top-level 키 전수, 표 + 외부 setup 박스 + 좌표 얻는 법·부모 한 분만 표기·iOS 자동재생 차단·CLS 방지 등 운영 시점 변형 패턴. 회고 우선 2번 (2/3)
  - **`docs/theme-guide.md`** (214줄, `988e5a8`) — 9 변수 토큰 카탈로그, 4번째 테마 (`vintage` 가상 시나리오) 5단계, Modern worked example + Floral 짧은 노트, 디자인 결정 가이드 + Gotcha 5건. 회고 우선 2번 (3/3)
  - **회고 우선 5번 가설 정정 (`c1e5348`)** — 8주차 회고 본문에 9주차 fact-check sub-bullet 추가. settings 변경 불필요 + 정답은 Monitor 도구 채택 (1순위) → Bash `run_in_background` + `until` 루프 (fallback). Day 2 Monitor 거부 케이스 1건 추가 finding 포함
  - **`b2af838` · `b934f9b`** — Prettier `format:check` 누락 fix-forward 2건 (Day 1 8주차 회고 / Day 2 가이드 3종). 8주차 동일 패턴 재발
  - **구글 캘린더 실기기 검증 통과** — Day 2 사용자 자가 검증 (Android Chrome / iOS Safari, KST 12:00 정상). 회고 우선 3번
- **배운 것:**
  - **회고 가설은 보존하고 정정은 인라인 sub-bullet 으로** — 회고 우선 5번 ("settings 추가") 진단 부정확 발견 후 본문은 그대로 두고 `### N번 9주차 fact-check` sub-bullet 으로 정정 박음. retroactive rewrite 로 가설을 지우면 학습 가치 사라짐. 회고 = 스냅샷 + 후속 패치 모델
  - **운영 갭은 한 사이클 안에서 영구화** — Vercel 환경변수 등록 누락 사례를 발견 → 진단 → `firebase.md` 영구화 → `api-keys.md` 흔한 실수 인용 → 회고 보너스까지 ~30 분. 사이클 길이가 길어지면 흐릿한 기억으로만 남고 영구화 안 됨
  - **README-Driven Documentation 의 ROI** — 가이드 3종 작성 자체가 코드 정합성 외부 검증으로 작동. `theme-guide.md` 의 9 변수 토큰 카탈로그 작성 과정에서 globals.css 와 의도 일치 재확인
  - **Plan Mode 의 ROI 는 작업 종류에 따라 다르다** — 문서 작성은 architecture 결정이 아니라 톤·범위·분량 합의가 핵심. Phase 2 의 Plan agent 는 본 호흡에서 skip. 시스템 reminder 보다 더 광범위한 skip 가능 영역
  - **회고 우선 태스크의 8 할은 small loop** — 1줄 수정 / 검증 / 가설 정정 / 회고 패치 같은 짧은 단위. 큰 분량 (가이드 3종) 은 하나뿐. v1.0 직전 우선 태스크 설계 시 자연스러운 비율
- **10주차로 넘긴 것:**
  - 태스크 1: README 영문 섹션 5주차 이후 동기화. 6·7·8·9주차 누적 변경 (다중 테마 · 캘린더 · 방명록 · 가이드 3종 · v0.2) 반영
  - 태스크 2: Lighthouse 90+ + 기기 매트릭스 (모바일 Safari · Android Chrome · 인앱 웹뷰)
  - 태스크 3: 데모 사이트 배포 (가상 커플) + README 데모 링크 + 스크린샷·GIF
  - 태스크 4: `v1.0.0` 태그 + GitHub Release. 7주차 v0.1.0 · 9주차 v0.2.0 패턴 미러
  - 태스크 5: CONTRIBUTING.md 최종 점검 (Week 11 외부 기여자 환영 준비)
  - 태스크 6 (작은): Vercel 환경변수 등록 누락 사례를 README 에도 한 줄. 현재는 firebase.md + api-keys.md 에만 박힘
  - **보류 (사용자 트리거 시):** Floral 디자인 재설정, Modern accent 색 재검토

### Week 10 · v1.0.0 마감 + 데모 가시화 + 첫 Performance 측정 사이클 (Day 1)

- **원래 계획:** README 영문 동기화 · Lighthouse 90+ + 기기 매트릭스 · 데모 사이트 · `v1.0.0` 태그 + Release · CONTRIBUTING.md · (작은) Vercel env 한 줄. 9주차 회고 우선 7 항목.
- **실제 결과물:** Day 1 단일 호흡 누적 7 커밋 (회고 커밋 제외) + annotated tag + GitHub Release Latest
  - **README 한·영 v0.2 동기화 (`8fc950e`)** — 5주차 `22e90ad` 이후 양쪽 README 모두 변경 0 였던 갭 해소. 한국어도 미갱신이었던 사실 발견 → 한·영 동시 1 커밋 확장. H2 9 개 양쪽 대칭, 라인 수 243/243. Quick Start 5 번 Firebase 단계 신규 (Vercel env 한 줄 자연 흡수, 회고 작은 후보 6번). Guides 섹션 신규.
  - **데모 섹션 신규 (`222234c`)** — `## 🎬 데모/Demo` H2 신규 (양쪽 H2 10 개로 확장). 데스크톱 풀페이지 + 모바일 4 컷 markdown 표 + 다중 테마 collage. `public/images/screenshots/` 6 PNG (~7MB). `invitation-kit.vercel.app` 자체가 가상 커플 (`김철수 ♥ 이영희`) OSS 데모로 작동.
  - **Lighthouse 측정 사이클 (`d378bb2` · `b1c30fd` · `82f30c7`)** — 1차 가설 두 개 (Gallery priority · text-secondary) 부정확 → 진단 audit detail 깊게 → 진짜 원인 = Pretendard variable 2MB. variable → 3 weight Korean subset 784KB (62% 절감). Performance 71 → 78, LCP 15.1 s → 5.1 s (-10 s).
  - **CONTRIBUTING.md (`2010211`)** — 한국어 only (가이드 3 종 정책 일관). 환영 4 종 + 환영 안 하는 5 종 + quality gate + 새 테마 PR 5 단계 + 모바일 Safari 의무 + 라이선스. README v1.0 targets 갱신.
  - **`v1.0.0` 릴리스 (`1a83c27` + tag + Release)** — 7주차 v0.1.0 / 9주차 v0.2.0 패턴 미러. CHANGELOG `[1.0.0]` (Performance 표 포함) + package.json 1.0.0 + annotated tag + GitHub Release Latest (한국어 primary + 영문 summary). 라이선스 점검 통과 (의존성 신규 0, Pretendard install/uninstall 후 dist 만 carry over).
- **배운 것:**
  - **회고 "넘기는 것" 명세는 시작 시점 가정 — 실 작업에서 확장될 수 있음** (1번 작업의 한국어 README 갭 발견). plan mode Phase 1 Explore 단계가 이 갭을 정확히 잡음 — `git log 22e90ad..HEAD` 같은 원자료 검증이 plan ROI 의 일부.
  - **Performance 가설은 측정으로만 검증 가능** — 1차 두 가설 (Gallery priority · text-secondary) 모두 부정확. 진단 audit detail (`network-requests`, `largest-contentful-paint-element`, `bootup-time`) 깊이 파야 진짜 원인 (Pretendard 2MB) 식별. 미래 Performance 작업 패턴: **데이터부터, 가설은 출발점일 뿐**. 다만 1차 가설의 코드 의도 옳으면 효과 미미해도 보존 (forward-only).
  - **Lighthouse CLI 한계 + simulate vs 실 환경 갭은 정직 기록** — desktop preset 측정 불안정 (LCP/TBT/TTI null), mobile simulate Slow 4G 78 점이 실 환경과 다름. v1.0 release notes Known Limitations 에 정직 기록 + 사용자 영역 (PSI 측정) 보강 안내. **점수 미달을 숨기지 않는 것이 OSS 신뢰 자산** — 인위적 micro-optimization 또는 measurement gaming 회피.
  - **Auto mode 운영 — 결정 명료 + 즉시 실행 + 끊을 수 있는 신호**. 사용자 "뭐 어떻게 하라고?" 피드백 후 학습. 옵션 4-5 개 나열은 결단력 부재 신호. 추천 1 안 즉시 실행 + "끊어줘" 한 줄로 멈출 수 있게. 다만 진짜 큰 의사결정 (디자인 D-1/D-2/D-3 같은) 은 옵션 합의 적절.
  - **Quality gate 1 패스 패턴 lock-in** — 8주차 (`b2af838`) · 9주차 (`b934f9b`) 두 차례 fix-forward 후 10주차 7 커밋 모두 1 패스. 표준 시퀀스 명시 (CLAUDE.md 라인 94, 9주차 `c58b50f`) + format → format:check 두 단계 + prettier 가 markdown table padding 자동 정렬한다는 인지의 누적 효과.
  - **v1.0 의 정직성 — "사이클 closure" vs "점수 closure" trade-off**. 회고 우선 2번 90+ 미달 (78점) 인데 closure 처리. 정의: 진단 → 수정 → 재측정 → 한계 발견 → 다음 후보 정리 → 사이클 완수. 인위적 미세 최적화로 90+ 만들기보다 정직 기록 + v1.1+ 후보 명시.
- **11주차로 넘긴 것 (회고와 동일):**
  - 태스크 1: velog/브런치 개발 회고 포스트 (12 주 호흡 전체)
  - 태스크 2: X/Twitter 쓰레드
  - 태스크 3: OKKY · Discord · 페이스북 그룹 공유
  - 태스크 4: Hacker News "Show HN" (영문)
  - 태스크 5: Awesome Korean 개발자 리스트 PR
  - 태스크 6: 첫 외부 Contributor 환영 (CONTRIBUTING.md 활용, 24h 응답 루틴)
  - 사용자 영역: 데스크톱 PSI 측정 + 실기기 매트릭스 (iPhone Safari · Galaxy Chrome · 카톡/Instagram 인앱)
  - v1.0 후속 (작은~큰): PNG 사이즈 최적화 · GIF 데모 · firebase·bcryptjs lazy · Pretendard dynamic-subset · text-primary contrast 결정
  - **보류 (사용자 트리거 시):** Floral 디자인 재설정, Modern accent 색 재검토, text-primary 색 결정

---

### Week 11 · 홍보 호흡 → 사용자 결정으로 본 12주 호흡 스코프 제외

- **원래 계획:** velog/브런치 개발 회고 · X 쓰레드 · OKKY · HN Show · Awesome Korean PR · 첫 외부 Contributor 환영
- **실제 결과물 + 결정:**
  - `5f7d2b3` velog/tistory 게시용 12주 호흡 회고 포스트 초안 (`docs/blog-posts/2026-04-25-12week-retrospective.md`, 한국어 ~4,000자, 코드 스니펫 5 + 이미지 2). 한국 개발자 커뮤니티 톤
  - GitHub 토픽 9개 적용 (`wedding-invitation` · `wedding` · `korean` · `nextjs` · `template` · `firebase` · `tailwindcss` · `kakao` · `oss-template`) — 검색 노출 자산
  - **사용자 결정 (호흡 중간)**: "홍보는 이번 프로젝트에서 제외하고 바로 유지보수나 보완 개선" → 11주차 본 항목 (게시·X·OKKY·HN·Awesome Korean) 모두 본 12주 호흡 스코프에서 제외
  - velog 글 보존 (게시는 사용자 페이스, 향후 개인 트리거 시) — 12주차 4번 전체 회고의 외부 톤 자매 자산
- **배운 것:**
  - **홍보 호흡과 보완 개발 호흡의 다른 성격** — 홍보는 외부 플랫폼 글 작성이 산출물, 보완은 코드/문서 변경이 산출물. 단일 기여자 사이드 프로젝트에서 두 호흡을 묶는 비용 (본업 외 시간) 이 클 수 있음
  - **closure 가 다음 범위를 좁힌다** (사용자 인용) — v1.0 이 박혀 있으니 v1.1 의 단위가 자연스럽게 작아짐. "딱 정해져있으니까 더 개발 범위가 좁혀지는 느낌" 사용자 표현이 정확. 이게 closure 의 ROI
  - **회고의 "다음 주차로 넘기는 것" 명세는 시작 시점 가정** — 11주차 시작 시점엔 홍보 호흡 진입을 가정했으나 호흡 중간에 사용자가 진짜 의도 (보완 개선 우선) 를 명시화. 회고가 가정이고 사용자 의지가 진짜 기준
- **12주차로 넘긴 것:**
  - velog 게시 (사용자 영역, 게시 보류)
  - 11주차의 다른 5 항목 (X · OKKY · HN · Awesome Korean · 외부 Contributor) 은 본 12주 호흡 스코프에서 영구 제외, v1.1+ 또는 별도 호흡 트리거 시

### Week 12 · v1.0 보완 + closure 호흡 (Day 1)

- **원래 계획:** 들어온 이슈/PR 분류 · v1.1 마일스톤 정의 · 기여자 감사 표현 · 전체 회고 · 응답 루틴 정착
- **실제 결과물 (4 호흡 누적):**
  1. **방명록 본인 삭제 (`d8aac0b` ADR 007 + `6b98acc` feat)** — 8주차 firebase.md 한정 결정 (C 경로) 을 ADR 007 으로 격상 + C → C' 전환 (클라이언트 검증 + delete 허용). 도메인 적정 트레이드오프 명시 + OSS 템플릿 정체성 보호 ("다른 도메인 fork 시 부적합") + v1.1+ B 경로 (Vercel Route Handler) 트리거 조건. 사용자 실 검증 통과 (Firebase Console 규칙 게시 후)
  2. **PNG 사이즈 최적화 (`807c40a`)** — `screenshots/` 디렉토리 7.1 MB → 2.7 MB (62% 절감). 5 PNG → JPG (q=85, sips), `theme-comparison.png` 은 collage 단색 영역 많아 PNG 유지. README · velog 글 src 일괄 갱신. 사이트 자체엔 미사용 (Lighthouse 영향 0) — GitHub README 페이지 로드 + 레포 위생 개선용
  3. **Performance lazy import (`53e75f4`)** — `app/page.tsx` 의 Guestbook 만 `next/dynamic` 분리. firebase + bcryptjs + framer-motion 모달이 별도 chunk. **가장 큰 chunk 463 KB → 309 KB (-33%)**. 90+ 도달 여부는 PSI 측정 결과로 검증 (사용자 영역, CHANGELOG Performance 항목 갱신 예정)
  4. **본 호흡 — v1.1 마일스톤 정의 + 전체 회고** — Week 11/12 결과 채우기 + v1.1+ 후보 압축 + `docs/retrospective/project-v1.md` 신규 + CHANGELOG `[1.0.1]` 또는 `[Unreleased]` 마무리
- **배운 것 (호흡 중 발견):**
  - **`react-hooks/set-state-in-effect` 룰 4번째 재발** (5주차→6주차→8주차→**12주차**). DeleteConfirmModal 의 useEffect 안 setState 가 1차 lint 에서 잡힘. firebase.md 의 "절대 금지" 톤 격상 (9주차 `05f13fc`) 이 정확히 작동. **AnimatePresence 부모 마운트 패턴**으로 우회 — 모달 컴포넌트 자체가 mount/unmount 되니 useState 초기값으로 자동 reset, useEffect 안 setState 자체 제거. 회고 격상 + quality gate 시퀀스 lock-in 의 ROI 실증
  - **사용자 의도와 호흡 중간의 진짜 결정 트리거** — "방명록 삭제 기능은 구현 안하는거야?" → "비밀번호 일치되면 삭제 가능" 흐름이 8주차 ADR 없이 firebase.md 만 박혔던 결정의 12주차 재검토 트리거가 됨. 회고에 묻혀있던 결정도 사용자 호흡 중 트리거로 다시 살아남
  - **사용자 제안 시나리오 (웹 에디터 UI / SaaS) 의 정체성 전환 함의** — v1.x (개발자 fork) → v2.0 (SaaS) 가 단순 기능 추가가 아니라 운영 책임·법적 주체·인프라 모두 다른 별도 프로젝트라는 명료화. 본 12주는 v1.0 OSS 템플릿으로 closure, v2.0 은 별도 호흡 의지 시점에 새 출발
- **closure 시점 산출물 (예정):** v1.0.x 또는 [Unreleased] 단계의 CHANGELOG · `docs/retrospective/project-v1.md` · v1.1+ 마일스톤 명세 (본 로드맵의 다음 섹션)

---

## 🚀 v1.1+ 마일스톤

> 본 12주 호흡 closure 후 후속 호흡 후보. v1.0 까지의 학습 + 회고 + ADR 의 누적이 다음 호흡의 좁아진 범위를 자연 결정. 외부 사용자 트래픽 0 인 상태에선 추측 기반이라 가벼운 명세로 유지, 실수요 보고 시 우선순위 재조정.

### v1.1 (1순위 후보 — 작은 보완 + 신기능 1~2)

- ✅ **text-primary contrast 결정** (D-3 보류) — Classic `#c9a87c` 2.08:1 → `#896536` 4.90:1, Floral `#d4a5a5` 2.05:1 → `#9a6464` 4.55:1 (Floral 도 같은 결손이라 동시 fix). 옵션 A (어둡게 조정) 채택, 옵션 B (보류 + ADR 격상) 거부. v1.1+ 2번째 커밋
- ✅ **OG png 최적화** — `631 KB → 143 KB` (q=85, sips, −77%) + 카카오 캐시 무효화 `?v=2`. v1.1+ 1번째 커밋 (`59c0092`)
- ✅ **App Check** — `ReCaptchaV3Provider` + Console enforcement 토글 + graceful degradation. ADR 009 (거부 대안 5종) + lib/firebase.ts initializeAppCheck. v1.1+ 5번째 호흡
- **i18n** — 한국어/영문 분기. 한·영 README 자산 위에 코드 i18n. 1~2 호흡
- ✅ **RSVP** — Firestore `rsvp` 컬렉션 + 5 필드 + read 차단 + 마감일 클라이언트 비활성. ADR 008 (거부 대안 6종) + components/sections/RSVP.tsx + RSVPForm. v1.1+ 3번째 호흡
- **본인 삭제 서버 매개 (ADR 007 B 경로)** — Vercel Route Handler + Admin SDK. 트리거 충족 시 (vandalism 사례 또는 작성자 풀 100명+)
- **Pretendard dynamic-subset** — Performance 90+ 시도. 12주차 lazy import 후 PSI 결과에 따라 우선순위. 큰 호흡 (next/font 우회 결정)

### v1.1.x 사용자 트리거 추가 (로드맵 외 즉흥)

- ✅ **결혼식 달의 달력 섹션** — Greeting 과 Gallery 사이 7×N 그리드 + 결혼식 날 원 강조 + "2026년 5월 17일 토 12:00" 한 줄. 한국 청첩장 표준 패턴, 사용자 D-21 시점 즉흥 요청. v1.1+ 7번째 호흡

### v1.2+ (여유 시 후보)

- ✅ **BGM** — 우상단 floating 토글 + fade 300ms + loop. 자동재생 시도 X (iOS 무음 모드 호환). 음원 ship X (OSS 라이선스). v1.1+ 호흡 4번째로 앞당겨 진입
- ✅ **Apple Calendar** 추가 — `appleCalendarUrl` (RFC 5545 + data URL) + Venue 두 번째 버튼. v1.1+ 6번째 호흡
- **GIF 데모** — 갤러리 swipe 인터랙션 (정적 SS 못 잡는 부분)
- **욕설 필터 외부 패키지** (ADR 006 트리거) — `ADDITIONAL_PROFANITY` 50 항목 초과 또는 변형 우회 30건 보고 시 재검토

### 보류 (사용자 트리거 시)

- **Floral 디자인 재설정** — 8주차 1차 구현 인상 부족. `project_floral_theme_redesign_pending.md` 메모리 항목
- **Modern accent 색 재검토** (`#e2e8f0` 약함) — 실 사용자 피드백 시

### v2.0 (별도 호흡 의도서 — 본 v1.x 폐기 X)

> 12주차 마무리 호흡 중 사용자 제안: **비개발자 사용자가 UI 부터 단계별 입력해서 결과물이 딱 나오는 시나리오** (웹 에디터 / SaaS). 본 OSS 템플릿 정체성 (개발자 fork 모델) 과 정체성 자체가 다른 별도 프로젝트로 분리. 본 v1.x 는 그대로 유지.

- **트리거 조건**: 본인 결혼식 후 + 운영 인프라·결제·법적 주체 (개인정보보호법 준수) 결정
- **분리 형태**: 별도 레포 또는 본 레포 안 `v2/` 디렉토리 (TBD). 큰 결정이라 그 시점에 결정
- **현 상태**: 본 12주 호흡 스코프 밖. 의지 박아두기만

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

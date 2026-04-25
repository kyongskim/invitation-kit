# Changelog

이 프로젝트의 주요 변경사항을 이 파일에 기록합니다.

포맷은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) 을 따르며, 버전 표기는 [Semantic Versioning](https://semver.org/lang/ko/) 을 따릅니다.

## [0.2.0] - 2026-04-25

8주차 누적 — 다중 테마 인프라 (Modern · Floral) · 구글 캘린더 일정 추가 · Firebase Firestore 방명록 · 운영 결정 명문화 (ADR 005·006).

### Added

- **Modern 테마 + 다중 테마 전환 인프라** (`9f01ff2`) — `:root[data-theme="modern"]` CSS 변수 override 블록, `--radius-sm` 토큰, `app/layout.tsx` 의 Playfair Display 상시 로드 + `<html data-theme={config.theme}>`. `ThemeName` union 도입 (`invitation.config.ts`). **컴포넌트 파일 수정 0 건** — 토큰 인프라가 자동 전환 흡수.
- **Floral 테마** (`1f5b3a5` · `b52f44e`) — Blush Rose & Mauve 팔레트 5색 + Italiana serif (`next/font/google` 상시 로드, `--font-italiana`) + `--radius-sm: 0.625rem`. `ThemeName` union `"classic" | "modern" | "floral"` 3종 확정.
- **구글 캘린더 일정 추가 버튼** (`7a4ebac`) — `lib/calendar.ts` 의 `googleCalendarUrl` pure function (UTC `YYYYMMDDTHHmmssZ` 변환), Venue 섹션 3번째 버튼. config 스키마 무변화.
- **방명록 (Firebase Firestore)** (`f06e325` · `9887f2a` · `ccc8c7a` · `3b93f48` · `2ca5aee`) — `getDocs` 1회 + 작성 후 optimistic prepend, 4상태 (loading / ready / error / empty), cancelled flag 패턴 (Strict Mode + React 19 `react-hooks/set-state-in-effect` 동시 대응). `bcryptjs` 비밀번호 해싱 (salt 10, 60자 고정), `badwords-ko` 574 단어 (MIT 내재화) + `ADDITIONAL_PROFANITY` 자음 변형 10종 (자체 데이터). 메시지 삭제는 운영자 문의 (Firebase Console 수동) — MVP `allow delete: if false` UI 가시화. 단일 파일 364줄 → orchestrator (159) + Form (196) + List (69) 3분할 (`components/sections/Guestbook.tsx` + `components/sections/guestbook/`).
- **레포 인프라** — `firestore.rules` · `firebase.json` 레포 루트 (`3412ef5`), `lib/firebase.ts` (Firestore db 싱글톤 + `getApps().length` HMR 가드), `lib/hash.ts` (`hashPassword`), `lib/profanity.ts` (`containsProfanity` + 두 배열 분리), `lib/hooks.ts` (`useIsClient` 추출, useSyncExternalStore 기반).
- **`.env.example`** — Firebase 6 키 (`NEXT_PUBLIC_FIREBASE_*`) 빈 값 샘플 추가.
- **문서** — ADR 005 (`다중 테마 전환 메커니즘 — data-theme 속성 + CSS 변수 override`), ADR 006 (`욕설 필터 자음 변형 보강 전략`), `.claude/rules/firebase.md` (스코프 5건 · 삭제 전략 C 채택 · 욕설 필터 정책 · 콘솔 가이드 · 60자 해시 보안 규칙).

### Changed

- **`useIsClient` 추출** (`c1ac4a1`) — `DDayBadge.tsx` · `InAppBrowserNotice.tsx` 의 동일 구현이 방명록 form 에서 3번째 사용처가 되며 `lib/hooks.ts` 로 이동 (rule of three). 두 컴포넌트 회귀 0.
- **Guestbook 3분할** (`3b93f48`) — 단일 파일이 200줄 가이드 초과 (364줄). 데이터 fetch (orchestrator) ↔ 입력 검증 (Form) ↔ 표시 (List) 책임 분리. `GuestbookSubmitInput` 객체 prop 으로 통신, `profanityFilterOn` · `minPasswordLength` 는 prop 패스다운.

### Decisions

- **ADR 005** — `:root[data-theme]` + CSS 변수 override 채택. 거부된 대안 A~E (Tailwind preset · CSS-in-JS · class-based · 조건부 import · 별도 빌드) 와 비교 근거 명문화. **컴포넌트 수정 0 건** 으로 7주차 약속 실증.
- **ADR 006** — 욕설 필터 외부 패키지 (`korcen` Apache-2.0 등) 거부, 자체 데이터 (`ADDITIONAL_PROFANITY`) 채택. 거부 근거 5건 (의존성 비용 · NOTICE 의무 · bundle 미측정 · 유지보수 외부화 · 사용 강도 불일치). 재검토 트리거 3건 (50 항목 초과 · 30건 우회 보고 · 작성자 100명+).

### Known Limitations

- **방명록 본인 삭제 미지원** — 보안 규칙은 `allow delete: if false`. 운영자가 Firebase Console 에서 수동 삭제. Firebase Auth 없이 비밀번호 기반 삭제는 룰만으로 안전 구현 불가 (vandalism 가능). v1.0 이후 Cloud Function 프록시 (A 경로) 도입 검토. 자세한 비교는 [`.claude/rules/firebase.md`](.claude/rules/firebase.md) 의 "삭제 전략" 섹션.
- **욕설 필터는 클라이언트 단순 substring 매치** — DevTools 우회 가능. 한국 결혼식 방명록 실명 문화 + 비개발자 하객 대부분 기본 플로우 가정. 프로덕션 우회 사례 발생 시 Cloud Function 프록시와 묶어 재설계.
- **Floral 테마 디자인 인상 부족** — Blush Rose & Mauve + Italiana 1차 구현 후 Modern 만큼의 차별 미달. 재검토는 별도 세션 호흡 — 사용자 트리거 시까지 자동 재진입 금지 (8주차 회고 결정).
- **카카오 콘솔 도메인 등록 + Firebase Authorized Domains** — OSS fork 사용자별 작업. v0.1.0 이후 변경 없음.

### Not yet (v1.0 목표 — 10주차)

- 비개발자 5분 배포 가이드 — `docs/config-guide.md` (모든 config 필드 설명) · `docs/api-keys.md` (카카오·네이버·Firebase 키 발급 단계별 스크린샷) · `docs/theme-guide.md` (새 테마 기여 방법)
- README 영문 섹션 보강 (5주차 이후 변경 반영)
- Lighthouse 90+ · 브라우저/기기 매트릭스 테스트 · 이미지·번들 사이즈 최적화
- 구글 캘린더 실기기 검증 (Android 구글 앱 · iOS Safari 에서 KST 12:00 표시 확인)

### Not yet (v1.1+ 후보)

- 웹 에디터 UI (비개발자 대상 SaaS 방향, 실사용 수요 보고 재검토)
- RSVP · 참석 여부 응답
- 다국어 UI
- BGM · 배경음악
- Apple Calendar 일정 추가
- 방명록 본인 삭제 (Cloud Function 프록시 A 경로)
- App Check (방명록 스팸·스크래핑 방지)

### 설치·배포

1. [GitHub 리포](https://github.com/kyongskim/invitation-kit) 를 Fork.
2. `invitation.config.ts` 를 본인 결혼식 정보로 수정 (`theme: "classic" | "modern" | "floral"` 선택).
3. `public/images/gallery/` 에 본인 사진을 `sample-0N.jpg` 파일명으로 교체.
4. Vercel 에 연결 — `NEXT_PUBLIC_KAKAO_APP_KEY` (선택) + `NEXT_PUBLIC_FIREBASE_*` 6 키 (방명록 사용 시) 환경 변수 설정.
5. 카카오 개발자 콘솔에 JavaScript SDK 도메인 + 웹 도메인 두 필드에 프로덕션 URL 등록 (+ `map.kakao.com`).
6. Firebase Console 에서 Firestore Database 생성 (Standard edition · `asia-northeast3` · 프로덕션 모드) → 보안 규칙 탭에 `firestore.rules` 본문 붙여넣기.

세부 가이드는 [README.md](README.md) · [`.claude/rules/firebase.md`](.claude/rules/firebase.md) 참조.

## [0.1.0] - 2026-04-25

한국 결혼식에 최적화된 오픈소스 모바일 청첩장 템플릿의 첫 공개 릴리스. MVP Must 기능 6 건 + Should 기능 2 건 포함.

### Added

- **메인 히어로** — 신랑·신부 이름, 결혼식 날짜, 자동 계산 D-day 배지 (`components/sections/Main.tsx` · `components/DDayBadge.tsx` · `lib/date.ts`).
- **인사말 (Greeting) 섹션** — config 의 문단 배열을 CSS `animate-fade-in-up` 페이드인으로 표시 (`components/sections/Greeting.tsx`).
- **사진 갤러리 + 라이트박스** — CSS columns 기반 masonry + framer-motion `AnimatePresence` 조건부 마운트 라이트박스. 좌우 버튼 · ArrowLeft/Right · 터치 스와이프 (100px threshold) · 백드롭 탭 · Escape · wrap-around 순환 지원. `next/image` 최적화 + body scroll lock (`components/sections/Gallery.tsx`).
- **예식장 정보 (Venue) 섹션** — 주소 · 교통편 · 카카오맵 / 네이버 지도 딥링크 버튼 (`components/sections/Venue.tsx` · `lib/map.ts`).
- **계좌번호 복사 (Accounts) 섹션** — 신랑/신부 세그먼트 토글 + 아코디언 (CSS `grid-template-rows 0fr↔1fr`). 하이픈 제거 복사 (일부 은행 앱 파싱 대응), 카카오페이 · 토스 딥링크는 config 에 URL 있을 때만 조건부 렌더 (`components/sections/Accounts.tsx` · `lib/clipboard.ts`).
- **카카오톡 공유 (Share) 섹션** — Kakao JavaScript SDK v2 `Kakao.Share.sendDefault` feed 템플릿. SDK 미초기화 · 인앱 웹뷰 · 데스크톱 등 실패 상황엔 URL 클립보드 복사 폴백 자동 동작 (`components/sections/Share.tsx` · `lib/kakao.ts`).
- **인앱 웹뷰 안내 배너** — 카카오톡 · Instagram · Facebook · 네이버 · Line 웹뷰 감지 시 상단에 "외부 브라우저로 열어주세요" 배너. `sessionStorage` dismiss (같은 탭엔 재노출 안 함) (`components/InAppBrowserNotice.tsx` · `lib/userAgent.ts`).
- **OG 메타 태그** — 카카오톡 · iMessage · Twitter 미리보기 썸네일 (800×396 `public/images/og.png`, `app/layout.tsx` 의 `openGraph` · `twitter` metadata).
- **Classic 테마** — Warm Beige 팔레트 (5색) + Pretendard (self-host) + Cormorant Garamond. Tailwind v4 `@theme` 토큰으로 정의 (`app/globals.css`).
- **Config-driven 구조** — `invitation.config.ts` 한 파일만 수정하면 배포 가능. top-level: `meta` · `theme` · `groom` · `bride` · `date` · `venue` · `greeting` · `gallery` · `accounts` · `share` · `guestbook` · `music` · `closing`.
- **기술 스택** — Next.js 16 (App Router · Turbopack) · TypeScript · Tailwind CSS v4 · React 19 · framer-motion 12.
- **GitHub Actions CI** — lint · typecheck · format:check · build 4-job 매트릭스. PR 과 main push 에서 모두 실행.
- **Vercel 자동 배포** — main push 시 프로덕션, PR 시 프리뷰 환경 자동 생성.
- **React 19 `useSyncExternalStore` 기반 `useIsClient` 패턴** — Client Component 마운트 감지 표준 (D-day 배지 · 인앱 안내 배너 공통 사용). `react-hooks/set-state-in-effect` rule 우회용.
- **문서** — 한국어·영어 이중언어 README · 4 개 ADR (App Router · Config-driven · Next.js 16 · share.buttons 스키마) · 12 주 로드맵 · 주차별 회고 6 건.

### Known Limitations

- **카카오톡 공유 검증은 프로덕션 도메인 + 실기기 전제.** Vercel 프리뷰 URL 은 커밋마다 서브도메인이 달라 카카오 콘솔에 사전 등록 불가. 프리뷰에서는 SDK 로드·초기화까지만 검증되며, `Kakao.Share.sendDefault` end-to-end 는 프로덕션 도메인 + 실기기 카카오톡 환경에서만 가능. 자세한 정책 배경은 [`.claude/rules/kakao-sdk.md`](.claude/rules/kakao-sdk.md).
- **인앱 웹뷰 환경의 카카오 공유 제한.** 카카오톡 자체 웹뷰 · Instagram / Facebook 인앱 브라우저에서 `Kakao.Share.sendDefault` 는 실패하거나 무반응일 수 있음. 상단 배너가 외부 브라우저로 유도하며, 공유 실패 시 URL 복사 폴백이 자동 동작.
- **샘플 사진 저해상도.** 리포에 포함된 `public/images/gallery/sample-0[1-9].jpg` 9 장은 데모용이며 긴 변 330~1200px 범위로, 일부는 레티나 모바일 뷰포트에서 흐릿할 수 있음. 실사용 시 긴 변 1600~2400px 권장 해상도 파일로 교체.
- **v0.1.0 단일 테마.** 현재 Classic 팔레트·폰트 고정. 다중 테마 (Modern · Floral 등 2+ 종) 는 v1.0 에서 도입 예정.
- **iOS Safari 26 framer-motion 회귀 대응.** `motion.*` 의 `initial → animate` / `whileInView` 는 SSR HTML 에 invisible 인라인 스타일을 박고 hydration 후 풀리지 않는 회귀가 있어 사용 금지. 진입 애니메이션은 CSS `@keyframes` 로, framer-motion 은 `AnimatePresence` · 제스처 · 명시적 인터랙션 트리거에만 사용. (`CLAUDE.md` 애니메이션 사용 규칙 참조)

### Not yet (v1.0 목표 — 10주차)

- 다중 테마 시스템 (Classic 외 Modern · Floral 등 2+ 종, `theme` config 값으로 폰트·팔레트·섹션 스타일 분기)
- 방명록 (Firebase Firestore · 비밀번호 해싱 · 욕설 필터)
- 구글 캘린더 일정 추가 버튼 (`google.com/calendar/render` 딥링크, Venue 섹션)

### Not yet (v1.1+ 후보)

- 웹 에디터 UI (비개발자 대상 SaaS 방향. 3개월 MVP 스코프 밖, v0.1.0 실사용 수요 보고 재검토)
- RSVP · 참석 여부 응답
- 다국어 UI
- BGM · 배경음악
- 결제 연동

### 설치·배포

1. [GitHub 리포](https://github.com/kyongskim/invitation-kit) 를 Fork.
2. `invitation.config.ts` 를 본인 결혼식 정보로 수정.
3. `public/images/gallery/` 에 본인 사진을 `sample-0N.jpg` 파일명으로 교체 (또는 `.gitignore` 의 `!sample-*.jpg` 예외 패턴 확인 후 네이밍 조정).
4. Vercel 에 연결 — `NEXT_PUBLIC_KAKAO_APP_KEY` 환경 변수 설정 (선택, 비우면 URL 복사 폴백).
5. 카카오 개발자 콘솔에서 JavaScript SDK 도메인 + 웹 도메인 두 필드에 프로덕션 URL 등록 (+ `map.kakao.com`).

세부 가이드는 [README.md](README.md) 참조.

[0.2.0]: https://github.com/kyongskim/invitation-kit/releases/tag/v0.2.0
[0.1.0]: https://github.com/kyongskim/invitation-kit/releases/tag/v0.1.0

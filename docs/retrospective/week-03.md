# 3주차 회고 (2026-04-24)

> 다음 세션에서 읽을 사람은 이 파일만 봐도 3주차 결과와 4주차 진입 상태를 파악할 수 있어야 합니다.

---

## 완료한 것

### 태스크 1 · `components/sections/Main.tsx` 분리 (`a4ed074`)

- 2주차 Day 6 의 inline JSX 를 `components/sections/Main.tsx` 로 이전
- `app/page.tsx` 는 `<main className="flex flex-col">` 컨테이너 역할로 축소 — 이후 섹션들이 누적될 레일
- **규칙 1**: 섹션 컴포넌트는 `<section>` 을 렌더, `<main>` 은 `app/page.tsx` 가 소유
- **규칙 2**: 섹션 컴포넌트는 `invitation.config` 를 직접 import (props 주입 X) — CLAUDE.md "Config-driven 절대 원칙" 의 해석
- 시각 결과는 2주차 Day 6 과 동일. 첫 CI 런 38s 그린

### 태스크 2 · Framer Motion 설치 + Main 히어로 CSS 페이드인 (`4a8864d`)

- `framer-motion@^12.38.0` 을 dependency 로 추가. CLAUDE.md 스택 정의 준수
- **첫 시도(폐기)**: `motion.section` + `useReducedMotion`, Main 을 client component 화. 데스크톱 정상, iPhone 에서 흰 화면
- **최종 선택**: on-mount 페이드는 **CSS `@keyframes fade-in-up`** 으로 구현. Main 은 다시 Server Component. framer-motion 패키지는 유지 (whileInView 스크롤 트리거가 어울리는 Greeting/Gallery 에서 사용 예정)
- `globals.css` 에 `@theme { --animate-fade-in-up }` 토큰 등록 → Tailwind v4 가 `.animate-fade-in-up` 유틸리티 자동 생성. `@media (prefers-reduced-motion: reduce)` 로 transform 비활성화 분기
- `translateY(16px)` 는 viewport 를 채우는 `<section>` 이 아니라 **내부 텍스트 블록 래퍼 `<div>`** 에만 적용 — 데스크톱 스크롤바 플래시 회피

### 태스크 3 · `invitation.config.ts` 스키마 오디트 (코드 변경 없음)

- 12 개 블록 필드 단위 감사: `meta`, `theme`, `groom/bride`, `date`, `venue`, `greeting`, `gallery`, `accounts`, `share`, `guestbook`, `music`, `closing`
- **결정**: 3주차에 스키마 변경 없음. 현 스키마가 MVP Must 범위 전체를 이미 커버 — CLAUDE.md "스키마 수정 시 ADR" 은 "변경 있을 때" 규칙이므로 ADR 도 작성하지 않음
- **식별된 잠재 갭(지금 건드리지 않음)**:
  - `share` 에 카카오톡 템플릿 `buttons` 필드 — 4주차 SDK 도입 시 실제 시그니처 확인 후 추가
  - `RsvpConfig` — v1.x 범위
  - `Person.showParents: boolean` — 실사용 요청 접수 후
  - 테마별 오버라이드 블록 — v1.0 다중 테마 작업 시 재검토
- 4주차 킥오프 태스크에 **"`share` 의 카카오 buttons 필드 결정"** 을 명시적으로 플래그

### 태스크 4 · `.claude/rules/kakao-sdk.md` 초안 (`256eee1`)

- 117 줄, 11 개 섹션. CLAUDE.md Progressive Disclosure 로 "카카오 SDK 관련 작업 시" 자동 참조됨
- 핵심 원칙:
  - SDK 버전·`integrity` 해시는 파일에 하드코딩 금지 (공식 docs 참조)
  - `Kakao.isInitialized()` 가드 + SSR-safe 초기화
  - `NEXT_PUBLIC_KAKAO_APP_KEY` 만 클라이언트 노출, Admin 키는 서버 Route Handler 분리
  - 카카오맵 딥링크 = `https://map.kakao.com/link/to/...` 웹 URL 통일 (`kakaomap://` 배제, 미설치 UX 회피)
  - 글로벌 Provider 없음, 공유 버튼 단위에서 init
  - 공유 실패 시 URL 클립보드 복사 폴백 필수
- `.env.example` 및 `lib/kakao.ts` 스캐폴드는 실제 SDK 도입 커밋(4주차)로 유예

---

## 막혔던 것 / 고민한 것

### 1. framer-motion SSR + iOS Safari 26 흰 화면 (task 2)

`motion.section` 이 SSR HTML 에 `style="opacity:0;transform:translateY(16px)"` 를 인라인한다. 데스크톱은 하이드레이션 후 즉시 animate 가 돌아 opacity 1 로 전환되지만, iPhone 12 Pro / iOS 26.3.1 에서는 **opacity:0 상태가 끝내 유지**. DOM 의 텍스트를 길게 눌러 선택이 가능했다는 점으로 "요소는 있으나 투명" 으로 확정. iPhone "동작 줄이기"/"저전력 모드" 도 모두 꺼진 상태라 가설 (framer-motion v12 + Safari 26 animate 트리거 회귀) 의 구체 원인은 특정하지 않고 해결 경로 전환.

- **교훈**: 모바일 Safari 가 1순위 브라우저라는 CLAUDE.md 원칙 4 는 "개발 중 매 커밋마다 실기기 검증" 으로 풀어야 유효. 데스크톱 Chrome 만으로는 SSR 관련 브라우저 제약을 놓친다.
- **교훈 2**: **on-mount 페이드는 CSS 가 적합, 스크롤 트리거는 framer-motion 이 적합.** SSR HTML 에 invisible 상태를 박지 않는 것이 가장 견고함. framer-motion 은 `whileInView` / `AnimatePresence` / 제스처처럼 JS 없이는 불가능한 영역에서만 사용.

### 2. CSS `translateY` + viewport 섹션의 스크롤바 플래시 (task 2)

CSS 로 선회한 뒤 `<section className="animate-fade-in-up min-h-dvh ...">` 로 둔 첫 구현에서 데스크톱 페이지 로드 직후 오른쪽 스크롤바가 0.6 초 동안 등장. 원인: `min-h-dvh` 인 섹션에 `translateY(16px)` 를 걸면 섹션 바닥이 뷰포트를 16px 초과 → body overflow. 애니 끝나면 복구.

- **해결**: 섹션은 정적, **내부 텍스트 블록 래퍼 `<div>` 에만** `animate-fade-in-up` 적용. transform 스코프를 뷰포트 크기 이하로 격리.
- **교훈**: Transform 애니는 **transform 대상의 크기가 그 부모/뷰포트와 같거나 크면 overflow 로 번진다.** 전체 섹션에 거는 건 피하고 내부 요소에 걸 것.

### 3. CI 런 생성 ~8 분 지연 (task 1 푸시 직후)

`git push` 성공 후 GitHub Actions 의 workflow run 이 ~8 분간 생성되지 않았다. 워크플로는 `state: active`, 트리거 필터도 맞는 상태. 직후 두 번째 푸시(task 2) 는 즉시 트리거. 원인은 GitHub 큐 적체로 추정하지만 특정 못 함.

- **교훈**: `gh run list` 에 나오지 않으면 `gh api repos/.../actions/runs?head_sha=...` 로 특정 SHA 의 런 직접 조회 → "런이 없다" 와 "런이 있지만 아직 대기중" 을 구분. 8 분은 정상 범위의 상단이므로 그 이상이면 workflow 파일·토큰·쿼터 순으로 의심.

### 4. GitHub 웹 파일 뷰 일시 장애 (task 1 푸시 후)

iPhone/데스크톱 모두에서 GitHub 웹에서 개별 파일 열람이 "An unexpected error occurred" 로 실패. 원인은 API 로 파일 존재 확인 직후 해결 (GitHub 프론트 일시 튐). 하드 리프레시 필요.

- **교훈**: GitHub 웹 에러는 API 로 먼저 교차검증 (`gh api repos/.../contents/<path>`). `status.github.com` 의 "All Systems Operational" 은 부분 장애를 늦게 반영하므로 단독 신뢰 X.

---

## 3주차 체크리스트 최종

2주차 회고의 "3주차로 넘어가는 결정사항" 과 대조:

- [x] `components/sections/` 도입, Main 분리
- [x] Framer Motion 설치 + 기본 섹션 트랜지션
- [x] `invitation.config.ts` 스키마 확장 시점 판단
- [x] `.claude/rules/kakao-sdk.md` 초안

예상하지 못했던 추가 성과:

- [x] CSS `@keyframes` 기반 페이드 패턴 확립 (framer-motion 과 역할 분담)
- [x] `<main>` / `<section>` 소유권 규칙 확립 (page.tsx vs 섹션 컴포넌트)
- [x] 섹션 컴포넌트의 config 소비 규칙 확립 (직접 import, props 주입 X)
- [x] 첫 end-to-end 모바일 검증 세션 (iPhone 12 Pro / iOS 26.3.1)

---

## 4주차로 넘어가는 결정사항

### 우선 태스크 후보

1. **`share` 스키마의 카카오 `buttons` 필드 결정** (3주차 잠재 갭 재방문) — 스키마 추가 시 ADR 기록
2. **`.env.example` 생성** — `NEXT_PUBLIC_KAKAO_APP_KEY` 샘플 포함. 실제 카카오 키 사용을 여는 첫 커밋
3. **Greeting 섹션 도입** — `invitation.config.ts` 의 `greeting.title/message` 첫 실사용. framer-motion 의 `whileInView` 스크롤 트리거 패턴을 여기서 처음 사용 → 필요 시 `components/shared/SectionFade.tsx` 추출
4. **Venue 섹션 + 카카오맵 딥링크 버튼** — `.claude/rules/kakao-sdk.md` 의 카카오맵 섹션을 코드로 내리는 첫 사례. `lib/map.ts` (또는 `lib/kakao.ts`) 신규
5. **카카오톡 공유 버튼 (Share 섹션)** — `Kakao.Share.sendDefault` 첫 도입. 도메인 등록·프로덕션 end-to-end 전제

MVP Must 중 "지도 버튼·계좌 복사·카카오톡 공유" 가 4주차 핵심. 4주차 안에 전부 닫는 것은 공격적이고, 최소 3 가지는 시작 또는 완료가 목표.

### 아직 스킵

- Gallery (이미지 에셋이 없음 — 실사용 사진 확보 후 5 주차 이후)
- 방명록 · D-day · 캘린더 (v1.0.0 스코프)
- 다중 테마 (v1.0.0)
- RSVP (v1.x)

---

## 4주차 첫 세션 시작 방법

1. `git log --oneline -10` — 최근 커밋 확인 (특히 이 회고 이후 무엇이 쌓였는지)
2. **이 파일 (`docs/retrospective/week-03.md`) 을 다시 읽기** — 3주차 결론과 우선 태스크 목록이 여기에 있음
3. `docs/retrospective/week-02.md` 는 필요 시 참조만 (이미 정리된 내용)
4. `docs/02-week01-daily-guide.md` 외의 주차별 가이드 문서 존재 여부 확인 (`ls docs/*week*`). 아직 없으면 이 회고의 "우선 태스크 후보" 를 가이드로 사용.
5. **카카오 관련 작업(태스크 후보 1, 2, 5) 을 시작할 때는 `.claude/rules/kakao-sdk.md` 자동 참조.** CLAUDE.md Progressive Disclosure 규칙이 해당 파일 로드를 트리거.
6. 다음 태스크 **한 개** 를 제안 — 4주차 첫 세션은 태스크 1 (스키마 `buttons` 결정) 또는 2 (`.env.example`) 부터가 자연스러움. 두 건 모두 스키마·환경 준비로 실구현의 발판.
7. 사용자 승인 후 Plan Mode 브리핑 → 구현 → 품질 게이트 → 커밋 → 푸시 → CI 폴링 (3주차 루틴 그대로).

---

## CLAUDE.md 업데이트 필요 사항

- 없음. 2주차에 이어 파일 구조·명령어 섹션 최신 상태 유지. 다만 4주차 `.env.example` 이나 `lib/kakao.ts` 도입 시점에 "파일 구조 (목표)" 블록 하단의 진행 상태 라인 업데이트 필요.

---

## 메트릭 / 비고

- **3주차 커밋 수**: 3 개 (이 회고 커밋 제외) — `a4ed074` · `4a8864d` · `256eee1`
- **미푸시 커밋**: 0 개 (회고 커밋 전 기준)
- **CI 런**: 3 회, 모두 녹색 · 38s · 39s · 32s. 이 회고 커밋(4 번째 런) 은 푸시 직후 별도 검증
- **외부 기여자**: 0 명
- **가장 큰 단일 파일 변화**: `.claude/rules/kakao-sdk.md` (+117 줄)
- **세션 리듬**: 2주차와 동일하게 **한 세션에 4 개 태스크 압축 진행** (세션 시작 2026-04-23, 자정 경계 넘어 2026-04-24 까지)
- **의존성 추가**: `framer-motion@^12.38.0` (runtime)
- **첫 모바일 end-to-end 검증** — 흰 화면 이슈 → CSS 경로 선회라는 3주차의 가장 의미 있는 기술 판정 동인

---

## 한 줄 총평

> **3주차는 "레일에서 첫 섹션을 올리고, 모바일 현실과 충돌하며 경로를 재정비한 주간".** Main 분리로 섹션 패턴을 확정, framer-motion → CSS 회귀로 SSR·iOS Safari 제약을 실전 지식으로 내재화, 카카오 SDK 규칙 초안으로 4주차 카카오톡 공유 실구현의 런웨이를 깔았다.

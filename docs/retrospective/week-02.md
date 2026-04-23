# 2주차 회고 (2026-04-23)

> 다음 세션에서 읽을 사람은 이 파일만 봐도 2주차 결과와 3주차 진입 상태를 파악할 수 있어야 합니다.

---

## 완료한 것

### Day 1 · Next.js 16 초기화 (`3bbb378`)

- **temp-dir scaffold + 선별 복사** 방식으로 기존 파일(`invitation.config.ts`, `CLAUDE.md`, `README*`, `.gitignore`, `docs/`, `.github/`, `.claude/`) 완전 보존
- `create-next-app@latest` 가 설치한 실제 버전은 **Next.js 16.2.4** (React 19.2.4) — 계획은 15 였다
- 화이트리스트 복사: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `next-env.d.ts`, `app/`, `public/`
- `README.md`, `.gitignore` 는 복사 제외 (기존 파일이 상위집합)
- CLAUDE.md 에 "Next.js 16 주의사항" 섹션 추가, ADR 003 작성

### Day 2 · Classic 팔레트 `@theme` 토큰 등록 (`a1ea246`)

- `app/globals.css` 에 5색 토큰: primary `#c9a87c`, secondary `#8b7355`, background `#faf6ee`, text `#3d342c`, accent `#e8dfd0`
- `@theme inline` → `@theme` (non-inline) 로 전환 — v1.0.0 다중 테마에서 `:root` custom property 를 런타임에 교체할 수 있도록
- dark mode 미디어 쿼리 삭제 (디자인 doc 에 dark variant 미정의)

### Day 3 · Pretendard + Cormorant self-host (`e5f7705`, 선행 메타 `3216dc1`)

- `app/fonts/PretendardVariable.woff2` (~2.0 MB) + SIL OFL 라이선스 커밋
- `next/font/local` → Pretendard (`--font-pretendard`, weight 45–920)
- `next/font/google` → Cormorant Garamond (weights 400–700, latin)
- `@theme` 토큰 연결: `--font-sans` → Pretendard, `--font-serif` → Cormorant, `--font-mono` 제거
- Day 3 중간에 커밋 컨벤션을 **한국어 우선** 으로 전환 (`3216dc1`), CLAUDE.md 의 커밋 컨벤션 섹션 업데이트

### Day 4 · Prettier 셋업 (`4de23be`)

- devDependencies: `prettier`, `eslint-config-prettier`, `prettier-plugin-tailwindcss`
- `.prettierrc` (Tailwind 플러그인만), `.prettierignore` (바이너리·lockfile 제외)
- `format`, `format:check` npm 스크립트 추가
- ESLint flat config 에 `eslint-config-prettier/flat` 연결
- 기존 파일 일괄 포맷은 이 커밋에 포함하지 않음 (Day 5 선행 작업으로 이연)

### Day 5 · CI + 선행 포맷 (`0081159`, `3018926`)

- 선행 커밋 `0081159`: `npm run format` 실행 (14 파일 normalize — 싱글/더블 쿼트, trailing comma, Tailwind class canonical 순서, 마크다운 테이블 셀 패딩)
- CI 커밋 `3018926`: `.github/workflows/ci.yml` 신규 — Node 22 LTS, `npm ci`, 4 스텝 (lint → typecheck → format:check → build), concurrency group 으로 동일 ref 의 이전 실행 자동 취소
- `typecheck` 스크립트 추가 (`tsc --noEmit`)
- 첫 CI 런 **31초 그린**

### Day 6 · 최소 메인 페이지 (`5dc8b1d`)

- scaffold 랜딩 UI 전체 삭제
- `invitation.config.ts` 에서 `config.groom.name`, `config.bride.name` import → 실제 렌더
- Day 2/3 의 Classic 팔레트 + 폰트 스택이 브라우저에서 처음 시각화
- `app/layout.tsx`: `metadata` 를 `config.meta.title` / `config.meta.description` 에 연결, `lang="en"` → `lang="ko"`
- `min-h-dvh` 사용해 iOS Safari `100vh` 이슈 회피 (CLAUDE.md 원칙 4)
- CI 런 **29초 그린**

---

## 막혔던 것 / 고민한 것

### 1. `create-next-app` 이 Next 15 대신 16 설치

세션 시작 당시 CLAUDE.md, ADR 001, 1주차 회고 모두 "Next.js 15" 를 기준으로 썼으나 `@latest` 는 16.2.4 를 설치했다. Next 16 release blog 와 upgrade guide 를 WebFetch 로 확인해, MVP 스코프(단일 정적 페이지 + 클라이언트 Firebase)가 16 의 breaking changes (async `params/cookies`, `middleware.ts` → `proxy.ts`, 병렬 라우트 `default.js` 등) 와 거의 무관함을 검증한 뒤 **16 유지** 결정. ADR 003 로 snapshot.

- **교훈**: 문서에 명시된 버전은 작성 시점의 `@latest` 기준 상대적 기록이다. Snapshot 을 ADR 로 남기고, 운영 문서(CLAUDE.md) 에는 "Next 16 주의사항" 섹션으로 런타임 가드레일을 둔다.

### 2. `prettier-plugin-tailwindcss` 의 `@latest` 가 인사이더 빌드

`npm install -D prettier-plugin-tailwindcss` 로 들어온 버전이 `0.0.0-insiders.f7d2598` 이었다. `npm info ... dist-tags` 로 확인: 메인테이너가 Tailwind v4 호환을 위해 `latest` 태그를 인사이더에 걸어둔 상태. 동작에 문제 없고 `package.json` 의 버전 문자열만 낯설다.

- **교훈**: 의존성 설치 직후 `package.json` 의 `^` 뒤 버전을 한 번 훑어보는 습관이 유용. 예상과 다르면 `npm info <pkg> dist-tags` 로 원인 확인.

### 3. `format:check` 와 기존 파일의 충돌 (Day 4 → 5 연결점)

Day 4 설정만 추가 커밋 후 `format:check` 가 14 파일에서 실패. Day 5 CI 에서 `format:check` 를 포함하려면 선행 `npm run format` 이 필요했다. 일괄 format 실행 후 샘플 diff 를 확인(시맨틱 무변: 쿼트 통일, trailing comma, Tailwind class 재정렬, 마크다운 테이블 패딩) 하고 별도 커밋으로 분리해 커밋 목적을 명확히 유지.

- **교훈**: Prettier 도입은 "설정 추가 + 일괄 포맷 + CI 편입" 3 스텝으로 나누면 각 커밋의 의미가 깔끔하다. 특히 자동 포맷 diff 는 대용량이라 별도 커밋이 리뷰 비용을 줄인다.

### 4. scaffold 가 예상치 못한 파일 생성

`AGENTS.md` (Next 15 이후 convention) 와 11 바이트 `CLAUDE.md` 포인터 파일이 스캐폴드에 포함돼 있었다. 명시적 화이트리스트 복사 덕에 기존 `CLAUDE.md` 를 덮어쓰지 않았지만 `create-next-app .` 을 비어있지 않은 디렉토리에서 실행했다면 충돌을 침묵으로 넘겼을 가능성이 있다.

- **교훈**: 비어있지 않은 디렉토리에 scaffold 할 때는 `create-next-app .` 의 자동 충돌 해소를 **절대 신뢰하지 않는다**. temp-dir + 화이트리스트가 표준.

### 5. 한글 커밋 컨벤션 도입 시점

Day 1, Day 2 커밋을 영어로 작성한 뒤 Day 3 중간에 한글로 전환. 이미 push 된 2개 커밋의 메시지 재작성은 force-push 가 필요해 backup branch 로 복구 경로는 확보 가능했으나 **solo 레포에서도 되돌릴 수 없는 동작**이라 보류. CLAUDE.md 에 "Day 1, Day 2 는 영어 그대로 — force-push 회피 우선" 을 명시해 혼동 방지.

- **교훈**: 커밋 컨벤션은 프로젝트 초기에 확정. 중간 전환이 불가피하면 push 된 history 를 재작성하지 않고 컨벤션 변경 시점만 문서로 남긴다.

### 6. `@theme` vs `@theme inline` 선택

시각 결과는 동일. Non-inline 을 택한 이유: v1.0.0 다중 테마에서 `:root` 의 custom property 를 런타임에 교체하려면 inline 으로 hex 값을 utility class 에 박아넣으면 안 되기 때문. "지금 필요 없는 기능 도입 금지" 원칙과 미세하게 상충하지만 전환 비용이 0 이라 수용.

---

## 2주차 체크리스트 최종

1주차 회고의 "2주차로 넘어가는 결정사항" 과 대조:

- [x] `npx create-next-app@latest` — 기존 파일 보존 (temp-dir 방식)
- [x] Tailwind config 에 Classic 팔레트 hex 토큰 등록 (v4 `@theme` 로 치환)
- [x] Pretendard + Cormorant Garamond self-host (CDN 아님)
- [x] Prettier + ESLint 셋업
- [x] `.github/workflows/ci.yml` — lint + typecheck + format:check + build
- [x] `app/page.tsx` 에서 `invitation.config.ts` import, 신랑·신부 이름 출력

예상하지 못했던 추가 성과:

- [x] ADR 003 (Next.js 16 채택 결정)
- [x] 커밋 메시지 한국어 우선 컨벤션 (CLAUDE.md 반영)
- [x] `typecheck` 스크립트 추가 (`tsc --noEmit`)
- [x] `format:check` 를 CI 필수 스텝으로 편입 (기존 14 파일 선행 포맷)

---

## 3주차로 넘어가는 결정사항

### 다음 주 우선 태스크

1. **`components/sections/` 도입**: Day 6 의 inline JSX 를 `Main.tsx` 로 분리. 이후 `Greeting.tsx`, `Gallery.tsx` 순차 추가 준비.
2. **Framer Motion 설치 + 기본 섹션 트랜지션**: CLAUDE.md 기술 스택에 명시. 스크롤 기반 등장 애니메이션 패턴부터.
3. **`invitation.config.ts` 스키마 확장 시점 판단**: 현재는 `meta`, `groom`, `bride`, `date`, `venue` 만 실사용. 인사말·계좌·갤러리 섹션 구현 시 누락 필드 발견 가능 — 스키마 수정 시 ADR 기록 (CLAUDE.md 작업 규칙).
4. **`.claude/rules/kakao-sdk.md` 초안**: MVP Must 기능의 핵심. 3주차 안에 내용이 쌓여야 4주차 카카오 SDK 실제 도입 가능.

### 아직 스킵

- v1.0.0 과제 (방명록, D-day, 캘린더, 다중 테마) — 3주차에는 건드리지 않음
- `public/*.svg` (scaffold 로고들) — 참조는 끊겼지만 파일은 남김. 정리는 3주차 후반 혹은 4주차에.

---

## CLAUDE.md 업데이트 필요 사항

**다음 커밋에서 함께 반영 예정** (이 회고 커밋과 별도):

- [ ] "자주 쓰는 명령어" 섹션에서 `초기화 전(현재 상태): 아직 package.json이 없음…` 블록 제거
- [ ] 실제 스크립트 목록을 명시: `dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check`
- [ ] "파일 구조 (목표)" 섹션 아래 진행 상태 한 줄 추가 (예: "2주차 기준: `app/`, `app/fonts/` 만 존재. `components/`, `lib/` 는 3주차 도입 예정")

---

## 메트릭 / 비고

- **2주차 커밋 수**: 8개 (이 회고 커밋 제외)
  - `3bbb378` · `a1ea246` · `3216dc1` · `e5f7705` · `4de23be` · `0081159` · `3018926` · `5dc8b1d`
- **미푸시 커밋**: 0개 (회고 커밋 전 기준)
- **CI 런**: 2회, 모두 녹색 · 31s → 29s
- **외부 기여자**: 0명 (여전히 solo)
- **가장 큰 단일 파일**: `app/fonts/PretendardVariable.woff2` (~2.0 MB)
- **전체 작업을 한 세션·같은 날 (2026-04-23) 에 완료** — 1주차의 Day 별 분산 리듬과 대조. 사이드 프로젝트가 몰입 가능한 시점에 집중 진행되는 패턴으로 드러남.

---

## 한 줄 총평

> **2주차는 "결정의 1주차" 를 코드로 옮긴 주간이었다.** ADR 과 디자인 결정이 `@theme` 토큰 · `next/font/local` 호출 · ESLint flat config · GitHub Actions 스텝으로 번역됐다. 3주차부터는 이 레일 위에서 섹션 UI 를 실제로 쌓아올린다.

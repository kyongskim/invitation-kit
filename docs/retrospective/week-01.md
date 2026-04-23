# 1주차 회고 (2026-04-22 → 2026-04-23)

> 다음 세션에서 읽을 사람은 이 파일만 봐도 1주차 결과와 2주차 진입 상태를 파악할 수 있어야 합니다.

---

## 완료한 것

### Day 1~3 · 프로젝트 베이스 (선행 완료)

- 레포 `kyongskim/invitation-kit` 생성 (public, MIT)
- README 한국어/영어 초안
- `invitation.config.ts` 스키마 초안 (5.6KB)
- 초기 커밋: `9e8202c chore: initial project setup with docs and config schema`

### Day 4 · ADR 2건 (`abb81f7`)

- `docs/adr/001-use-nextjs-app-router.md` — App Router 채택, `"use client"` 경계 규칙
- `docs/adr/002-config-driven-approach.md` — 단일 `invitation.config.ts` 원칙, breaking change 처리

### Day 5 · 디자인 결정 (`e299b47`)

- `docs/04-design-decisions.md` 작성 (텍스트 사양서로 Figma 대체)
- **Classic 프리셋 확정** — 팔레트 A (Warm Beige) + 폰트 P1 (Pretendard + Cormorant Garamond)
- 다중 테마 / 팔레트·폰트 오버라이드는 v1.0.0으로 이월

### Day 6 · GitHub 템플릿 (`6d9a6af`)

- `.github/ISSUE_TEMPLATE/bug.md`
- `.github/ISSUE_TEMPLATE/feature_request.md` (스키마 영향 체크박스 포함)
- `.github/PULL_REQUEST_TEMPLATE.md` (모바일 Safari + 개인정보 체크)
- Issue #1 `v0.1.0 MVP 마일스톤` 등록 — https://github.com/kyongskim/invitation-kit/issues/1

### Day 7 · 회고 (이 문서)

---

## 막혔던 것 / 고민한 것

### 1. Issue #1 본문과 ADR 충돌

최초 Issue #1의 DoD에 `invitation.config.example.ts` 파일 언급이 있었는데, 이는 **ADR 002에서 명시적으로 "도입하지 않는다"고 결정한 패턴**이었음. 작성 직후 내부 검토에서 발견해 `gh issue edit`으로 수정.

- **교훈:** ADR을 작성한 직후에도 관련 문서에 과거 관례가 스며들 수 있다. ADR이 늘어나면 PR/이슈 템플릿에 "관련 ADR 위반 여부 확인" 체크박스 추가를 고려.

### 2. 팔레트/폰트 분리 제공 아이디어

사용자가 "팔레트와 폰트를 따로 골라서 조합하는 방식"을 제안. 장점(유연성, 9개 조합)과 단점(비전문가의 궁합 실패, 선택 피로, "5분 배포"와의 충돌)을 비교 후 **v1.0.0으로 이월 결정**. v0.1.0에서는 프리셋 단일 적용이 일정과 QA 비용 면에서 안전.

### 3. Figma 와이어프레임 필수 여부

가이드 문서에 "Figma/종이 와이어프레임"이 명시되어 있어 사용자가 부담을 느낌. Config-driven 템플릿 특성상 레이아웃이 섹션 단위로 정형화되어 있어 **텍스트 사양서(섹션 순서 + vh 높이)로 충분**하다고 판단. 실제로 `docs/04-design-decisions.md`만으로 진행 가능.

### 4. 칸반 보드 도입 여부

원래 Day 6에 포함되어 있었으나, **혼자 하는 사이드 프로젝트**에서 이미 `docs/02-week01-daily-guide.md`가 태스크 리스트 역할을 하고 있어 중복. 외부 기여자가 생기는 v0.1.0 릴리스 이후로 연기.

---

## 1주차 체크리스트 최종

- [x] GitHub 레포 생성 (공개, MIT)
- [x] 한국어 + 영어 README 초안 커밋
- [x] `invitation.config.ts` 스키마 정의 완료
- [x] 테마 1종(Classic) 팔레트 결정
- [~] 디자인 레퍼런스 보드 — **사용자가 Pinterest에 직접 채울 TODO로 남김** (`docs/04` 레퍼런스 섹션)
- [x] 이슈 템플릿, PR 템플릿
- [~] 프로젝트 보드 — **스킵** (사유: 단일 기여자, v0.1.0 이후 재검토)
- [x] ADR 최소 2건 (001, 002)
- [x] v0.1.0 마일스톤 이슈 등록 (#1)

**요약:** 핵심은 모두 완료. 프로젝트 보드는 의도적 스킵, Pinterest 보드는 사용자 후속.

---

## 2주차로 넘어가는 결정사항

### 기술 스택 확정 (ADR에 의해 고정)

- Next.js 15 (App Router) · TypeScript · Tailwind CSS
- Firebase Firestore (방명록/RSVP, v1.0.0부터)
- Vercel 배포

### v0.1.0 범위 고정 (Issue #1)

- 메인 · 인사말 · 갤러리 · 오시는 길 · 계좌 복사 · 카카오톡 공유 — 6개 Must 기능만
- 테마는 Classic 하나

### 2주차 주요 태스크 (`docs/02-week01-daily-guide.md` 이어서 2주차 가이드가 없으므로 여기서 정의)

1. `npx create-next-app@latest . --typescript --tailwind --app --eslint` — 기존 파일 충돌 주의 (CLAUDE.md, README, invitation.config.ts, docs/, .github/ 보존)
2. Tailwind config에 Classic 팔레트 hex 값 토큰 등록
3. Pretendard + Cormorant Garamond self-host 설정 (CDN 아님)
4. Prettier + ESLint 셋업
5. `.github/workflows/ci.yml` — lint + typecheck + build on push/PR
6. `app/page.tsx`에서 `invitation.config.ts` import해 신랑/신부 이름만 출력하는 최소 페이지

### 2주차 첫 세션 시작 방법 (권장)

```
cd ~/projects/invitation-kit && claude
→ "2주차 시작. docs/retrospective/week-01.md와 CLAUDE.md를 읽고
   Next.js 초기화 계획을 Plan Mode로 세워줘.
   기존 파일 보존이 가장 중요."
```

---

## CLAUDE.md 업데이트 필요 사항

2주차 끝에 반영 예정. 지금은 바꾸지 않음.

- [ ] "자주 쓰는 명령어" 섹션의 TBD 항목을 실제 스크립트로 교체 (`dev`, `build`, `lint`, `typecheck`)
- [ ] "파일 구조 (목표)" 섹션에서 실제 생성된 디렉토리 반영
- [ ] 현재 단계 표기 — "1주차 완료, 2주차 진입" 같은 한 줄 상태 표시 추가 검토

---

## 메트릭 / 비고

- 총 커밋 수 (1주차 종료 시점): **4개** — `9e8202c`, `abb81f7`, `6d9a6af`, `e299b47` (+ 이 회고 커밋 예정)
- 미푸시 커밋: **2개** (`e299b47`, 이 회고 커밋) — 2주차 시작 전 push 필요
- Issue 수: **1개** (#1 추적 이슈)
- 외부 기여자: 없음 (혼자 진행)

---

## 한 줄 총평

> **1주차는 결정의 주간이었다.** 코드는 없지만 앞으로 12주간 의사결정의 레일이 되는 문서와 규칙이 모두 자리잡았다. 2주차부터는 이 레일 위에서 실제 구현.

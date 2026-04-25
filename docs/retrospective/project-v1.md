# Project v1.0 회고 — 12주 호흡 메타 회고

**기간:** 2026-04-22 (Week 1 시작) ~ 2026-04-25 (Week 12 closure 시점, 본 회고 작성)
**범위:** 12주 호흡 전체. v0.1.0 → v0.2.0 → v1.0.0 → v1.0.x (Unreleased) 4 마일스톤
**누적 커밋:** 80+ (각 주차 회고 커밋 포함, main 브랜치 단일 흐름)
**ADR:** 7 건 (`001-use-nextjs-app-router` ~ `007-guestbook-self-delete-strategy`)

> 이 회고는 **내부용 메타 회고**다. velog 외부 글 (`docs/blog-posts/2026-04-25-12week-retrospective.md`) 의 외부 톤과 달리, 의사결정 자체에 대한 평가 + Claude Code 와의 협업 패턴 + 도구 / 인프라 / 메모리 시스템에 대한 솔직 기록이다. 외부 게시 의도 X.

---

## 0. 한 줄 요약

> **12주 단일 기여자 사이드 프로젝트로 한국형 OSS 청첩장 템플릿 v1.0 closure.**
> "Config 한 파일 수정 → 5분 배포" 약속 + 다중 테마 + 방명록 본인 삭제 + 비개발자 가이드 3 종 + Performance 측정 사이클 + ADR 7 건 + Progressive Disclosure 규칙 파일 4 개. v2.0 SaaS 정체성 전환은 본 호흡 스코프 밖으로 분리.

---

## 1. 호흡 구조 — 12주 / 7 단계

| 단계 | 주차     | 마일스톤                                                                                          |
| ---: | -------- | ------------------------------------------------------------------------------------------------- |
|    1 | Week 1-2 | 기획 + 셋업 (Next.js 16 / Tailwind v4 / Vercel / GitHub Actions / Pretendard self-host)           |
|    2 | Week 3-6 | MVP Must (Main · Greeting · Gallery · Venue · Accounts · Share) → v0.1.0                          |
|    3 | Week 7-8 | Should + 다중 테마 (Modern · Floral) + 방명록 (Firebase) → v0.2.0                                 |
|    4 | Week 9   | 비개발자 가이드 3 종 (`api-keys` · `config-guide` · `theme-guide`)                                |
|    5 | Week 10  | v1.0.0 마감 (데모 가시화 + Performance 71→78 + CONTRIBUTING)                                      |
|    6 | Week 11  | 홍보 호흡 → 사용자 결정으로 본 12주 호흡 스코프 제외 (velog 초안만 자산)                          |
|    7 | Week 12  | v1.0 보완 + closure (본인 삭제 ADR 007 / PNG 최적화 / Performance lazy / v1.1 마일스톤 / 본 회고) |

**호흡의 자연성**: 1단계는 셋업, 2-3단계는 만들기, 4-5단계는 정리 + 마감, 6단계 (홍보) 는 호흡 중간에 사용자 결정으로 스코프 제외, 7단계는 보완 + closure. 12주 호흡 안에서 6단계 스코프 변경이 일어났지만 호흡 자체의 골격은 유지. **홍보 제외 결정이 closure 의 명료성을 오히려 높였다** — "v2.0 SaaS 의지가 있다면 별도 호흡으로 분리" 라는 12주차 마지막 결정으로 이어짐.

---

## 2. 의사결정 메타 — ADR 7 건의 패턴

| ADR | 결정                                     |                                                            거부 대안 수 | 격상 트리거                  |
| --- | ---------------------------------------- | ----------------------------------------------------------------------: | ---------------------------- |
| 001 | App Router 채택                          |                                                2 (Pages Router · Remix) | 1주차 셋업 시점              |
| 002 | Config-driven 절대 원칙                  |                                       3 (멀티 컴포넌트 · DSL · 폼 입력) | 1주차 정체성 결정            |
| 003 | Next.js 16 유지 (학습 데이터 의심)       |                                                1 (Next 15 다운그레이드) | 2주차 `create-next-app` 결과 |
| 004 | Share buttons 고정 시그니처              |                                                                1 (배열) | 4주차 카카오 버튼 스키마     |
| 005 | data-theme + CSS 변수 cascade override   | 5 (테마별 fork · props 토큰 · CSS Modules · CSS-in-JS · runtime config) | 7주차 다중 테마 시점         |
| 006 | 욕설 필터 자체 데이터 + 외부 패키지 보류 |                               3 (korcen 도입 · 자체 정규화 · 강화 보류) | 8주차 "ㅅㅂ 통과" 사례       |
| 007 | 방명록 본인 삭제 C → C' 전환             |    5 (서버 매개 · Cloud Function · soft delete · 입력 빼기 · 강화 보류) | 12주차 사용자 트리거         |

**패턴 발견**:

1. **거부 대안의 수가 결정의 견고성에 비례** — ADR 005 (5 거부) 가 가장 견고. 가장 도전 다양했던 결정이 사후 가장 안정적 자산. ADR 003 같은 "단일 거부" 는 외부 변수 (Next.js 16 의 학습 데이터 갭) 가 결정의 약 절반을 차지
2. **트리거의 다양성** — 셋업 (001 · 002 · 003) / 스키마 (004) / 인프라 (005) / 사용자 사례 (006) / 사용자 호흡 중 결정 (007). **ADR 007 이 가장 흥미** — 8주차 firebase.md 한정이던 결정이 12주차 사용자 한 마디 ("비밀번호 일치되면 삭제") 로 재검토 트리거 발생
3. **회고에 묻혀있던 결정도 사용자 호흡 중에 다시 살아남** — ADR 007 의 12주차 격상은 "회고 명세의 시작 시점 가정" 이 아니라 "사용자 호흡 중 진짜 의지" 가 트리거. 회고 vs 사용자 의지의 우선순위 명료화

---

## 3. 실패 + 함정 — 4 회 이상 재발한 패턴

### 3.1 `react-hooks/set-state-in-effect` 4 회 재발 (5 → 6 → 8 → 12주차)

| 주차 | 상황                                            | 처리                                                                        |
| ---- | ----------------------------------------------- | --------------------------------------------------------------------------- |
| 5    | D-day `useEffect` setState                      | useSyncExternalStore 기반 useIsClient 훅                                    |
| 6    | 같은 패턴 다른 컴포넌트                         | useIsClient rule-of-three 적용 (DDayBadge · InAppBrowserNotice)             |
| 8    | useIsClient 추출 (`c1ac4a1`)                    | `lib/hooks.ts` 신설, 6주차의 두 곳 마이그레이션                             |
| 12   | DeleteConfirmModal `useEffect` 안 setSubmitting | AnimatePresence 부모 마운트 패턴으로 우회 — useEffect 안 setState 자체 제거 |

**격상 사이클**: firebase.md 의 톤이 "주의" → "절대 금지" 격상 (9주차 `05f13fc`). 12주차 4회 재발 시점에 1차 lint 가 즉시 잡음 — **격상 ROI 실증**. 다음 단계는 사용자 호흡에서 이 패턴이 또 나오면 "이건 ADR 격상 후보" 로 바로 인지.

### 3.2 framer-motion iOS Safari `initial` invisible 회귀 (3주차 + 4주차)

3주차 Main 히어로 흰 화면, 4주차 Greeting `whileInView` 로 같은 회귀 재현. 두 번 실 기기 검증 후 **CLAUDE.md "애니메이션 사용 규칙" 으로 영구화** — `initial → animate` 패턴 금지, `whileInView` 도 동일, framer-motion 은 JS-only 영역 (`AnimatePresence` · 제스처) 만 사용.

12주차 DeleteConfirmModal 에서 framer-motion 의 정당한 사용처 (`AnimatePresence` 부모 마운트 + motion.div initial/animate/exit) 첫 적용. 규칙이 "금지" 가 아니라 "정확한 사용처 분리" 임이 실증.

### 3.3 카카오 도메인 2 필드 함정 (5주차 실 기기)

JavaScript SDK 도메인 vs 웹 도메인 분리. 한 필드만 등록하면 sendDefault 성공하지만 카드 안 링크 호스트 strip → PC "모바일에서 확인" / iPhone 무반응. `share.buttons.map` 활성 시 `https://map.kakao.com` 도 별도 등록. **5주차 회고 때 카카오 자사 도메인이라도 "다른 앱 관점에선 외부 도메인" 명료화**. kakao-sdk.md 에 표로 박힘.

### 3.4 Performance 가설 부정확 (10주차)

1차 가설 두 개 (Gallery `priority` + text-secondary 색) 모두 부정확. **진단 audit detail (`network-requests`, `largest-contentful-paint-element`) 깊이 파야 진짜 원인 (Pretendard variable 2MB) 식별**. 미래 Performance 작업 패턴: 데이터부터, 가설은 출발점일 뿐. 1차 가설의 코드 의도 자체가 옳으면 (above-the-fold 아닌데 priority 두지 않음) 효과 미미해도 보존 — fix-forward 가 아니라 forward-only.

### 3.5 환경변수 인라인 누락 (9주차 v0.2 직후)

`NEXT_PUBLIC_*` 변수가 빌드 시점에 인라인되는 값이라 `.env.local` 만으로는 Vercel 프로덕션 빌드에 반영 X. 6 키 등록 누락 → `auth/invalid-api-key`. **firebase.md 에 8단계 절차 영구 박음**. 운영 갭 발견 → 진단 → 영구화 까지 ~30 분 사이클의 자연 lock-in.

---

## 4. 도구 + 인프라

### 4.1 스택 결정의 사후 평가

| 도구                                                        | 평가                                                                                                                                                                             |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Next.js 16 (App Router, Turbopack)**                      | 학습 데이터 갭 (cookies/headers/params async, proxy.ts) 이 함정이었지만 ADR 003 + CLAUDE.md 체크리스트로 12주 내내 안정. **재선택 OK**                                           |
| **Tailwind v4 `@theme`**                                    | 다중 테마의 `:root[data-theme]` cascade override 가 자연스러움. 컴포넌트 수정 0 건의 ROI 명료. **재선택 OK**                                                                     |
| **Firebase Firestore (방명록만)**                           | 무료 운영 + Spark 플랜 cap (50K reads/day) 충분. firebase.md 영구 스코프 (Cloud Functions / Auth / Storage 제외) 가 v2.0 SaaS 분기 시점에 명료한 정체성 분리 자산. **재선택 OK** |
| **bcryptjs**                                                | 60자 고정 해시 + 클라이언트 verifyPassword 12주차 본인 삭제에 자연 활용. native bcrypt 거부 결정 (브라우저 번들 불가) 도 옳았음. **재선택 OK**                                   |
| **Vercel**                                                  | Hobby 무료 티어 충분. PSI 측정 자연 연계. 단 **Vercel env 인라인 사실** 이 한 번 부딪힘 (9주차) — firebase.md 영구화로 lock-in. **재선택 OK**                                    |
| **Lighthouse CLI (모바일 simulate)**                        | desktop preset 의 LCP/TBT/TTI null 이슈가 한계 (10주차 두 번 재현). PSI 가 진짜 측정. **CLI 는 1차 진단, PSI 가 closure**                                                        |
| **Pretendard self-host (변수 2MB → 3 weight subset 784KB)** | 10주차 Performance 사이클의 -10s LCP 의 거의 전부. **Pretendard dynamic-subset (v1.1 후보)** 으로 추가 절감 가능                                                                 |
| **Italiana / Cormorant / Playfair (테마별 serif)**          | next/font 의 다중 src 등록으로 테마별 분기. 분량 조절 자연                                                                                                                       |

### 4.2 라이브러리 / 의존성 — 6 종 + 0 거부

채택: `next` · `react` · `tailwindcss` · `firebase` · `bcryptjs` · `framer-motion`.
거부: `bcrypt` (native, 브라우저 불가) · `korcen` (욕설 필터, ADR 006) · `firebase-admin` (Admin SDK, firebase.md 영구 스코프 밖) · `pretendard` npm (install/uninstall 후 dist 만 carry over).

→ **의존성 6 개로 12주 closure**. 작은 surface, 큰 자산. v1.1+ 에서 RSVP / i18n / App Check 도입 시 추가 검토.

### 4.3 도구 finding (12주 누적)

- **Monitor 도구의 zsh `$status` 변수 충돌** (10주차) — `state` / `result` 변수명으로 회피
- **Lighthouse CLI desktop preset 측정 불안정** — LCP/TBT/TTI null. PSI 웹사이트 측정으로 보강
- **prettier 가 markdown table padding 자동 정렬** — format → format:check 두 단계 워크플로 정착 (10주차 lock-in)
- **`gh run view` polling 의 hook false positive** (8주차) — `.claude/settings.json` 재검토 부정확 결론 (9주차 fact-check) → Monitor 도구 1순위 + Bash run_in_background fallback

---

## 5. Claude Code 와의 협업 패턴

본 12주 호흡의 거의 모든 호흡이 Claude Code 와 함께. 12주 누적 학습:

### 5.1 Plan Mode ROI

- **Plan Mode 의 ROI 는 작업 종류에 따라 다르다** (9주차 발견) — architecture 결정 / 큰 코드 변경에는 ROI 큼, 문서 작성 / 작은 변경에는 skip 가능
- **Plan ROI 의 일부 = 회고 명세의 시작 시점 가정 검증** (10주차 발견) — `git log 22e90ad..HEAD` 같은 원자료 검증이 plan 단계의 자연 일부

### 5.2 Auto mode 운영 톤

- **결정 명료 + 즉시 실행 + 끊을 수 있는 신호** (10주차 학습) — 옵션 4-5개 나열 + 사용자 결정 떠넘기는 톤은 결단력 부재 신호
- 진짜 큰 의사결정 (디자인 D-1/D-2/D-3, 본 12주차의 SaaS vs OSS 분기) 은 옵션 합의 적절. **결정의 무거움**으로 분기 — 기술 진행은 즉시 실행, 정체성 / 디자인은 옵션 합의

### 5.3 Progressive Disclosure 규칙 파일

- 4 개 영역 활성화: `kakao-sdk.md` (3주차) · `firebase.md` (8주차) · `theme-guide.md` (9주차) · `CONTRIBUTING.md` (10주차)
- **CLAUDE.md 의 placeholder 가 실제 작업 트리거에서 자연 실체화** — 정확한 시점에 작성된 규칙은 즉시 ROI. 미리 만든 규칙은 추측 기반이라 ROI 불명
- **firebase.md 영구화 패턴**: SDK 통합 _이전_ 에 작성하면 결정 (스코프 · 삭제 전략 · 욕설 필터) 이 코드보다 먼저 박혀 후속 변경이 "기존 결정의 연장" 으로 자연. ADR 006 / 007 도 firebase.md 의 트리거 메모가 트리거 역할

### 5.4 회고 격상 + 운영 갭 영구화 패턴

- **회고 격상 사이클**: 5주차 → 6주차 → 8주차 → 12주차 의 set-state-in-effect 재발 후 9주차에 firebase.md 톤 격상 → 12주차에 lint 가 즉시 잡음. **n회 재발 후 격상이 정공법**, 1회 발생에 격상은 추측 기반
- **운영 갭은 한 사이클 안에서 영구화**: Vercel env 인라인 사실 발견 → 진단 → firebase.md 영구화 → api-keys.md 흔한 실수 인용 → 회고 보너스. ~30 분 사이클로 묶어야 흐릿한 기억으로 안 빠짐
- **회고 = 스냅샷 + 후속 패치** (9주차 학습): retroactive rewrite 로 가설을 지우면 학습 가치 소실. 회고는 그 시점의 스냅샷, 정정은 인라인 sub-bullet (`### N번 X주차 fact-check`) 으로

### 5.5 Quality gate 1 패스 lock-in

`rm -f .eslintcache && lint && typecheck && format:check && build` 표준 시퀀스. 8주차 `b2af838` · 9주차 `b934f9b` 두 차례 fix-forward 후 10주차 7 커밋 모두 1 패스 → 12주차 4 커밋 모두 1 패스. **시퀀스 명시 (CLAUDE.md 라인 94, 9주차 `c58b50f`) → 의식 → 자동화 lock-in** 의 학습 곡선 확인.

### 5.6 메모리 시스템

- 활성 메모리 2 건: `feedback_retrospective_format.md` (회고 다음 주차 시작 방법 섹션 필수) + `project_floral_theme_redesign_pending.md` (사용자 트리거 전 자동 재진입 금지)
- **메모리 격상 vs 회고 본문 박음**: 일반 학습은 회고 본문, 사용자 트리거 의존 항목 / 영구 정책은 메모리. Monitor `$status` 충돌 같은 세부 finding 은 회고 본문 sub-bullet 충분 (메모리 격상 X)
- 12주 누적 메모리 회수 패턴: `project_week09_calendar...` 같은 단기 트리거 메모리는 9주차 회고 커밋에서 자연 회수

---

## 6. 정체성 결정 — 12주차 마지막 분기점

본 12주 호흡의 가장 큰 결정은 마지막 호흡에서 일어남. 사용자가 12주차 마무리 호흡 중간에 제안:

> **비개발자 사용자가 만들기 쉽게 모바일 청첩장 만드는 UI 부터 단계별로 입력해서 결과물이 딱 나오는 시나리오**

이건 v1.x (개발자 fork OSS 템플릿) 에서 v2.0 (SaaS) 로의 정체성 전환. 호흡 중간에 분석:

- 운영 책임의 무게 (24/7, 사고 시 결혼식 망함, 한국 개인정보보호법 / GDPR 주체)
- Blaze 플랜 비용 + 결제 시스템 도입
- 한국 SaaS 청첩장 시장의 차별성 어려움 (mycard · DearBeat · theirs · 바른청첩장 등 다수)
- 사이드 프로젝트 시간으로 SaaS 운영 어려움
- firebase.md 영구 스코프 (Cloud Functions / Auth / Storage 제외) 폐기 결정 동반

→ **사용자 결정**: "12주차 빠르게 마무리 짓고 추가 보완 개발 고도화" + v2.0 SaaS 는 별도 호흡 의도서로 분리. 본 12주 호흡은 v1.0 OSS 템플릿으로 closure.

**사용자 인용**: "지금 딱 정해져있으니까 더 개발 범위가 좁혀지는 느낌이라" — closure 의 ROI 정확한 표현. v1.0 박혀 있으니 v1.1 의 단위가 자연 작아짐.

---

## 7. 자산 인벤토리 (12주 누적)

### 7.1 코드 자산

- `app/` — `page.tsx` (RSC, Guestbook next/dynamic) · `layout.tsx` (`<html data-theme>`, OG metadata, 4 폰트) · `globals.css` (Classic + Modern + Floral CSS 변수 cascade)
- `components/sections/` — Main · Greeting · Gallery · Venue · Accounts · Guestbook (orchestrator + Form + List + DeleteConfirmModal) · Share
- `components/` (최상위) — DDayBadge · InAppBrowserNotice (Client 컴포넌트)
- `lib/` — `kakao.ts` · `map.ts` · `calendar.ts` · `clipboard.ts` · `date.ts` · `userAgent.ts` · `firebase.ts` · `hash.ts` · `profanity.ts` · `hooks.ts` (10 모듈)
- `invitation.config.ts` — 단일 진입점 (11 top-level 키)
- `firestore.rules` · `firebase.json` (8주차 `3412ef5`)

### 7.2 문서 자산

- **README.md / README.en.md** (264 / 264 줄, H2 10 개 양쪽 대칭) + **CHANGELOG.md** (v0.1.0 / v0.2.0 / v1.0.0 / Unreleased) + **CONTRIBUTING.md** (10주차)
- **`docs/`** — `00-roadmap.md` · `01-project-brief.md` · `02-week01-daily-guide.md` · `03-claude-code-setup.md` · `04-design-decisions.md` · `api-keys.md` · `config-guide.md` · `theme-guide.md`
- **`docs/adr/`** — 7 건 (ADR 001 ~ 007)
- **`docs/retrospective/`** — week-01 ~ week-10 + 본 회고 (project-v1.md)
- **`docs/blog-posts/`** — `2026-04-25-12week-retrospective.md` (velog/tistory 게시용 외부 톤 ~4,000자)
- **`.claude/rules/`** — `kakao-sdk.md` · `firebase.md` (Progressive Disclosure 규칙 파일 2 종)
- **`CLAUDE.md`** — 핵심 원칙 + 명령어 + 애니메이션 규칙 + 일하는 방식 + 세부 규칙 위치

### 7.3 데모 / 자료 자산

- **라이브 데모**: https://invitation-kit.vercel.app — 가상 커플 `김철수 ♥ 이영희` (10주차)
- **데모 스크린샷**: `public/images/screenshots/` 6 자산 (5 JPG + 1 PNG, 12주차 PNG 최적화 후 2.7 MB)
- **GitHub 토픽 9 개**: `wedding-invitation` · `wedding` · `korean` · `nextjs` · `template` · `firebase` · `tailwindcss` · `kakao` · `oss-template` (11주차 자산)
- **GitHub Release 3 건**: v0.1.0 (7주차) · v0.2.0 (9주차) · v1.0.0 (10주차)

### 7.4 메타 자산

- **ADR 7 건** — 모든 큰 결정 (App Router · Config-driven · Next.js 16 · Share buttons · 다중 테마 · 욕설 필터 · 본인 삭제) 명시 기록
- **거부 대안 누적 19 종** (7 ADR 의 거부 alternatives 합산) — 미래 fork 사용자가 "왜 X 안 썼지?" 질문에 답할 자료
- **회고 11 건** (week-01 ~ week-10 + project-v1) — 매 주차 스냅샷 + 학습 + 다음 주차 가정

---

## 8. v1.1+ → v2.0 분기 (다음 호흡)

### v1.1+ (1순위 후보)

- text-primary contrast 결정 (D-3 보류)
- OG png 최적화 + 카카오 캐시 무효화
- App Check (스팸 차단)
- i18n (한국어/영문 분기)
- RSVP (큰 신기능 1 개)
- 본인 삭제 서버 매개 (ADR 007 B 경로 트리거 충족 시)
- Pretendard dynamic-subset (Performance 90+ 시도)

### v1.2+ (여유 시)

BGM · Apple Calendar · GIF 데모 · 욕설 필터 외부 패키지 · Floral 재설정 · Modern accent 색

### v2.0 (별도 호흡 의도서, 본 v1.x 폐기 X)

웹 에디터 UI / SaaS — 멀티테넌시 + 사용자 인증 + 사진 업로드 + 결제. **본인 결혼식 후 + 운영 인프라·결제·법적 주체 결정 시 트리거**. 본 v1.x 와 별도 레포 또는 본 레포 안 `v2/` 디렉토리 (TBD).

---

## 9. 클로징 — 12주 호흡의 진짜 자산

12주 만든 코드 자체는 1 청첩장이지만, 진짜 자산은 **반복 가능한 사이클**:

1. **회고 → 스냅샷 → 다음 주차 우선 → 작업 → 회고 갱신** 의 12주 사이클
2. **ADR / firebase.md / kakao-sdk.md / CLAUDE.md** 의 결정 추적성 4 층
3. **Plan Mode → Quality gate → Commit → Push → 회고 패치** 의 작업 단위
4. **Claude 와의 협업 패턴** — Plan ROI / Auto mode 톤 / 회고 격상 / 메모리 / Progressive Disclosure
5. **closure 의 ROI** — v1.0 이 박혀야 v1.1 의 범위가 좁아진다 (12주차 사용자 인용)

본 v1.0 closure 시점에 자산이 fork 한 개발자 친구 1 명에게라도 진짜 ROI 가 발생하면 본 12주가 그만큼 가치 있음. 외부 사용자 0 명이라도 본 호흡의 학습은 다음 사이드 프로젝트 (또는 v2.0 SaaS) 에 그대로 carry over.

> **v1.0 closure. v1.1+ 는 좁아진 범위로 자연 진입.**

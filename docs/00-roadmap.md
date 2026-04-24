# 📍 invitation-kit · 12주 로드맵

> **살아있는 문서 (Living document).** 매 주차 끝날 때 이 문서를 업데이트하세요.
> 지난 주차는 "실제 한 것" 기준으로 기록하고, 남은 주차는 필요에 따라 재설계해도 됩니다.

**마지막 업데이트:** 2026-04-24 (5주차 완료 시점)

---

## 🎯 프로젝트 한 줄

한국 결혼식에 최적화된 오픈소스 모바일 청첩장 템플릿. Config 파일 하나만 수정하면 5분 안에 배포되는 `config-driven` 구조.

**기간:** 3개월(12주) · **시작일:** 2026-04-22 · **v1.0.0 목표:** 2026-06-30 (10주차 말)

---

## 📊 전체 진행 상황

| 단계                      |    주차    |    상태    | 마일스톤                     |
| ------------------------- | :--------: | :--------: | ---------------------------- |
| 1단계: 기획 + 셋업        |  Week 1-2  |  ✅ 완료   | 자동 배포 환경 + 디자인 토큰 |
| 2단계: Must 기능 개발     |  Week 3-6  | 🔄 진행 중 | v0.1.0 MVP                   |
| 3단계: Should 기능 + 테마 |  Week 7-8  |  ⏳ 예정   | 다중 테마 + 방명록           |
| 4단계: 문서화 + QA        |   Week 9   |  ⏳ 예정   | 비개발자도 5분 배포          |
| 5단계: 릴리스 + 홍보      | Week 10-11 |  ⏳ 예정   | v1.0.0 + 커뮤니티 공개       |
| 6단계: 유지보수 기반      |  Week 12   |  ⏳ 예정   | 루틴 정착                    |

**현재 진행도:** ⬛⬛⬛⬛⬛⬜⬜⬜⬜⬜⬜⬜ 5/12 주 (42%)

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
- **배운 것:**
  - 카카오 콘솔이 UI 개편으로 도메인 2 필드 분리 (`JavaScript SDK 도메인` = init 허용 · `웹 도메인` = link.webUrl 검증). 한 필드만 등록하면 sendDefault 는 성공하지만 카드 안 링크가 strip 되어 PC "모바일에서 확인" / iPhone 탭 무반응 증상
  - `buttons[].link.webUrl` 도 `content.link` 와 동일 검증 대상 — "지도 보기" 가 청첩장 홈으로 이동하는 버그로 재현, `map.kakao.com` 을 웹 도메인에 추가해 해결. 카카오 자사 도메인도 "다른 앱 관점에선 외부 도메인"
  - Kakao 공유 증상 시 "폴백 경로 vs 정상 경로" 를 가르는 3 질문 (토스트·팝업·앱 열림) 은 Network 탭 없이 사용자 증언만으로 진단 가능
  - README 는 매 주차 종료 시 "모든 구체적 기능 언급이 실제 코드와 일치하는지" 리뷰 리듬이 필요. 4주 누적되면 fiction·dead link 로 OSS 첫 방문자 신뢰도 훼손
- **6주차로 넘긴 것:**
  - 태스크 1: OG 이미지 제작·추가 (디자인 자원 블로커로 이월)
  - 태스크 2: 계좌번호 복사 섹션 (MVP Must 의 남은 핵심 기능)
  - 태스크 3: 사진 갤러리 + lightbox (사진 자원 블로커)
  - 태스크 4: D-day 카운트다운 (난이도 낮아 MVP 로 당길 수도)
  - 태스크 5: 인앱 웹뷰 안내 UI (UA 분기로 "외부 브라우저에서 열어주세요" 토스트)

---

## 🔜 남은 주차 계획

> 지난 5주 경험을 반영해 재조정합니다. 여기 적힌 건 계획일 뿐, 주차가 끝날 때 "실제 한 것"으로 위 섹션에 옮겨 적으세요.

### Week 6 · Should 기능 1 (방명록 + D-day)

**목표:** Firebase 연동으로 첫 인터랙티브 기능 구현.

- [ ] Firebase 프로젝트 생성 + Firestore 설정
- [ ] 방명록 CRUD (작성/조회/삭제, 비밀번호 해싱)
- [ ] 욕설 필터 (간단한 금칙어 리스트)
- [ ] D-day 카운트다운
- [ ] 구글 캘린더 일정 추가 버튼

**주의점**

- Firestore 보안 규칙 꼭 설정 — 방치하면 누구나 쓰기/삭제 가능
- `NEXT_PUBLIC_` 프리픽스 이해 (클라이언트 노출)
- Firebase 관련 작업 시 `.claude/rules/firebase.md` 참조 (없으면 이 주차에 생성)

### Week 7 · 다중 테마 시스템

**목표:** 프로젝트의 핵심 차별화 기능. Classic 외 2종 추가.

- [ ] 테마 구조 리팩터링 — `theme` config 값 하나로 전체 룩 전환
- [ ] 테마 2종 추가: Modern, Floral (또는 Minimal, Vintage)
- [ ] 각 테마별 폰트 조합, 컬러 토큰, 섹션별 스타일 분기
- [ ] 테마 전환 데모 페이지 (개발자용)

**생각해볼 것:** 테마 3종이 각각 "명확히 다른 인상"을 주는가? 그냥 컬러만 바꾼 수준이면 차별화가 약함. 폰트/여백/섹션 구성까지 조금씩 달라야 함.

### Week 8 · 문서화 + 배포 가이드

**목표:** "비개발자도 5분 배포" 약속을 실제로 지킬 수 있도록.

- [ ] `README.md` 다듬기 (스크린샷, GIF, 데모 링크)
- [ ] `docs/config-guide.md` — 모든 config 필드 설명
- [ ] `docs/api-keys.md` — 카카오/네이버/Firebase 키 발급 단계별 스크린샷
- [ ] `docs/theme-guide.md` — 새 테마 기여 방법
- [ ] 영상 튜토리얼 1개 (5~10분, YouTube 또는 loom)

### Week 9 · 최종 QA + v1.0 준비

- [ ] 테스트 커버리지 체크 (핵심 로직 70%+)
- [ ] 브라우저/기기 매트릭스 테스트
- [ ] 성능 최적화 (이미지, 번들 사이즈)
- [ ] Lighthouse 90+ 목표
- [ ] `CHANGELOG.md` 정리
- [ ] 라이선스/저작권 고지 최종 점검

### Week 10 · v1.0.0 릴리스

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

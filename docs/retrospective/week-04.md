# 4주차 회고 (2026-04-24)

> 다음 세션에서 읽을 사람은 이 파일만 봐도 4주차 결과와 5주차 진입 상태를 파악할 수 있어야 합니다.

---

## 완료한 것

### 태스크 1 · `share` 스키마에 카카오 `buttons` 필드 + ADR 004 (`522165a`)

- `ShareConfig` 에 `buttons?: { site?, map? }` 고정 시그니처 추가. URL 은 사용자가 쓰지 않고 구현이 `meta.siteUrl` · `venue.coords` 에서 자동 유도.
- 배열 (`buttons[]`) 대신 고정 시그니처를 택한 근거 4 가지 (config-driven · 데이터 중복 회피 · 카카오 "2개 이하" 제약과 정합 · YAGNI) 는 ADR 004 에 박힘.
- `.claude/rules/kakao-sdk.md` 의 공유 템플릿 원칙 섹션도 신규 스키마로 갱신. ADR 004 와 cross-link.
- 라벨 기본값 ("청첩장 보기" / "지도 보기") 은 스키마 아닌 `lib/kakao.ts` 에서 주입하기로 결정 — Task 5 에서 실제 적용.

### 태스크 3 · Greeting 섹션 (whileInView 1차 → CSS 회귀, `ef4a8bd` + `89699a1`)

3주차 회고에서 예고된 "framer-motion `whileInView` 첫 사용" 을 시도했으나 **iOS Safari 26 에서 3주차 Main 흰 화면과 동일 메커니즘 재현**:

- **1차 (`ef4a8bd`)**: `<section>` 정적 + 내부 `<motion.div>` 만 `whileInView`. 데스크톱 정상. 그러나 iPhone 12 Pro / iOS 26.3.1 에서 SSR HTML 의 `opacity:0` · `translateY` 가 hydration 후에도 풀리지 않아 영구 invisible. DOM 의 텍스트는 길게 누르면 선택 가능 → 3주차 흰 화면과 동일 진단.
- **회귀 (`89699a1`)**: framer-motion 제거, Server Component + `animate-fade-in-up` (Main 과 동일 패턴). 스크롤 트리거 UX 가치 포기.
- **3주차 가설 부분 오류 확정**: "스크롤 트리거는 framer-motion 이 적합" 이 위치(히어로 vs 스크롤 진입) 와 무관하게 **framer-motion 의 `initial → animate` 메커니즘 자체** 가 iOS 26 에서 깨짐. `whileInView` 도 같은 메커니즘이라 동일하게 깨짐.
- **CLAUDE.md "애니메이션 사용 규칙" 섹션 신설** — `initial → animate` 패턴 전역 금지, framer-motion 은 `AnimatePresence` / 제스처 같은 JS-only 영역에만. 영구 규칙으로 명문화.

### 보너스 · `scrollRestoration: "manual"` (`2e94d43`)

iPhone 회귀 검증 도중 사용자가 발견한 별개 이슈. 새로고침 시 직전 스크롤 위치로 복원되는 브라우저 표준 동작이 청첩장 정서 ("매 진입 = 신랑·신부 이름 첫인상") 와 충돌. 결정:

- `app/layout.tsx` 에 `next/script strategy="beforeInteractive"` 로 `history.scrollRestoration = "manual"` 1줄 주입. hydration 전에 실행되므로 scroll-then-jump 깜빡임 없음.
- `useEffect + scrollTo(0,0)` 대안 대비 깜빡임 없는 깔끔한 경로.
- 방명록(v1.0.0) 도입 시 폼 작성 중인 사용자를 위해 정밀 제어로 분리 재검토.

### 태스크 4 · Venue 섹션 + `lib/map.ts` 카카오맵 딥링크 (`6e9d3ac`)

- `lib/` 디렉토리 첫 등장. `kakaoMapDeeplink({ name, coords })` 순수 함수 — `https://map.kakao.com/link/to/...` HTTPS URL 만 사용 (kakao-sdk.md "kakaomap:// 커스텀 스킴 금지" 정책).
- 함수 시그니처는 **구조적 typing** — `invitation.config` 의 `Venue` 타입 직접 import 안 함. Task 5 의 카카오톡 공유 버튼이 같은 함수를 재사용할 때 결합도 낮음.
- Venue 섹션: name / hall / address / 카카오맵 CTA 버튼 / transportation (subway/bus/car/parking 각 optional `<dl>`).
- 네이버 지도 형제 함수는 후속 커밋. `lib/map.ts` 헤더에 명시.
- CLAUDE.md "진행 상태" 라인 갱신 (3주차 회고에서 적시한 트리거 — `lib/` 첫 등장 시).

### 태스크 2 + 5 · `.env.example` + Kakao SDK v2.8.1 + URL 복사 폴백 (`ce69b73`)

MVP Must 의 마지막 한 축. 두 태스크를 한 커밋에 묶은 이유는 kakao-sdk.md 의 ".env.example 은 실제 카카오 키 사용을 시작하는 커밋에서 추가" 정책.

- **`lib/kakao.ts`**: SSR 가드 + `isInitialized` 가드된 `initKakao`, `isKakaoShareReady`, `shareInvitation` wrapper. `ShareInput` 은 lib 자체 도메인 타입 (config 직접 import 회피, lib/map 과 일관).
- **`Share.tsx`**: `next/script strategy="afterInteractive"` + integrity sha384 로 SDK 로드. 버튼 클릭 시 `sendDefault` → 실패 catch → `navigator.clipboard.writeText` + 토스트 폴백. 토스트는 `useState` + `setTimeout(2200)` 자가 구현 (외부 라이브러리 무도입).
- **CDN 버전·SRI 해시**: 공식 다운로드 페이지 fetch + `curl | openssl dgst -sha384` 로 직접 계산 → `kakao_js_sdk/2.8.1/kakao.min.js`, `sha384-OL+ylM/iuPLtW5U3XcvLSGhE8JzReKDank5InqlHGWPhb4140/yrBw0bg0y7+C9J`.
- **라벨 기본값** ("청첩장 보기" / "지도 보기") 을 lib/kakao.ts 가 주입 — ADR 004 결정대로.
- **map 버튼 활성 시** Task 4 의 `kakaoMapDeeplink` 재사용. share.buttons 스키마와 lib/map 함수가 처음으로 한 호출에서 만남.
- `.env.example`: `NEXT_PUBLIC_KAKAO_APP_KEY=` 빈 샘플 + 안내 주석. `.gitignore` 에 `.env*.local` 패턴 이미 존재해 키 누출 위험 0.

---

## 막혔던 것 / 고민한 것

### 1. Greeting whileInView iOS 흰 화면 — 3주차 가설 부분 오류 (task 3)

3주차 회고가 "스크롤 트리거는 framer-motion 이 적합" 이라고 가설했지만 4주차 검증에서 깨짐. **framer-motion 의 `initial → animate` 메커니즘 자체** 가 SSR HTML 에 인라인 style 을 박고 JS 의 animate 호출이 그걸 덮어써야 풀리는데, iOS Safari 26 의 어떤 회귀 (확정 원인 미특정) 로 그 덮어쓰기가 안 됨. 위치 (히어로 vs 스크롤) 와 무관.

- **교훈**: 가설은 가설일 뿐 실전 검증 전엔 신뢰 X. **3주차의 "스크롤 트리거는 framer-motion 이 적합" 은 데스크톱 검증만 거친 가설** 이었다 — 모바일 1순위 원칙(CLAUDE.md 원칙 4) 을 가설 단계에서도 적용했어야.
- **CLAUDE.md "애니메이션 사용 규칙" 으로 영구화**: 4주차 회고와 동시 푸시. `initial → animate` 패턴 전역 금지, framer-motion 은 `AnimatePresence` / drag / gesture / `whileHover` / `whileTap` 같은 명시적 JS-only 영역에만. 패키지는 유지 (Gallery 의 lightbox, 인터랙션 등 미래 사용처).
- **모바일 검증을 1주차마다 1회 이상** 의 리듬 권장 — 이번에도 푸시 전 데스크톱만 통과 확인 후 iPhone 검증에서 회귀 발견 → 같은 주차에 회귀 커밋. 사이클 자체는 짧아서 부담 적음.

### 2. 카카오의 `link.webUrl` 도메인 강제 치환 정책 (task 5 검증)

코드 인프라 도입 후 데스크톱에서 카카오 웹 공유 UI 는 정상 표시되었으나, **받은 카카오톡 카드의 "청첩장 보기" / "지도 보기" 버튼이 `http://localhost:3300` 으로 연결**됨 (우리는 `:3000` 에서 dev 서버 띄움). 추적:

- `invitation.config.ts` 의 `meta.siteUrl` 은 `"https://example.vercel.app"` (예시 값) — 우리 코드는 이를 그대로 `link.webUrl` 에 박아 sendDefault 호출.
- 카카오톡 카드의 버튼 URL 은 `localhost:3300` — 우리가 보낸 적 없는 값.
- 사용자 추적: 카카오 콘솔 > 앱 설정 > 플랫폼 > Web > 사이트 도메인의 default 항목이 `:3300` → `:3000` 으로 수정해도 새 메시지에서 여전히 안 풀림.

가설 검증 (사용자가 제공한 [디벨로퍼톡 124973](https://devtalk.kakao.com/t/localhost-3000/124973) 통해 확정):

> 카카오 직원 답변: "Links are only permitted for registered site domains; others redirect to the default domain."

즉 **카카오는 콘솔 미등록 도메인의 link.webUrl 을 거부하지 않고 default 도메인으로 host 를 강제 치환** 해서 카드 만든다. path/query 만 살아남고 host 는 사라짐. iPhone Safari 의 "공유 버튼 무반응" 도 같은 메커니즘 — LAN IP `192.168.123.148:3000` 가 콘솔 미등록 → SDK 가 silent fail → 우리 catch 미발동 → 폴백 토스트도 안 뜸.

- **결론**: dev 환경 (localhost / LAN IP) 에서 카카오 공유 end-to-end 는 카카오 정책상 정상 흐름이 아니다. 우회 (콘솔에 localhost 를 default 로 등록 + meta.siteUrl 도 localhost 로 맞춤) 는 가능하지만 카카오 캐시·default 우선순위 등 추가 변수가 많아 시간 대비 가치 < 0. **진짜 검증은 프로덕션 도메인 + 실기기 카카오톡으로만.**
- **kakao-sdk.md "도메인 등록" 섹션에 `link.webUrl 도 등록 도메인이어야 한다` 신규 하위 섹션 추가**. devtalk 124973 인용.
- **5주차 1번 태스크 = vercel 첫 배포** — 이 검증의 전제 조건.

### 3. 새로고침 스크롤 위치 보존 vs 청첩장 첫인상 (보너스)

iPhone 회귀 도중 사용자가 발견. 브라우저 표준은 새로고침 시 스크롤 위치 복원이지만, 청첩장은 매 진입 = 신랑·신부 이름 히어로가 의도된 경험. 사용자 직관 ("청첩장이니까 새로고침하면 항상 첫 화면부터 나오는 게 맞지 않아?") 도 그쪽이라 `scrollRestoration = "manual"` 로 결정.

- 방명록(v1.0.0) 도입 시 폼 작성 중인 사용자 위해 정밀 제어 (scroll restoration 을 일부 컴포넌트 한정으로 끄기) 로 분리 재검토.

### 4. CSS keyframe SSR-safety 의 의미 (task 3 회귀의 핵심)

회귀 후 진단 정리: CSS `@keyframes fade-in-up` 도 0% 에서 `opacity:0` 시작이지만 안전한 이유는 **브라우저가 CSS 애니메이션을 무조건 실행** 하기 때문. JS 와 무관. JS 가 안 돌아도 keyframe 100% 까지 무조건 진행 → 끝나면 `opacity:1` 영구. framer-motion 은 SSR HTML 에 invisible 인라인 스타일을 박고 **JS 의 animate 호출이 풀어야** 풀림 → JS 안 돌면 영구 invisible. 메커니즘 차이.

---

## 4주차 체크리스트 최종

3주차 회고의 "4주차로 넘어가는 결정사항 우선 태스크 후보" 5 개 + 보너스 1 개:

- [x] 태스크 1 — `share` 스키마 buttons 결정 + ADR 004
- [x] 태스크 2 — `.env.example` 생성 (태스크 5 와 묶음)
- [x] 태스크 3 — Greeting 섹션 도입 (whileInView 시도 → CSS 회귀)
- [x] 태스크 4 — Venue + 카카오맵 딥링크
- [x] 태스크 5 — Kakao SDK 카카오톡 공유 + 폴백
- [x] 보너스 — `scrollRestoration: "manual"`

예상하지 못했던 추가 성과:

- [x] CLAUDE.md "애니메이션 사용 규칙" 섹션 신설 — `initial → animate` 패턴 전역 금지 명문화
- [x] kakao-sdk.md "도메인 등록" 섹션에 `link.webUrl 강제 치환` 정책 추가 (devtalk 발견)
- [x] `lib/` 디렉토리 첫 등장 + 구조적 typing 패턴 확립 (config 도메인 타입 직접 import 회피)
- [x] CSS-keyframe 의 SSR-safety 메커니즘 정리 (회고 막힌 것 4)

---

## 5주차로 넘어가는 결정사항

### 우선 태스크 후보 (난이도 / 의존성 순)

1. **vercel 계정 생성 + 첫 배포** — 4주차 카카오 검증을 막은 유일한 전제. vercel 받은 도메인을 카카오 콘솔에 등록 + `invitation.config.ts` 의 `meta.siteUrl` 그 도메인으로 교체 + `share.thumbnailUrl` 도 그 도메인 위의 og 이미지로 교체. 첫 배포 후 즉시 카카오 공유 end-to-end 검증 가능. **모든 후속 태스크의 토대.**
2. **카카오 공유 end-to-end 검증** — vercel 배포 직후. 데스크톱 + 실기기 카카오톡 모두. 회귀 시 fallback 진단.
3. **네이버 지도 형제 함수 + Venue 두 번째 버튼** — `lib/map.ts` 에 `naverMapDeeplink` 추가. URL 패턴 결정 필요 (검색 vs 좌표). CLAUDE.md WHY 섹션의 "네이버·카카오 지도" 1순위 한국 기능.
4. **GitHub Actions Node 24 업그레이드** — 매 CI 마다 annotation. 2026-06-02 강제 전환 전 갈음. `actions/checkout@v4` · `actions/setup-node@v4` 에 `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` env 또는 액션 메이저 버전업.
5. **OG 이미지 (`/public/images/og.jpg`) 제작·추가** — 카카오 카드 썸네일. 800×400 권장. 디자인 자원 필요.
6. **README 작성** — OSS 진입점. 사용자가 fork 후 따라할 수 있는 setup 가이드 (vercel + 카카오 콘솔 + .env.local 흐름 포함).

MVP Must 의 코드 인프라는 4주차에 모두 닫힘. 5주차는 **"코드 → 진짜 동작 환경" 으로 옮기는 주간**.

### 아직 스킵

- Gallery (이미지 에셋 확보 후 5~6주차 이후)
- 방명록 · D-day · 캘린더 (v1.0.0 스코프)
- 다중 테마 (v1.0.0)
- RSVP (v1.x)

---

## 5주차 첫 세션 시작 방법

1. `git log --oneline -10` — 최근 커밋 확인 (이 회고 이후 무엇이 쌓였는지)
2. **이 파일 (`docs/retrospective/week-04.md`) 을 다시 읽기** — 4주차 결론과 우선 태스크 목록이 여기에 있음
3. `docs/retrospective/week-03.md` 는 필요 시 참조만
4. `docs/02-week01-daily-guide.md` 외의 주차별 가이드 문서 존재 여부 확인 (`ls docs/*week*`). 아직 없으면 이 회고의 "우선 태스크 후보" 를 가이드로 사용.
5. **카카오 / vercel 관련 작업 시작 시 `.claude/rules/kakao-sdk.md` 자동 참조** — 4주차 갱신된 "도메인 등록" 섹션의 `link.webUrl 강제 치환` 정책이 vercel 배포 후 검증의 핵심.
6. 다음 태스크 **한 개** 를 제안 — 5주차 첫 세션은 **태스크 1 (vercel 계정 생성 + 첫 배포)** 가 다른 모든 검증의 전제라 1순위. vercel 계정 생성·깃허브 연동은 사용자가 직접 해야 하므로 그 단계 끝나야 진행 가능.
7. 사용자 승인 후 Plan Mode 브리핑 → 구현 → 품질 게이트 → 커밋 → 푸시 → CI 폴링 (3·4주차 루틴 그대로).

---

## CLAUDE.md 업데이트 필요 사항

- 4주차 진행 중 이미 두 번 갱신 (Task 4 의 `lib/` 도입 시점 + Task 5 의 `Share` 섹션·`lib/kakao.ts` 도입 시점). 진행 상태 라인 최신.
- "애니메이션 사용 규칙" 섹션 신설 (Task 3 회귀 커밋과 함께).
- 5주차에 vercel 첫 배포 시 "Vercel 배포" 와 관련된 환경변수·도메인 메모를 CLAUDE.md 에 추가할 가능성. 그땐 그때 갱신.

---

## 메트릭 / 비고

- **4주차 커밋 수**: 6 개 (이 회고 커밋 제외)
  - `522165a` · `ef4a8bd` · `89699a1` · `2e94d43` · `6e9d3ac` · `ce69b73`
- **미푸시 커밋**: 0 개 (회고 커밋 전 기준)
- **CI 런**: 6 회, 모두 녹색 · 평균 31 초 (40s · 28s · 35s · 29s · 30s · 26s) — 3주차 평균 (~36s) 보다 더 빠름
- **외부 기여자**: 0 명
- **가장 큰 단일 변화**: Kakao SDK 도입 커밋 (`ce69b73`, +195 줄, 5 files create)
- **세션 리듬**: 한 세션에 6 커밋 압축 진행 (3·4주차 동일 리듬). Task 1 → 3 → 보너스 → 4 → 2+5 → 회고
- **의존성 추가**: 0 (Kakao SDK 는 npm 미배포, CDN 만)
- **iPhone end-to-end 검증으로 1차 구현 폐기**: Greeting `whileInView` (회귀 사이클 재현 — 3주차 Main 패턴 반복)
- **외부 발견 1건**: 카카오 `link.webUrl` 도메인 강제 치환 정책 (devtalk 124973). kakao-sdk.md 영구 명문화.
- **공식 docs WebFetch 1건**: Kakao SDK v2.8.1 다운로드 페이지 + SRI 해시 직접 계산 (`curl | openssl dgst -sha384`)

---

## 한 줄 총평

> **4주차는 "MVP Must 의 코드 인프라를 모두 깐 주간이자, framer-motion 의 한계 (iOS 26) 와 카카오의 정책 (도메인 강제 치환) 두 외부 제약을 실전으로 마주한 주간".** 코드는 완성됐고, 진짜 end-to-end 검증은 5주차 vercel 배포로 넘어간다. 두 외부 제약은 각각 CLAUDE.md "애니메이션 사용 규칙" 과 kakao-sdk.md "도메인 등록" 섹션에 영구 규칙으로 박아 같은 함정에 두 번 빠지지 않게 했다.

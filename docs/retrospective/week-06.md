# 6주차 회고 (2026-04-25)

> 다음 세션에서 읽을 사람은 이 파일만 봐도 6주차 결과와 7주차 진입 상태를 파악할 수 있어야 합니다.

---

## 완료한 것

### 태스크 1 · 계좌번호 복사 섹션 (`b704fb5`)

v0.1.0 MVP Must 의 남은 핵심 기능 둘 중 사진 자원 블로커 없는 쪽 선제 마감.

- `lib/clipboard.ts` 신규 — `copyText(text): Promise<boolean>` 단일 export. `navigator.clipboard` 존재 체크 + try/catch. deprecated `document.execCommand` 폴백 없음 — secure context (HTTPS · localhost) + user-gesture 전제라 실패 시 false 반환해 호출부가 토스트로 수동 복사 유도.
- `components/sections/Accounts.tsx` 신규 — "마음 전하실 곳" 섹션. 아코디언 (`grid-template-rows: 0fr ↔ 1fr` CSS transition) + 신랑/신부 세그먼트 라디오 토글 + 각 계좌 카드의 [복사] 버튼. 복사 대상은 `number.replace(/-/g, "")` — 일부 은행 앱이 하이픈 붙은 번호 파싱 실패하는 사례 회피. 표시는 가독성 위해 하이픈 유지.
- `Account.kakaoPayUrl`·`tossUrl` 은 존재할 때만 해당 딥링크 버튼 조건부 렌더 (config-driven 원칙). 샘플 data 에는 없어 기본 화면엔 [복사] 만 노출, 사용자가 config 에 URL 추가하면 자동 등장.
- `components/sections/Share.tsx` 를 같은 헬퍼로 리팩터 — 인라인 `navigator.clipboard.writeText` 호출을 `copyText` 로 통합 (중복 제거). "한 번에 하나의 완결된 태스크" 원칙과 저촉되지 않는 소규모 동시 리팩터.
- 토스트 UX 는 Share 패턴 인라인 복붙 (`useState<string | null>` + `setTimeout(2200)` + `role="status"`). 3 번째 소비자 등장 시 `components/shared/Toast.tsx` 추출하기로 남김.

### 태스크 2 · 사진 갤러리 + 라이트박스 (`fa9b78f`)

v0.1.0 MVP Must 의 마지막 한 건. 사용자가 테스트용 샘플 사진 10 장을 준비한 직후 착수.

- `components/sections/Gallery.tsx` 신규 — CSS `columns-2 sm:columns-3` + `break-inside-avoid` masonry 그리드. iOS Safari 전 버전 지원. 썸네일은 `next/image` (width/height 명시로 CLS 0, 첫 3 장 `priority`, 나머지 lazy, `sizes="(min-width: 640px) 33vw, 50vw"`).
- 라이트박스 — framer-motion `AnimatePresence` 조건부 마운트. CLAUDE.md 애니메이션 규칙의 "JS-only 영역 (AnimatePresence · 제스처)" 허용 조항에 명시적으로 의존한 첫 사례. SSR HTML 에 요소 자체가 없어 invisible 인라인 스타일 박힘 원천 차단 — 3-4 주차 때 겪은 iOS Safari 26 회귀와 무관.
- 닫기 3 경로 (X 버튼 · 백드롭 탭 · Escape), 네비 3 경로 (좌우 버튼 · ArrowLeft·Right 키 · 100px threshold 스와이프 via `motion.div drag="x"`), wrap-around 순환.
- body scroll lock: `overflow: hidden` + `touchAction: none` 병행. iOS Safari 가 overflow 만으로 터치 스크롤 완전 차단 못 하는 사례 대응. cleanup 에서 원래 값 복원.
- `invitation.config.ts` 의 `gallery` 배열 샘플 2 장 → 실제 9 엔트리. `sips` 로 확인한 원본 해상도로 width/height 채움.
- `app/page.tsx` Greeting 과 Venue 사이 배치 (한국 청첩장 전형 순서).
- 사진 자원: `public/images/gallery/sample-01 ~ sample-09.jpg` 9 장. `.gitignore` 의 `!sample-*.jpg` 예외로 upstream 포함.

### 태스크 3 · D-day 배지 (`e059dcb` → `61a468d`)

5 주차 회고 우선 후보 3 번. 원래 v1.0 스코프였으나 난이도 낮고 히어로 첫 인상 강화 효과가 커서 MVP 로 당김.

- `lib/date.ts` 신규 — `daysUntil(target: Date | string): number`. 자정 기준 일수 차이 계산해 시·분·초·타임존 변동 비의존. `getFullYear/Month/Date` 가 로컬 시간대 기준이라 한국 사용자 KST, 해외 접속자도 자기 로컬 달력 기준으로 자연스러운 D-day.
- `components/DDayBadge.tsx` 신규 — Client Component. `Main.tsx` (SSR) 가 import 하는 App Router composition 패턴. h1 아래 sibling. `Main` 의 `animate-fade-in-up` 래퍼 밖에 두어 "이름은 처음부터, 배지는 마운트 후" 시각 리듬 분리.
- 카피 분기: `D-{n}` + "결혼식까지 {n}일 남았어요" · `D-DAY` + "오늘은 저희의 결혼식이에요" · 과거 날짜면 조용히 `return null`.
- **fix 커밋 (`61a468d`)** — 첫 구현 (`e059dcb`) 은 `useState(null) + useEffect(setDays, [])` 표준 SSR-safe 패턴이었으나 CI 의 React 19 신규 ESLint 규칙 `react-hooks/set-state-in-effect` 에서 에러. `useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)` 기반 `useIsClient` 훅으로 리팩터. `days` 를 state 아닌 매 render 파생값으로 끌어내려 effect/setState 자체를 제거. SSR 은 여전히 null 반환 → hydration mismatch 없음. 이후 태스크 4 에도 같은 훅 그대로 재사용.

### 태스크 4 · 인앱 웹뷰 안내 배너 (`84f1037`)

5 주차 회고 우선 후보 4. `kakao-sdk.md` Gotcha 섹션이 예고했던 안내 UI.

- `lib/userAgent.ts` 신규 — `isInAppBrowser(ua)` 순수 함수. 시그니처는 false-positive 낮은 확실한 토큰만 (`KAKAOTALK | Instagram | FBAN | FBAV | NAVER | Line/`). Android `;wv` 같은 광범위 토큰은 Chrome false-positive 위험으로 의도적 제외.
- `components/InAppBrowserNotice.tsx` 신규 — Client Component. 태스크 3 의 `useIsClient` 훅 로컬 복제 (2 번째 등장, 3 번째 등장 시 `lib/hooks.ts` 추출). `sessionStorage` dismiss 기억 — 같은 탭엔 안 뜨고 새 탭엔 다시 뜸 (`localStorage` 는 과도). private 모드 quota 0 케이스는 try/catch 로 메모리 상 dismiss 만 반영.
- `app/page.tsx` `<main>` 최상단 sibling. 일반 브라우저는 `return null` 이라 DOM 요소 0, client bundle 만 약 1KB 증가. 갤러리 라이트박스 (`z-50`) 가 배너 (`z-40`) 위로 자연스럽게 얹힘.
- 카피는 친근한 질문형 ("카톡 안에서 보고 계신가요?") + 구체적 행동 ("외부 브라우저(사파리·크롬)로 열어주세요").

### 보너스 · 사진 자원 정리 (태스크 2 와 묶임)

- 사용자가 `public/images/` 에 `wed01.jpg ~ wed09.jpg + wed02.png` 직접 배치 → 스키마 주석의 `public/images/gallery/` 경로와 불일치 → 10 장 전부 `gallery/` 서브폴더로 이동.
- 이동 과정에서 `cd public/images` 가 Bash 세션 간 working dir 을 누적해 `public/images/public/images/gallery` 중첩 디렉토리가 생성되는 사고 1 건 — 중첩 정리 후 모든 `mv` 는 절대 경로로 재실행.
- `wed02.png` (914KB) 는 `sips -s format jpeg -s formatOptions 90` 로 `sample-02.jpg` (128KB, 1/7) 변환 후 나머지 wed01·03~09 와 함께 `sample-0N.jpg` 리네이밍. `.gitignore` 의 `!sample-*.jpg` 예외에 자동 포착되어 Vercel 배포 자산으로 편입.

### 보너스 · 프로젝트 정체성 재확인 대화

"사진도 초기 세팅화면에서 선택하는 방식" (웹 에디터 UI) 을 기대했다는 사용자 질문으로 현 방향 재확인. 네 가지 옵션 (A 현 방향 · B pivot 지금 · C 외부 스토리지 · D 로컬 전용) 중 **A (현 방향 유지 + v1.1 이후 웹 에디터 검토)** 선택. `docs/00-roadmap.md` 의 Week 12 엔트리에 이미 "v1.1 마일스톤 정의 (RSVP, 웹 에디터 UI 등)" 로 포지셔닝된 구도를 재확인. 3 개월 MVP 로드맵에 SaaS 아키텍처는 담기지 않는다는 합의.

---

## 막혔던 것 / 고민한 것

### 1. React 19 `react-hooks/set-state-in-effect` rule 과의 조우 (태스크 3)

D-day 첫 커밋 `e059dcb` 가 CI 에서 실패:

```
error  Calling setState synchronously within an effect can trigger
       cascading renders. (react-hooks/set-state-in-effect)
```

로컬 `npm run lint` 는 통과했는데 CI 실패 — `.eslintcache` 가 이 신규 규칙을 적용하지 않은 채 녹색으로 넘겨준 탓. CI 는 fresh 환경이라 규칙 빠짐없이 적용.

해결 경로 탐색:

- (A) eslint-disable 주석 — 정당한 패턴이긴 한데 우회 느낌
- (B) 로직 재설계: state 제거하고 매 render 파생값 + mount flag 만 useState 로
- (C) `useSyncExternalStore` 기반 `useIsClient` 훅 — React 19 권장

**(C) 채택**. 내부적으로 stable `subscribe` / `getClientSnapshot` / `getServerSnapshot` 상수를 모듈 레벨에 두어 재렌더 안정성 확보. 태스크 4 (인앱 배너) 에서 그대로 재사용, 두 곳 모두 `useState` 는 순수 handler state 용도로만 (effect 안 setState 0 건).

- **교훈**: lint 규칙 업그레이드가 있는 상황이면 `rm -rf .eslintcache` 후 재실행이 안전 확인 절차. 이번 학습으로 태스크 4 품질 게이트에선 캐시 비우고 돌려 CI 와 로컬 결과 일치 확인.
- **부수 수확**: `useIsClient` 훅이 Client Component 의 마운트 감지 기본 템플릿으로 자리잡음. 3 번째 등장 시 `lib/hooks.ts` 또는 `components/shared/hooks.ts` 로 추출 예정.

### 2. Bash 세션의 working directory 누적 (태스크 2 부수)

사진 이동 작업 중 `cd public/images && mkdir -p gallery && mv ...` 를 실패 후 재시도하면서 두 번째 호출에서 상대경로 `cd public/images` 가 이미 `.../public/images` 인 상태에서 다시 실행돼 `/Users/kyong/projects/invitation-kit/public/images/public/images/gallery` 라는 **중첩 디렉토리** 를 생성. 실제 이미지는 엉뚱한 곳에 있고 gallery 는 비어있는 상태로 `ls` 에 `public` 이라는 이상한 디렉토리가 섞여 있어 이상 감지.

- **해결**: 중첩 `rmdir` 로 정리 + 이후 모든 `mv`·`mkdir` 는 절대 경로 (`/Users/kyong/projects/invitation-kit/public/images/...`) 로 재실행.
- **교훈**: Bash 도구가 연속 호출 사이에 working dir 을 유지한다는 사실. 파일 이동·디렉토리 생성처럼 경로 의존 작업은 상대 경로 대신 절대 경로가 기본값. 실수 복원 비용이 낮아 괜찮았지만, destructive 한 작업이었다면 큰 사고.

### 3. 사진 자산 정책 — gitignore vs Vercel 배포 가능성 (태스크 2 후반)

`wed*.jpg` 를 이동 후 커밋 직전 `git status` 에 이미지 파일이 안 보임 → `.gitignore` 56 번째 라인의 `public/images/gallery/*` 가 이미지 전체를 ignore. 그대로 커밋하면 upstream / Vercel 에 이미지 없어 프로덕션 갤러리 전부 깨짐.

옵션 4 개 중 사용자와 상의:

- (A) gitignore 에 `!wed*.jpg` 예외 추가
- (B) 파일명을 `sample-*.jpg` 로 리네임 (기존 예외 활용)
- (C) 외부 스토리지 (Cloudinary / Vercel Blob)
- (D) 로컬 전용 유지, 배포 포기

사용자 의도 ("테스트용 + 다른 사람들이 템플릿 쉽게 사용") 와 맞아떨어지는 **(B)** 선택. `sample-*.jpg` 이름이 "교체 전제의 데모 사진" 성격을 정확히 표현. wed02.png 한 장은 q90 JPG 변환해 포맷도 통일.

- **교훈**: OSS 템플릿의 `.gitignore` 초기 설계 (`!sample-*.jpg` 예외) 가 정확히 이 시나리오를 예견한 형태. 본인 실사용 자원을 어떻게 두느냐는 사용자가 OSS 템플릿 정체성과 개인 사이트 정체성을 어떻게 분리하느냐의 문제. 같은 repo 에서 둘 다 하려면 파일 이름 규칙으로 구분하는 게 가장 경제적.

### 4. 프로젝트 정체성 — Config-driven vs 웹 에디터 SaaS

사진 리네이밍 논의 직후 사용자가 **"원래 사진도 초기 세팅화면에서 직접 선택해서 세팅하는 식을 원했다"** 고 의중 공개. 현 구조는 `invitation.config.ts` 편집 + 파일 직접 업로드 + `git push` 흐름 — 비개발자 타깃과 거리가 있음.

두 방향 대조:

- **현 방향** — 정적 템플릿. 타깃 = 개발자 (또는 개발자 친구). Fork + 편집 + Vercel 1-click.
- **웹 에디터** — SaaS. 백엔드 + 인증 + 멀티테넌트 서브도메인 + 이미지 스토리지 + 결제. 완전히 다른 아키텍처.

`docs/00-roadmap.md` Week 12 엔트리에 "v1.1 마일스톤 정의 (RSVP, 웹 에디터 UI 등)" 로 이미 포지셔닝 되어 있음 — 3 개월 MVP 로드맵에 담기 불가능해 의도적으로 미뤄둔 것. 사용자 결정: **현 방향 유지 · v0.1.0 릴리스 후 실사용 수요 보고 v1.1 방향 검토**.

- **교훈**: 3 개월 로드맵의 기본 가정 (타깃 사용자 · 아키텍처 레벨) 을 주기적으로 재검증하는 대화가 중요. 이번엔 "5 주차 지나 6 주차 중반에 재확인" — 늦지 않은 타이밍. 지금까지 쌓은 5 주 분 코드가 전부 정적 템플릿 전제 위에 있으므로 pivot 비용이 매우 큼, "완주 + 피드백" 이 합리적 판단.

### 5. framer-motion 애니메이션 규칙 경계 탐색 (태스크 2)

3 주차 Main 흰 화면 · 4 주차 Greeting `whileInView` 회귀로 확립된 "motion.\* `initial`/`animate` 금지" 규칙을 Gallery 라이트박스에서 처음 돌파. 근거:

- `AnimatePresence` 자식은 **조건부 마운트** — `activeIdx !== null` 일 때만 렌더. SSR HTML 에 요소 자체가 없어 invisible 인라인 스타일 박힘 원천 차단.
- CLAUDE.md 애니메이션 규칙 본문이 "framer-motion 은 JS-only 영역에만: AnimatePresence (마운트/언마운트 전환)" 로 이미 명시 허용 범위. 규칙 돌파가 아니라 규칙이 허용한 영역에 처음 진입.

내부 `motion.div key={activeIdx}` 재마운트도 동일 논리 — activeIdx 변할 때마다 새 DOM, 새 fade-in. iOS Safari 실기기 확인은 Vercel 배포 후.

- **교훈**: 규칙 문장 그대로를 반복하면 이런 정당한 사용 케이스마저 주저하게 됨. 규칙의 **이유** (SSR invisible 인라인 박힘) 를 매번 환원해 판단. 이번 AnimatePresence 사용은 그 이유에 저촉되지 않는 영역.

### 6. Next/Image 저해상도 원본 UX (태스크 2)

사용자 제공 샘플 사진 긴 변 330~1200px 중 6 장이 800px 미만. 레티나 모바일 뷰포트 (CSS 375px × 3x = 1125px) 에서 흐릿할 수 있음 — Next/Image 는 upscale 안 함, 원본 해상도 내에서 WebP 최적화만.

- **결정**: 기능 검증엔 충분 + 데모용 sample 이라 그대로 유지. 실제 사용자는 고해상도 파일로 교체 (파일명 규약만 지키면 config 변경도 불필요).
- **교훈**: `GalleryImage.width/height` 는 레이아웃 안정화 값이지 원본 해상도 상한이 아님. 향후 config 스키마 주석에 "권장 긴 변 1600~2400px" 한 줄 추가 가치 — v1.0 문서화 주차에 포함.

---

## 6주차 체크리스트 최종

5 주차 회고의 "6 주차로 넘어가는 결정사항 우선 태스크 후보" 4 개 전부 완료:

- [x] 태스크 1 — 계좌번호 복사 섹션 (`b704fb5`)
- [x] 태스크 2 — 사진 갤러리 + 라이트박스 (`fa9b78f`)
- [x] 태스크 3 — D-day 배지 (`e059dcb` · React 19 rule fix `61a468d`)
- [x] 태스크 4 — 인앱 웹뷰 안내 배너 (`84f1037`)

예상치 못한 추가:

- [x] `lib/clipboard.ts` · `lib/date.ts` · `lib/userAgent.ts` 3 개 신규 — 각각 Share·Accounts / DDayBadge / InAppBrowserNotice 가 공유
- [x] `useSyncExternalStore` 기반 `useIsClient` 패턴 확립 — Client Component 기본 템플릿 후보, 3 번째 사용처 등장 시 `lib/hooks.ts` 추출
- [x] 사진 자산 정책 재설계 — `sample-*.jpg` 데모 자리 + `wed*.jpg` fork 로컬 전용
- [x] `wed02.png` → `sample-02.jpg` JPG 변환 (q90, 1/7 크기)
- [x] 프로젝트 정체성 재확인 대화 — 현 방향 유지 · v1.1 이후 웹 에디터 검토 결정

---

## 7주차로 넘어가는 결정사항

### v0.1.0 릴리스 가능 상태 도달

MVP Must 6 건 + Should 2 건 (D-day · 인앱 안내) 전부 마감. `npm run build` Static · `npm run typecheck` / `lint` / `format:check` 전부 녹색. Vercel 자동 배포 운영 중. **원 로드맵은 v0.1.0 을 5~6 주차로 잡았으므로 일정 onboard**.

### 우선 태스크 후보 (난이도·블로커 순)

1. **v0.1.0 태그 + GitHub Release 노트** — `CHANGELOG.md` 신규 + `git tag v0.1.0` + Release UI 에 기능 목록 요약. 난이도 낮음, 블로커 없음. OSS 첫 공개 신호 — velog/OKKY 홍보 (v1.0 · 10 주차) 대비 예비 단계. 7 주차 첫 세션 기본 추천.
2. **다중 테마 시스템 설계** — v1.0 핵심 차별화. Classic 외 Modern/Floral 2 종 추가. `theme` config 값 하나로 폰트·팔레트·섹션 스타일 분기. 난이도 중-상. Tailwind v4 `@theme` 토큰을 어떻게 런타임 전환시킬지 (CSS 변수 override · 멀티 theme 클래스 토글 등) 실험 필요. 7~8 주차 2 주짜리 이슈.
3. **방명록 (Firebase)** — 원 Week 6 계획에서 실제 경로와 갈린 이월 태스크. Firestore 보안 규칙 · CRUD · 비밀번호 해싱 · 욕설 필터. `.claude/rules/firebase.md` 신규 필요. 난이도 중, 외부 서비스 설정 포함.
4. **구글 캘린더 버튼** — `google.com/calendar/render?...` URL 딥링크. Venue 섹션에 추가. 난이도 낮음, 네이버/카카오 지도 같은 패턴.

### v0.1.0 → v1.0.0 간 스코프 재점검

- **v0.1.0 (지금)** — 정적 청첩장 + 기본 공유 + D-day + 인앱 안내
- **v1.0.0 (10 주차 목표)** — 다중 테마 + 방명록 + 캘린더 (D-day 는 이미 들어감)
- **v1.1+** — 웹 에디터 UI, 결제, 다국어, BGM, RSVP

### 아직 스킵

- 웹 에디터 (v1.1+) — 이번 주 정체성 재확인 결과 "v0.1.0 이후 수요 보고 검토"
- RSVP · 방명록과 같은 Firebase 기반 묶음
- BGM · 음악 (v1.1)
- 다국어 (v1.1 이후)

---

## 7주차 첫 세션 시작 방법

1. `git log --oneline -15` — 6 주차 커밋 5 개 + 이 회고 커밋까지 확인
2. **이 파일 (`docs/retrospective/week-06.md`) 을 다시 읽기** — 6 주차 결과와 7 주차 우선 태스크
3. `docs/00-roadmap.md` 확인 — 전체 진행도 6/12 반영됐는지, Week 7 엔트리와 이 회고의 "우선 태스크 후보" 가 일치하는지
4. `docs/retrospective/week-05.md` 는 필요 시 참조만 (카카오 콘솔 UI 개편 맥락 필요할 때)
5. **v0.1.0 릴리스 의사 확인** — 사용자가 지금 릴리스할지 물으면 태스크 1 (태그+릴리스 노트). 아니면 태스크 2 (테마 시스템) 로 직진
6. **Firebase 관련 작업 재등장 시 `.claude/rules/firebase.md` 참조** — 없으면 방명록 도입 주차에 생성
7. **Client Component 기본 템플릿** — `useSyncExternalStore` 기반 `useIsClient` 훅은 `DDayBadge.tsx:9-13` + `InAppBrowserNotice.tsx:9-13` 에 동일 구현. 3 번째 등장 시 `lib/hooks.ts` 추출
8. 사용자 승인 후 Plan Mode → 구현 → 품질 게이트 → 커밋 → 푸시 → CI 폴링 (3-6 주차 루틴 동일). 품질 게이트에서 `.eslintcache` 비우고 돌리는 습관 유지 (이번 D-day fix 학습)

---

## CLAUDE.md 업데이트 필요 사항

- "진행 상태 (4주차 종료 시점)" 라인 → "6주차 종료 시점" 으로 갱신. 추가 항목:
  - `components/sections/` 에 `Accounts`, `Gallery` 추가
  - `components/` 최상위에 `DDayBadge`, `InAppBrowserNotice` 2 개 (sections 외 Client 컴포넌트)
  - `lib/` 에 `clipboard.ts` · `date.ts` · `userAgent.ts` 추가 · `map.ts` 는 카카오맵 + 네이버 지도 형제 함수 병기
  - `public/images/og.png` · `public/images/gallery/sample-01~09.jpg`
  - `components/theme/`·`components/shared/` 여전히 미도입 (7 주차 테마 시스템 때 예정)
- 이번 회고 커밋에 묶어 동시 갱신.

---

## 메트릭 / 비고

- **6주차 커밋 수**: 5 개 (회고·로드맵·CLAUDE.md 동기화 커밋 제외)
  - `b704fb5` feat(accounts) · `fa9b78f` feat(gallery) · `e059dcb` feat(dday) · `61a468d` fix(dday) · `84f1037` feat(notice)
- **미푸시 커밋**: 0
- **CI 런**: 5 회. `feat(dday)` 최초 1 건 실패 (React 19 rule) 후 `fix(dday)` 부터 전부 녹색
- **외부 기여자**: 0 명
- **가장 큰 단일 변화**: Gallery 커밋 (`fa9b78f`, +216 / −6, 이미지 9 장 포함)
- **의존성 추가**: 0 — `framer-motion` 이미 2 주차부터 설치돼 있어 Gallery 라이트박스에서 추가 번들 비용 없음
- **세션 리듬**: 한 세션에 5 커밋 + 프로젝트 정체성 재확인 대화 + 사진 10 장 수작업 자산 조정 (이동·JPG 변환·리네이밍). 3-5 주차와 유사한 고밀도 유지
- **신규 React 19 패턴 채택**: `useSyncExternalStore` 기반 `useIsClient` — 두 Client Component (`DDayBadge`·`InAppBrowserNotice`) 공통 사용
- **코드 외 작업**: 사진 10 장 자산 정리 · gitignore 정책 재검토 · 프로젝트 정체성 대화
- **공식 docs WebFetch**: 0 (이번 주차는 내부 UI · 리팩터 중심)
- **외부 발견·문서화 1 건**: React 19 `react-hooks/set-state-in-effect` rule 과의 첫 조우 — 로컬 eslintcache vs CI fresh 차이로 갈라지는 fail 유형까지 포함해 향후 품질 게이트에 "`.eslintcache` 비우고 재실행" 체크포인트 편입

---

## 한 줄 총평

> **6 주차는 "MVP Must 마감 · Should 당겨 포함 · 프로젝트 정체성 재확인" 3 박자로 v0.1.0 릴리스 직전까지 진입한 주간.** 계좌·갤러리로 Must 6 건을 닫고, D-day·인앱 안내를 Should 에서 당겨 수준을 한 단계 올렸다. React 19 신규 rule `react-hooks/set-state-in-effect` 와 처음 조우해 `useSyncExternalStore` 기반 `useIsClient` 훅으로 대응, Client Component 마운트 감지 기본 템플릿을 두 컴포넌트에서 확립. 사진 자산은 `sample-*.jpg` 네이밍으로 OSS 템플릿 정체성 + Vercel 배포 가능성을 동시에 확보. "웹 에디터 UI" 기대는 v1.1 이후 검토로 합의하며 3 개월 MVP 로드맵의 기본 가정을 재확인. 7 주차는 v0.1.0 태그 · 릴리스 노트 후 다중 테마 시스템 설계로 진입.

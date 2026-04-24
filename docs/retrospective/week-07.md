# 7주차 회고 (2026-04-25)

> 다음 세션에서 읽을 사람은 이 파일만 봐도 7주차 결과와 8주차 진입 상태를 파악할 수 있어야 합니다.

---

## 완료한 것

### 태스크 1 · v0.1.0 첫 공개 릴리스 (`b629ba6` + 태그 `v0.1.0`)

6주차 회고의 우선 후보 1번이자 7주차 첫 세션 기본 추천. MVP Must 6 + Should 2 가 마감된 상태에서 "무엇이 v0.1.0 인지" 경계를 긋는 breakpoint.

- **`CHANGELOG.md` 신규** — Keep a Changelog 포맷 · 한국어 primary. v0.1.0 `Added` 12 항목 (섹션 7 + 테마 + OG + CI) · `Known Limitations` 5 건 (카카오 프리뷰 검증 불가 · 인앱 웹뷰 공유 제한 · 샘플 사진 저해상 · 단일 테마 · iOS Safari 26 framer-motion 회귀) · `Not yet` v1.0/v1.1 분리 · 설치 가이드.
- **`package.json` 메타 보강** — `description` · `license` · `author` · `repository` · `bugs` · `homepage` 6 개 필드 추가. `author` 는 LICENSE 의 "invitation-kit contributors" 와 일치시켜 OSS 정체성 통일.
- **Annotated tag `v0.1.0`** — CHANGELOG 커밋 지점 (`b629ba6`) 에 찍음. 플랜 초안은 `485055f` 지점이었으나 CHANGELOG 자체가 v0.1.0 아티팩트라 포함하는 게 자연스러움. (Plan 에서 한 번 벗어난 사례, 합리적 교정)
- **GitHub Release 생성** — 영문 summary 2 줄 + 한국어 본문 (CHANGELOG 축약) + 설치 가이드 링크. `gh release create --latest` 로 published · not draft · not prerelease. 다른 태그/릴리스 없어 자동 `Latest` 플래그 획득. URL: https://github.com/kyongskim/invitation-kit/releases/tag/v0.1.0
- **CI**: 성공 (lint · typecheck · format:check · build 4/4 녹색)

### 태스크 2 · 다중 테마 시스템 스파이크 (`099f0b4` ADR 005 + `9f01ff2` Modern + 인프라)

Week 7 로드맵 체크박스 2·3번. 원래 단일 태스크로 잡혔으나 **ADR 먼저 · 구현 뒤** 로 2 커밋 분할 — "왜 이 구현인가" 를 git history 에서 즉시 찾을 수 있게.

- **`docs/adr/005-multi-theme-runtime-strategy.md`** — 결정 5 건 기록 (전환 메커니즘 `:root[data-theme]` CSS 변수 override · 빌드타임 타이밍 · Modern 구체값 · union 축소 `"classic" | "modern"` · 폰트 상시 로드). 거부된 대안 A~E (멀티 `@theme` · 빌드타임 CSS 분리 · body class · CSS-in-JS · CSS Modules) 근거 함께. Prettier 가 비교 테이블을 자동 재정렬 — 되돌리지 않음.
- **`app/globals.css` 리팩터** — `@theme` 블록에 Classic 기본값 + `--radius-sm: 0.375rem` 추가, `:root[data-theme="modern"]` override 블록 신규. Modern: slate-900 계열 near-black (`#0f172a`) + slate-600 secondary + near-white bg + Playfair Display serif + `--radius-sm: 0` (각진).
- **`app/layout.tsx`** — `Playfair_Display` (400·600) `next/font/google` 상시 로드, `--font-playfair` variable 추가, `<html data-theme={config.theme} className="... playfair.variable">` SSR 주입.
- **`invitation.config.ts`** — `ThemeName` union `"modern" | "classic" | "floral" | "minimal" | "vintage"` 5개 → `"classic" | "modern"` 2개 축소, 기본값 `"modern"` → `"classic"` 수정. 실제 렌더와 타입이 일치하는 상태로 정합. Floral 은 Week 8 에 확장, Minimal/Vintage 는 v1.1+ 후보로 ADR 에 기록.
- **컴포넌트 수정 0 건** — 이 설계의 핵심 이점. 기존 토큰 유틸 (`bg-primary` · `text-secondary` · `rounded-sm`) 이 런타임 CSS 변수 참조라 토큰 값만 override 되면 전체 섹션 자동 테마화. 회귀 위험 최소.
- **prod CSS 검증** — 빌드 후 `.next/static/chunks/*.css` 에서 `.rounded-sm{border-radius:var(--radius-sm)}` 확인, `[data-theme=modern]{...}` 블록 정상 포함, `rounded-md/lg/full` 기본 유틸 유지 확인. 리스크 섹션의 "Tailwind 토큰 override 가 인접 유틸 생성을 방해하는가" 질문 해소.

### 태스크 3 · 구글 캘린더 일정 추가 버튼 (`7a4ebac`)

Week 7 로드맵 마지막 체크박스. 난이도 낮음, `lib/map.ts` 와 같은 "외부 서비스 딥링크" 패턴 재사용.

- **`lib/calendar.ts` 신규** — `googleCalendarUrl({ title, start, durationMinutes, location, description })` pure function. 내부 헬퍼 `toUtcBasic()` 가 `Date` → `YYYYMMDDTHHmmssZ` (UTC basic format) 로 변환. `toISOString().replace(/[-:]|\.\d{3}/g, "")` 로 하이픈·콜론·밀리초 제거. duration 기본 90 분 (식 + 식후 사진 실용값).
- **`components/sections/Venue.tsx`** — 카카오맵·네이버지도 아래 "캘린더에 일정 추가" 버튼. title 은 `${groom.name} ♥ ${bride.name} 결혼식` 자동 조합, location 은 `venue.name + address` 병기, description 에 `meta.siteUrl` 포함 (참석자가 캘린더에서 바로 청첩장 재방문 가능).
- **config 스키마 무변화** — 기존 `date · groom · bride · venue · meta.siteUrl` 만으로 이벤트 필드 조립. YAGNI — duration 커스터마이즈 필드는 실수요 0.
- **Apple Calendar / `.ics` 다운로드는 MVP 스코프 밖** — 모바일에서 `.ics` 다운로드 UX 어설픔. 수요 시 `icsDataUrl` 별도 함수로 분리 예정 (ADR 없이 lib 확장만).
- **CI**: 성공. 3 커밋 연속 모두 녹색.

---

## 막혔던 것 / 고민한 것

### 1. v0.1.0 태그 지점을 어디에 찍는가 (태스크 1)

Plan 작성 시점엔 "현재 HEAD `485055f` (6주차 회고 커밋) 에 태그" 로 적었다. 막상 CHANGELOG 커밋 (`b629ba6`) 을 만들고 나니 **CHANGELOG 자체가 v0.1.0 아티팩트** 라는 모순 발견 — 태그가 `485055f` 에 있으면 `v0.1.0` 태그 지점에서 `CHANGELOG.md` 파일이 존재하지 않음.

- **해결**: CHANGELOG 커밋 `b629ba6` 지점에 태그 이동.
- **교훈**: 릴리스 전 "아티팩트가 태그 지점에 존재해야 한다" 는 제약은 Plan 단계에서 한 번 더 확인해야 함. 태그 지점 ≠ 개발 진행 지점.
- **부수 교훈**: Plan 에서 벗어나는 결정은 실행 중 자연스럽게 발생. 원 Plan 에 충실하는 것보다 상황 변화에 맞춰 조정이 중요. 이번 경우 Plan 리뷰에서 태그 지점 재검토를 체크리스트로 넣었다면 사전에 해소 가능.

### 2. GitHub Release 영문 요약 vs 한영 이중 릴리스 노트 (태스크 1)

CHANGELOG.md 는 한국어 single, GitHub Release 본문도 한국어 primary + 영문 2~3 줄 summary 상단 배치. 선택 근거:

- **이중 CHANGELOG 는 복리 비용.** 매 릴리스마다 동기화 부담. v0.1.0 부터 시작하면 v1.0, v2.0 계속 2 배 관리.
- **README 는 이중언어지만 CHANGELOG 와 정체성 다름.** README 는 OSS 첫 방문자의 "이게 뭔지" 이해 → 영어권 중요. CHANGELOG 는 기존 사용자의 "뭐가 바뀌었는지" 추적 → 프로젝트 정체성 언어 (한국어) 충분.
- **교훈**: "이중언어 전략" 은 파일별 · 사용자 맥락별로 결정. 일률 적용하면 관리 비용만 커지고 가치 체감 덜함. v1.0 (10주차) 해외 공개 의사결정과 묶어 전체 재검토 예정.

### 3. Tailwind v4 다중 테마 공식 패턴 부재 (태스크 2)

Tailwind v4 공식 문서 (`tailwindcss.com/docs/theme`) 는 dark mode 외 다중 커스텀 테마 전용 가이드 제공 안 함. WebFetch 로 확인한 결과:

- `@theme` 블록은 한 번만 정의 권장 (멀티 블록 미지원)
- `@theme static` / `@theme inline` modifier 가 있으나 런타임 override 와 공존 주의
- **대안은 CSS 변수 cascade override** — "`@theme` 가 `:root` CSS 변수를 생성하는 성질" 을 활용해 `:root[data-theme="modern"] { --color-primary: ... }` 로 덮어쓰기.

의외로 이 패턴의 공식 예제가 없어서, ADR 에 거부된 대안 A~E 를 나란히 기록해 "왜 이게 최선인지" 를 명시. 멀티 `@theme` 블록 시도 (A), 빌드타임 CSS 파일 분리 (B), `body` class 기반 (C), CSS-in-JS (D), CSS Modules (E) 를 각각 거부 근거와 함께.

- **교훈**: 공식 패턴 부재 = ADR 가치 상승. 미래의 나 · 기여자가 "왜 다른 방법 안 썼지?" 질문했을 때 답할 문서가 없으면 불확실한 리팩터 유혹이 반복 발생.
- **발견**: `@theme inline` 은 현재 쓰지 않지만 "token 값을 인라인화해 변수 재할당을 막는" modifier. 실수로 도입하면 `:root[data-theme]` override 가 무효화될 수 있어 ADR 의 "부정 / 주의" 섹션에 "사용 금지" 명시.

### 4. `rounded-sm` Tailwind 기본 토큰 덮어쓰기 동작 (태스크 2)

`--radius-sm` 을 `@theme` 에 추가하면서 Tailwind 의 기본 `rounded-sm` / `rounded-md` / `rounded-lg` 유틸리티가 어떻게 반응할지 불확실. 덮어쓰기가 인접 토큰 생성을 막지는 않는가.

- **해결**: prod 빌드 후 `.next/static/chunks/*.css` 직접 grep 으로 검증. `.rounded-sm{border-radius:var(--radius-sm)}` · `.rounded-md{...}` · `.rounded-lg{...}` · `.rounded-full{...}` 4 개 전부 공존 확인. `--radius-sm` 만 사용자 정의 + 다른 radius 토큰은 Tailwind 기본값 유지라는 기대한 동작.
- **`[data-theme=modern]{--radius-sm:0;...}` 블록도 prod CSS 에 포함 확인** — override 경로 동작.
- **교훈**: Tailwind v4 의 동적 토큰 덮어쓰기 동작은 공식 문서에 명시적으로 안 나와 있어 빌드 artifact 직접 검증이 유일한 근거. 빌드 결과 확인은 리스크 섹션의 실질적 해결책.

### 5. Auto mode + 사용자 확인 불가한 실기기 검증 (태스크 2)

Auto mode 에서 "iOS Safari 실기기에서 Modern 테마 폰트 · 색 검증" 은 내가 직접 수행 불가 (브라우저 접근 없음). 사용자에게 "배포 후 DevTools 수동 토글 · 로컬 dev + LAN · 프리뷰 브랜치" 3 가지 방법 제시. 사용자가 **DevTools 수동 토글** 로 빠르게 확인 후 "색 괜찮다" 판단.

- **교훈**: Auto mode 는 코드 변경의 continuous execution 에 적합하지만 "디자인 인상의 human-in-the-loop 검증" 은 여전히 사용자 협력 필요. UI 변경 태스크는 Auto 에서도 검증 지점에 사용자 개입 안내가 필수.
- **부수 결정**: Modern accent 색 `#e2e8f0` (slate-200) 은 현재 상태로 유지. 실사용자 반응 보고 조정할 여지는 `:root[data-theme="modern"]` 블록 한 줄 수정이라 비용 0.

### 6. 구글 캘린더 UTC 변환 검증 (태스크 3)

`date-fns` 같은 라이브러리 없이 `toUtcBasic(d) = d.toISOString().replace(/[-:]|\.\d{3}/g, "")` 한 줄로 구현. 정확성 검증:

- `new Date("2026-05-17T12:00:00+09:00").toISOString()` → `"2026-05-17T03:00:00.000Z"` (KST 12 = UTC 3, 9시간 offset)
- `.replace(/[-:]|\.\d{3}/g, "")` → `"20260517T030000Z"` ✓
- 테스트 프레임워크 없어 unit test 스킵. 실기기 검증은 배포 후 Android 구글 앱 / iOS Safari 에서 실제 탭해 KST 12:00 로 표시되는지 확인 필요 — 사용자 후속 체크포인트.

- **교훈**: 간단한 pure function 이라도 타임존 변환은 버그 유발 빈도 높은 영역. 자동 검증 경로가 없으면 최소한 ADR·회고에 "검증 필요" 플래그 남겨 다음 주차에 빠트리지 않도록.

---

## 7주차 체크리스트 최종

6 주차 회고의 "7 주차로 넘어가는 결정사항 우선 태스크 후보" 4 개 중 3 개 완료 + 3 개 중 1 개 (방명록) 는 Week 8 로 명시적 이월:

- [x] 태스크 1 — v0.1.0 태그 + CHANGELOG + GitHub Release (`b629ba6` + tag + release)
- [x] 태스크 2 — 다중 테마 시스템 설계 (ADR 005 + Modern 1종 구현, `099f0b4` · `9f01ff2`)
- [ ] 태스크 3 — 방명록 (Firebase) ← **Week 8 로 이월** (`.claude/rules/firebase.md` 신규 필요)
- [x] 태스크 4 — 구글 캘린더 버튼 (`7a4ebac`)

예상치 못한 추가 / 조정:

- [x] `--radius-sm` 토큰화 — 처음엔 "색 + 폰트만" 로 시작했으나 Classic/Modern 인상 대조를 명확히 하려고 radius 도 테마화. 컴포넌트 수정 0 건으로 통과.
- [x] ADR 과 구현을 2 커밋 분할 — "왜 이 구현인가" 를 git history 에서 직접 찾을 수 있게. 단일 커밋 대안보다 가독성 우월.
- [x] `package.json` 메타 6 필드 보강 — 릴리스 시점 자연스러운 정리. `author` · `repository` · `bugs` · `homepage` · `license` · `description`.
- [x] prod CSS 빌드 artifact 직접 grep 검증 — Tailwind v4 덮어쓰기 동작 불확실성 해소.

---

## 8주차로 넘어가는 결정사항

### 현재 v0.1.0 배포 상태

- `v0.1.0` 태그 published · Latest · GitHub Release 공개
- main 은 `7a4ebac` — v0.1.0 이후 3 커밋 (ADR 005 · feat(theme) · feat(calendar)) 누적. v0.2 준비 상태
- Vercel 자동 배포 정상 · CI 연속 녹색 · 프로덕션 URL `invitation-kit.vercel.app` Classic 기본
- Modern 테마 스파이크 완성 — DevTools 수동 토글로 사용자 인상 검증 완료

### 우선 태스크 후보 (난이도·블로커 순)

1. **Floral 테마 추가** — Week 8 로드맵 첫 번째 체크박스. Week 7 테마 인프라 (`:root[data-theme="floral"]` 블록 추가 · union 확장 2 줄 · Google Font serif 1 개 추가) 이 이미 잡혀있어 매우 빠름. 디자인 방향 (색 5 + serif) 결정만 있으면 구현 1 시간 수준.
2. **방명록 (Firebase Firestore)** — Week 8 핵심 이슈. `.claude/rules/firebase.md` 신규 파일 필요 (방명록 스키마 · 보안 규칙 · 비밀번호 해싱 · 욕설 필터). Firebase 프로젝트 생성 · `NEXT_PUBLIC_FIREBASE_*` 환경 변수 · Firestore 보안 규칙 · CRUD UI. 난이도 중상, 외부 서비스 설정 포함.
3. **Modern accent 색 재검토** — 현재 `#e2e8f0` 이 너무 연할 수 있음 (사용자 피드백 시). 포인트 색 (`#ef4444` red-500 등) 후보 도입 1 줄 변경. 실사용 피드백 트리거로만.
4. **구글 캘린더 실기기 검증** — Android 구글 앱 · iOS Safari 에서 탭해 KST 12:00 표시 / 로그인 플로우 / 이벤트 저장 확인. 문제 발견 시 `lib/calendar.ts` 조정. **Week 7 마감 전 체크할 것 없음 — Week 8 기회 생길 때.**

### v0.2 릴리스 고려

- v0.1.0 이후 3 커밋으로 Modern 테마 · 캘린더 추가 — **의미 있는 feature 증분**
- 지금은 v0.2 태그 보류 (Week 8 Floral + 방명록 2 건 추가 후 Week 9 에 v0.2 묶어 릴리스가 자연스러움)
- v0.1.0 → v0.2 기간 CHANGELOG `[Unreleased]` 섹션으로 기록해두는 패턴 고려. Week 8 시작 시 CHANGELOG 에 `## [Unreleased]` 추가하고 누적 관리.

### v0.1.0 → v1.0.0 간 스코프 재점검

- **v0.1.0 (2026-04-25 릴리스)** — 정적 청첩장 + 기본 공유 + D-day + 인앱 안내 + Classic 테마
- **v0.2 (Week 9 경 예상)** — Modern · Floral 테마 + 구글 캘린더 + 방명록
- **v1.0.0 (10주차 목표)** — 문서화 · QA · Lighthouse · 다국어 여지
- **v1.1+** — 웹 에디터 UI (6 주차 정체성 재확인 합의대로 실사용 수요 기반)

### 아직 스킵

- 웹 에디터 (v1.1+ — 실사용자 수요 대기)
- RSVP (Firebase 묶음 · v1.0 후반 고려)
- BGM · 다국어 UI (v1.1+)
- Apple Calendar / `.ics` 다운로드 (수요 기반 lib 확장)

---

## 8주차 첫 세션 시작 방법

1. `git log --oneline -15` — 7 주차 커밋 3 개 (`v0.1.0` 태그 지점 `b629ba6` · ADR 005 `099f0b4` · Modern `9f01ff2` · 캘린더 `7a4ebac`) + 회고 커밋까지 확인
2. **이 파일 (`docs/retrospective/week-07.md`) 다시 읽기** — 7 주차 결과와 8 주차 우선 태스크
3. `docs/00-roadmap.md` 확인 — 진행도 7/12 반영됐는지, Week 8 엔트리와 이 회고의 "우선 태스크 후보" 일치 확인
4. **Firebase 도입 결정 전에 `.claude/rules/firebase.md` 먼저 생성** — 방명록 구현 전에 규칙 파일부터 (Progressive Disclosure 원칙). 스키마 · 보안 규칙 · 키 노출 정책 · 비밀번호 해싱 후보. CLAUDE.md 의 "세부 규칙 위치" 섹션에 이미 placeholder 있음.
5. Firebase 작업은 **외부 서비스 설정 (Firebase Console 프로젝트 생성 · Firestore 초기화) 먼저** — Vercel 때처럼 사용자 계정 · 키 발급 단계는 사용자가 직접 수행. 이후 SDK 통합.
6. Floral 테마는 상대적으로 가볍지만 **디자인 방향 (색 · serif) 결정 자체가 시간 소요** 부분. 사용자 취향 반영 필요 — 3~4 개 팔레트 후보를 AskUserQuestion 으로 제시하는 패턴.
7. **Client Component 기본 템플릿**: `useSyncExternalStore` 기반 `useIsClient` 훅은 `DDayBadge.tsx:9-13` · `InAppBrowserNotice.tsx:9-13` 에 동일 구현. 방명록의 인터랙티브 form 도 Client 일 가능성 높음 → 3 번째 사용처 등장 시 `lib/hooks.ts` 로 추출.
8. 사용자 승인 후 Plan Mode → 구현 → 품질 게이트 → 커밋 → 푸시 → CI 폴링. 품질 게이트에서 `.eslintcache` 비우고 돌리는 습관 유지 (6주차 D-day fix 학습).

---

## CLAUDE.md 업데이트 필요 사항

- "진행 상태 (6주차 종료 시점)" 라인 → "7주차 종료 시점" 으로 갱신. 추가 항목:
  - `lib/calendar.ts` 추가 (`googleCalendarUrl` + UTC basic 변환)
  - `docs/adr/005-multi-theme-runtime-strategy.md` 추가 (ADR 총 5 개)
  - `invitation.config.ts` 의 `ThemeName` union 이 `"classic" | "modern"` 으로 축소됨 · 기본값 `"classic"`
  - `app/globals.css` 에 `:root[data-theme="modern"]` override 블록 + `--radius-sm` 토큰
  - `app/layout.tsx` 에 Playfair Display 추가 · `<html data-theme={config.theme}>`
  - `components/theme/`·`components/shared/` 여전히 미도입 (테마 시스템이 `@theme` + CSS 변수 override 로 해결돼 별도 컴포넌트 레이어 불필요 — 파일 구조 목표 섹션의 `components/theme/` 설명도 "테마별 스타일 토큰" → "`app/globals.css` 에 통합" 로 수정 고려, 다만 "목표 구조" 란 제목이라 당장 수정보단 Week 12 정리 세션에서 결론)
- 이번 회고 커밋에 묶어 동시 갱신.

---

## 메트릭 / 비고

- **7주차 커밋 수**: 4 개 (회고·로드맵·CLAUDE.md 동기화 커밋 제외)
  - `b629ba6` docs (v0.1.0 CHANGELOG + package.json) · `099f0b4` docs (ADR 005) · `9f01ff2` feat(theme) · `7a4ebac` feat(calendar)
- **태그 생성**: 1 개 — `v0.1.0` (annotated, `b629ba6` 지점)
- **GitHub Release**: 1 개 — `v0.1.0 — MVP 최초 릴리스` (published, Latest)
- **미푸시 커밋**: 0
- **CI 런**: 4 회. 전부 성공. React 19 rule 재조우 없음 (6주차 학습 후 `.eslintcache` 비우는 습관 정착).
- **외부 기여자**: 0 명
- **가장 큰 단일 변화**: ADR 005 (147 줄, 거부된 대안 A~E 포함)
- **의존성 추가**: 0 — `next/font/google` 의 Playfair Display 는 기존 Cormorant 와 같은 경로, 번들 ~30KB 증가 (gzipped)
- **세션 리듬**: 한 세션에 3 태스크 (릴리스 + 테마 스파이크 + 캘린더) + Plan Mode 2 회 진입 + Auto mode 전환 1 회 + AskUserQuestion 1 회. 밀도 높지만 태스크 간 자연스러운 breakpoint 유지 (릴리스 → 주차 후반 기능 추가).
- **신규 규칙 파일**: 0 — `.claude/rules/firebase.md` 는 Week 8 진입 시 생성 예정
- **코드 외 작업**: v0.1.0 태그 push · GitHub Release 생성 · CHANGELOG 한국어 primary 정책 수립
- **공식 docs WebFetch**: 1 회 (Tailwind v4 `@theme` 다중 테마 패턴) — 공식 예제 부재 확인, ADR 에 "공식 패턴 없음" 명시
- **외부 발견 · 문서화**: 2 건
  1. Tailwind v4 가 다중 커스텀 테마 공식 가이드 제공 안 함 → CSS 변수 cascade override 가 사실상 표준, ADR 로 명문화
  2. `@theme inline` modifier 는 런타임 override 와 충돌 — ADR 의 "부정 / 주의" 섹션에 "사용 금지" 명시
- **Auto mode 사용**: 2 회 (태스크 2 구현 구간 · 태스크 3 전체). 한 번 exit 후 사용자 의사 확인 필요한 지점 1 회 (Modern 테마 검증 방법).

---

## 한 줄 총평

> **7 주차는 "MVP 외부 신호 (v0.1.0 릴리스) → 핵심 차별화 인프라 (다중 테마) → 편의 기능 추가 (캘린더)" 3 단 리듬으로 마감**. v0.1.0 태그 + GitHub Release 로 OSS 공개 신호를 첫 울림. 다중 테마 스파이크는 **컴포넌트 수정 0 건** 으로 Modern 을 추가하는 깔끔한 토큰 인프라 설계 — `:root[data-theme]` CSS 변수 override 가 Tailwind v4 + App Router + SSR 환경의 최적해. Tailwind v4 공식 다중 테마 패턴이 없는 공백을 ADR 005 가 거부된 대안 A~E 와 함께 명문화. 구글 캘린더 버튼은 `lib/map.ts` 의 "외부 서비스 딥링크" 패턴을 그대로 복제한 저위험 확장. 8 주차는 Floral 테마 + 방명록 (Firebase) 로 v1.0 마일스톤의 데이터 레이어 진입.

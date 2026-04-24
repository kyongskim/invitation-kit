# ADR 005 · 다중 테마 전환 메커니즘 — `data-theme` 속성 + CSS 변수 override

- 상태: Accepted
- 날짜: 2026-04-25
- 관련: `docs/adr/002-config-driven-approach.md`, `docs/00-roadmap.md` Week 7, `CLAUDE.md` 애니메이션 사용 규칙 (Tailwind v4 `@theme` 토큰 맥락)

---

## 맥락 (Context)

7주차 핵심 차별화 과제는 "다중 테마 시스템" 이다. v1.0 (10주차) 목표에 Classic 외 Modern · Floral 최소 2 종 추가가 명시돼 있고 (`docs/00-roadmap.md`), 6주차 회고의 우선 후보 2번으로 이월됐다.

6주차 탐색에서 드러난 현재 상태:

1. **`invitation.config.ts` 의 `theme` 필드가 거짓말.** union `"modern" | "classic" | "floral" | "minimal" | "vintage"` 에 기본값 `"modern"` 인데, 실제 코드 참조는 0 곳이다. 렌더링은 `app/globals.css` 의 `@theme` 블록이 선언한 Classic 색 (warm beige + gold) 으로 고정.
2. **`@theme` 블록에 Classic 토큰만 있고 다중 테마 메커니즘 없음.** Tailwind v4 (`tailwind.config.ts` 없음) 에서 테마 전환을 어떻게 할지가 설계 공백.
3. **컴포넌트 색 유틸 소비는 정합.** 5 토큰 (`primary` · `secondary` · `background` · `text` · `accent`) 내에서만 쓰이고 하드코딩 hex 0 곳. **토큰 인프라만 붙이면 컴포넌트 수정 0 건으로 테마 교체 가능.** 이 깔끔함이 이번 ADR 의 핵심 전제.

Tailwind CSS v4 공식 문서 (https://tailwindcss.com/docs/theme) 확인 결과:

- `@theme` 블록은 **한 번만 정의** 권장. 멀티 `@theme` 블록은 미지원.
- 다중 테마 (dark mode 제외) 전용 패턴 가이드는 없음.
- 대안으로 `@theme` 가 생성한 `:root` CSS 변수를 cascade override 하는 방식이 자연스러움 — "CSS 변수는 CSS 변수" 원칙.
- `@theme static` · `@theme inline` modifier 는 각각 "사용 여부와 무관하게 토큰 생성" / "변수 참조 시 값 인라인화" 용도로, 런타임 override 와 함께 쓸 때 주의 (inline 은 override 를 무효화할 수 있음).

그 외 한 가지 선택지는 **빌드타임 vs 런타임 전환**. 결혼식 사이트는 커플 1 쌍당 한 테마로 고정이며, 사용자 UI 에서 테마 토글 실수요 0 — 런타임 토글은 YAGNI.

## 결정 (Decision)

### 1. 전환 메커니즘: `<html data-theme="...">` + `:root[data-theme="..."]` CSS 변수 override

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Classic 기본 */
  --color-primary: #c9a87c;
  --color-secondary: #8b7355;
  --color-background: #faf6ee;
  --color-text: #3d342c;
  --color-accent: #e8dfd0;
  --font-sans: var(--font-pretendard);
  --font-serif: var(--font-cormorant);
  --radius-sm: 0.375rem;
  /* ... */
}

:root[data-theme="modern"] {
  --color-primary: #0f172a;
  --color-secondary: #475569;
  --color-background: #fafafa;
  --color-text: #0f172a;
  --color-accent: #e2e8f0;
  --font-serif: var(--font-playfair);
  --radius-sm: 0;
}
```

```tsx
// app/layout.tsx (발췌)
<html lang="ko" data-theme={config.theme} className={...}>
```

### 2. 타이밍: 빌드타임 (SSR) · 런타임 토글 없음

`invitation.config.ts` 의 `theme` 값을 `layout.tsx` SSR 에서 `<html data-theme={config.theme}>` 에 직접 주입. flash 없음, hydration mismatch 없음, client bundle 증가 0. `ThemeProvider` · localStorage · 전환 UI 도입 안 함.

### 3. `ThemeName` union 축소 + 기본값 현실화

- Before: `"modern" | "classic" | "floral" | "minimal" | "vintage"` (5개, 4개 미구현)
- After: `"classic" | "modern"` (2개, 전부 구현)
- 기본값: `"modern"` → `"classic"`

Floral 은 Week 8 에 추가하며 그 주차에 union 확장. Minimal · Vintage 는 v1.1+ 후보로 이 ADR 에 근거만 기록하고 코드에서 제거.

### 4. Modern 테마 구체값

| 토큰                 | Classic (기존)          | Modern (신규)                     |
| -------------------- | ----------------------- | --------------------------------- |
| `--color-primary`    | `#c9a87c` (warm gold)   | `#0f172a` (slate-900, near-black) |
| `--color-secondary`  | `#8b7355` (warm brown)  | `#475569` (slate-600)             |
| `--color-background` | `#faf6ee` (cream)       | `#fafafa` (near-white)            |
| `--color-text`       | `#3d342c` (dark brown)  | `#0f172a` (near-black)            |
| `--color-accent`     | `#e8dfd0` (light beige) | `#e2e8f0` (slate-200)             |
| `--font-serif`       | Cormorant Garamond      | Playfair Display                  |
| `--radius-sm`        | `0.375rem` (6px, 둥근)  | `0` (완전 각진)                   |

Sans (Pretendard) 는 한국어 본문 가독성이 절대적이라 두 테마 공통 유지.

### 5. 폰트 로드 전략: 상시 로드

Playfair Display 는 `next/font/google` 로 상시 로드 (build-time self-host + `display: swap`). 조건부 로드는 React 19 RSC 의 layout-level 동적 분기 난이도 대비 효용 낮음. 테마가 3+ 으로 늘어나는 v1.1 시점에 재검토.

## 이유

1. **컴포넌트 수정 0 건.** 이 접근의 핵심 장점. `bg-primary`, `text-secondary`, `rounded-sm` 등 토큰 유틸리티는 런타임에 `:root` CSS 변수를 참조하므로, 토큰 값만 override 되면 전체 섹션이 자동 테마화된다. 테마 추가마다 컴포넌트 N 개를 건드리지 않아도 됨 — 유지보수 비용의 선형 증가를 원천 차단.
2. **Tailwind dark mode 관례와 일관.** Tailwind 공식 dark mode 는 `html.dark` 클래스 기반이고, 커뮤니티 라이브러리 `next-themes` 도 `html[data-theme]` 을 표준으로 사용. 우리의 `data-theme` 채택은 이 관례의 연장 — 미래에 dark mode 를 추가하거나 `next-themes` 로 교체할 때 최소 비용.
3. **빌드타임 타이밍의 단순성.** config 값 → HTML 속성 → CSS 변수 → 컴포넌트 모두 SSR 한 번에 해결. Client Component 필요 없음, hydration 경로 복잡도 0, FOUT 없음.
4. **`data-theme` vs `body class`.** 의미 동등하지만 `data-theme` 은 HTML 의 semantic attribute 로 "테마 정보" 를 표현하는 적절한 그릇. `className` 은 "스타일 훅" 이라는 관례와 어긋나지 않지만 의미 차원에서 덜 명확. 또한 `document.documentElement.dataset.theme` 으로 JS 접근이 직관적.
5. **Union 축소는 "실제와 일치" 원칙.** Config-driven (ADR 002) 의 대전제는 "사용자가 config 를 본 그대로 동작한다" 다. `"floral"` 을 쓸 수 있다고 타입이 말해놓고 실제로 Classic 색이 렌더되면 그것은 config-driven 원칙 위반. TS 레벨에서 구현 가능한 값만 허용한다.

## 결과 (Consequences)

**긍정:**

- **컴포넌트 수정 0 건** → `components/sections/*.tsx` 6 개 + `components/*.tsx` 2 개 무손상. 회귀 위험 최소.
- `<html data-theme>` 가 DOM 검사로 즉시 확인 가능 — DevTools Elements 에서 attribute 를 수동 toggle 해 다른 테마 미리보기 가능, 디자인 검토 워크플로 간편.
- `next-themes` · `class-variance-authority` 같은 라이브러리와 충돌 없음 → 미래 확장 자유도 보존.
- Floral 추가 시 `:root[data-theme="floral"]` 블록 + union 확장 2 줄 + Playfair 같은 폰트 variable 추가가 전부. 구현 비용 선형에 가까움.

**부정 / 주의:**

- **`@theme inline` 은 사용 금지.** inline modifier 는 토큰 참조 지점에서 값을 CSS 에 박아버려 `:root[data-theme]` override 가 무효화된다. 현재 `@theme` 블록은 plain 이라 문제 없지만, 향후 inline modifier 를 고려할 땐 이 ADR 재검토.
- **Tailwind 토큰 네임스페이스 (`--radius-sm` 등) 를 사용자 정의로 덮어쓸 때의 behavior.** 공식 허용이지만 실제 빌드 CSS output 에서 `rounded-md`, `rounded-lg` 등 인접 토큰이 자동 유지되는지 첫 구현 빌드에서 확인 필요. 문제 발생 시 `--radius-sm` 을 `--radius` 커스텀 토큰으로 분리 + 컴포넌트에서 `rounded-[var(--radius)]` 참조로 우회.
- **폰트 번들 ~30KB (gzipped) 추가.** Playfair Display (400·600). Cormorant 가 이미 로드 중이라 "serif 한 개 더" 비용. v1.1 에서 테마 3+ 되면 조건부 로드 재검토 (이 deferral 은 이 ADR 이 공식 기록).
- **Union 축소는 breaking change 후보.** 현재 실사용자 0 명이라 영향 없음. 외부 fork 가 생긴 이후에 union 을 다시 축소한다면 CHANGELOG 의 `### Changed` 또는 major version bump (`v1.0 → v2.0`) 필요. 이 ADR 직후 v0.2 CHANGELOG 에 `### Fixed: theme 기본값을 실제 동작과 일치시킴` 한 줄로 기록.
- **런타임 토글을 원하는 실수요가 미래에 발생하면.** Client Component `ThemeProvider` 로 `document.documentElement.dataset.theme` 을 조작하면 즉시 가능. 이 설계는 그 확장을 막지 않음. 단, 그 시점에 FOUT 방지 스크립트 (first paint 전 blocking script 로 dataset 설정) 가 추가로 필요 — `next-themes` 가 이미 해결한 문제. 도입 시 라이브러리 채택 권장.

## 거부된 대안 (Rejected Alternatives)

### A. 멀티 `@theme` 블록 (예: `@theme modern { ... }`)

Tailwind v4 가 미지원. `@theme` 는 싱글 블록만 유효. **거부.**

### B. 빌드타임 CSS 생성 (`theme.classic.css` · `theme.modern.css` 파일 분리 + layout 에서 조건부 import)

Layout 에서 `@/app/themes/${config.theme}.css` 식 동적 import 는 Next.js 번들러가 정적 해석을 못 함 (Turbopack 도 동일). `if (config.theme === "modern") import(...)` 패턴은 client-only. SSR 에서는 사실상 불가. **거부.**

### C. Body class 기반 (`<body class="theme-modern">` + `body.theme-modern { --color-primary: ... }`)

의미 동등. 단 `:root` 선택자가 CSS cascade 우선순위상 더 상위고, Tailwind dark mode 관례 (`html.dark`) 와 레벨 일치. `data-theme` 선택 이유 2 와 동일. **B-grade alternative로 기록.**

### D. CSS-in-JS (styled-components · Emotion) 테마 Provider

런타임 비용 증가, RSC 호환 문제, 기존 Tailwind 기반 컴포넌트 재작성 필요. 이 프로젝트의 기술 스택 선택 (Tailwind v4 + App Router + Turbopack) 과 정면 충돌. **거부.**

### E. CSS Modules + theme 변수 선언 파일 분리

Tailwind v4 토큰 시스템을 버리고 새 레이어를 도입하는 셈. 이미 컴포넌트 300+ 줄이 `bg-primary` 등을 쓰는 상황에서 대안 가치 낮음. **거부.**

## 후속 작업

- **이 ADR 채택 즉시**: `app/globals.css` 리팩터 · `app/layout.tsx` 에 `data-theme` 주입 · `invitation.config.ts` union 축소 · Modern 테마 구현. (동일 세션에서 `feat(theme):` 커밋으로 구현)
- **Week 8**: Floral 테마 추가. 구체값 (색 5 + serif 폰트) 은 Week 8 시작 시 별도 검토.
- **v0.2 CHANGELOG**: `### Changed` 에 "ThemeName union 축소 · 기본값 classic 으로 수정" 기록.
- **CLAUDE.md 업데이트**: 6주차 종료 시점 상태 라인에 "Classic + Modern 테마" 를 반영하는 건 Week 8 Floral 추가 때 묶어서 처리.

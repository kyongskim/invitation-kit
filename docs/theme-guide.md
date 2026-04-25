# 테마 가이드

> 새로운 테마를 추가하려면 4 곳을 수정하면 됩니다. 컴포넌트 코드는 건드리지 않습니다 — Tailwind utility 가 CSS 변수를 자동 참조하므로 테마는 얇은 override 한 겹으로 끝납니다. 결정 배경은 [`adr/005-multi-theme-runtime-strategy.md`](./adr/005-multi-theme-runtime-strategy.md).

## 테마 시스템 한 줄 요약

```
<html data-theme="X">       ← 테마 이름을 attribute 로 주입
:root[data-theme="X"] { … } ← CSS 변수 override 블록
```

`@theme` 블록 (Classic 기본값) 위에 `:root[data-theme="modern"]` · `:root[data-theme="floral"]` 가 변수만 갈아끼우는 구조. 컴포넌트는 `bg-primary` · `text-secondary` 같은 Tailwind utility 만 쓰고, 그게 CSS 변수로 풀려서 자동으로 테마 색을 따라갑니다.

런타임 토글 UI 는 없습니다 — `invitation.config.ts` 의 `theme` 필드에서 SSR 시점에 한 번 결정됩니다. 청첩장은 한 번 발행하면 디자인이 바뀔 일이 거의 없는 도메인이라 토글 UI 가 불필요한 복잡도이기 때문 (ADR 005).

---

## 토큰 카탈로그

`app/globals.css` 의 `@theme` 블록과 두 override 블록이 다루는 9 변수:

| 변수                   | 역할                             | Classic                         | Modern                  | Floral                     |
| ---------------------- | -------------------------------- | ------------------------------- | ----------------------- | -------------------------- |
| `--color-primary`      | hero 텍스트 · CTA · 강조 컬러    | `#c9a87c` (웜 골드)             | `#0f172a` (slate-900)   | `#d4a5a5` (로즈)           |
| `--color-secondary`    | 보조 텍스트 · 라인               | `#8b7355` (웜 브라운)           | `#475569` (slate-600)   | `#8b6b6b` (마우브 브라운)  |
| `--color-background`   | 페이지 배경                      | `#faf6ee` (크림)                | `#fafafa` (오프 화이트) | `#fdf8f5` (웜 오프 화이트) |
| `--color-text`         | 본문 텍스트                      | `#3d342c` (다크 브라운)         | `#0f172a` (니어 블랙)   | `#3d2929` (딥 마우브)      |
| `--color-accent`       | 하이라이트 · 가벼운 구분         | `#e8dfd0` (라이트 베이지)       | `#e2e8f0` (slate-200)   | `#e8d0cc` (라이트 로즈)    |
| `--font-sans`          | UI · 본문 (한국어)               | `var(--font-pretendard)`        | (Classic 상속)          | (Classic 상속)             |
| `--font-serif`         | 영문 헤드라인 · D-day            | `var(--font-cormorant)`         | `var(--font-playfair)`  | `var(--font-italiana)`     |
| `--radius-sm`          | 버튼·카드 모서리                 | `0.375rem` (6 px)               | `0` (sharp)             | `0.625rem` (10 px)         |
| `--animate-fade-in-up` | 진입 애니메이션 (모든 테마 공유) | `fade-in-up 0.6s ease-out both` | (동일)                  | (동일)                     |

**관찰**: 색상 5 + 폰트 2 + 모서리 1 + 애니메이션 1 = 9 변수. 새 테마는 이 9 개 중 색상 5 + 모서리 1 (필수) + 폰트 1 (선택, 영문 serif 만 갈아끼울 수 있음) 을 override 하면 됩니다.

`--font-sans` 는 한국어 폰트라 모든 테마가 Pretendard 를 공유 — 굳이 한글 폰트를 갈아끼우지 마세요.

---

## 4 번째 테마 추가하기 — 5 단계

`vintage` 라는 가상의 테마를 추가하는 시나리오로 단계별 안내합니다.

### 1. `ThemeName` union 확장

`invitation.config.ts` 12 번 줄:

```ts
export type ThemeName = "classic" | "modern" | "floral" | "vintage";
```

이 한 줄 추가만으로 TypeScript 가 `theme: "vintage"` 를 받아들입니다.

### 2. CSS override 블록 작성

`app/globals.css` 의 두 override 블록 옆에 추가:

```css
:root[data-theme="vintage"] {
  --color-primary: #8b4513; /* 새들 브라운 */
  --color-secondary: #654321; /* 다크 브라운 */
  --color-background: #f5e6d3; /* 빈티지 페이퍼 */
  --color-text: #3e2723; /* 짙은 갈색 */
  --color-accent: #d2b48c; /* 탠 */
  --font-serif: var(--font-vintage-serif); /* (3 단계에서 새 폰트 추가 시) */
  --radius-sm: 0.125rem; /* 거의 직각, 살짝만 둥글게 */
}
```

7 변수만 다시 선언하면 됩니다 — 나머지는 Classic 기본값을 그대로 상속합니다.

### 3. (선택) 새 폰트 로드

새로운 영문 serif 폰트가 필요하다면 `app/layout.tsx` 에 추가합니다.

**Google Fonts 사용 (가장 단순)**:

```ts
import { Cinzel } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-vintage-serif",
  display: "swap",
  weight: ["400", "600"],
});
```

그리고 `<html className>` 에 `cinzel.variable` 추가:

```tsx
<html
  lang="ko"
  data-theme={config.theme}
  className={`${pretendard.variable} ${cormorant.variable} ${playfair.variable} ${italiana.variable} ${cinzel.variable} h-full antialiased`}
>
```

**Self-host (커스텀 woff2)**: `app/fonts/` 에 `Custom.woff2` 를 넣고 `localFont` 로 로드. Pretendard 가 이 패턴의 reference 입니다.

기존 폰트로 충분하다면 (예: Playfair Display 를 빈티지 톤으로 재사용) 이 단계는 생략하고 `--font-serif: var(--font-playfair)` 로 두면 됩니다.

### 4. 미리보기

`invitation.config.ts` 에서 `theme` 을 잠시 `"vintage"` 로 바꾸고 `npm run dev`. 메인 화면부터 끝까지 스크롤하며 5 색상이 의도대로 적용됐는지, 폰트가 영문 헤드라인에 잘 붙는지 확인.

### 5. (PR 시) ADR 추가 + 토큰 카탈로그 갱신

새 테마를 본 레포에 기여하려면:

- `docs/adr/00X-vintage-theme.md` 신규 ADR (디자인 의도 · 색상 결정 근거 · 거부한 대안). ADR 005 가 reference.
- 본 가이드의 "토큰 카탈로그" 표에 열 추가.
- 변경 사항을 `CHANGELOG.md` 에 한 줄.

---

## Worked example: Modern 테마는 이렇게 만들었다

8 주차 Day 1·2 에서 Classic 외 첫 추가 테마로 Modern 을 도입했습니다. 디자인 의도와 토큰 결정 근거.

### 디자인 의도

한국 결혼식 청첩장의 기본 톤은 따뜻한 베이지·골드 (Classic) 입니다. 하지만 미니멀·모노톤·도시적 분위기를 선호하는 커플 수요도 있어, **무채색 · sharp edges · 충분한 여백** 을 키워드로 잡았습니다.

- 검은색 (`#0f172a` slate-900) 을 전경의 모든 텍스트·CTA 로 사용 — 골드의 자리를 검정이 차지
- 모서리는 완전 직각 (`--radius-sm: 0`) — 부드러움 대신 단단함
- 폰트는 Cormorant Garamond → Playfair Display. 둘 다 transitional serif 인데 Playfair 가 stroke contrast 가 더 강해 모던한 인상

### 변경 토큰 7 개

| 변수                 | Classic                 | Modern                | 변화                                 |
| -------------------- | ----------------------- | --------------------- | ------------------------------------ |
| `--color-primary`    | `#c9a87c` 웜 골드       | `#0f172a` 니어 블랙   | 따뜻함 → 강한 대비                   |
| `--color-secondary`  | `#8b7355` 웜 브라운     | `#475569` slate-600   | 갈색 → 차가운 회색                   |
| `--color-background` | `#faf6ee` 크림          | `#fafafa` 오프 화이트 | 노란 기 → 중성                       |
| `--color-text`       | `#3d342c` 다크 브라운   | `#0f172a` 니어 블랙   | 갈색 → 검정                          |
| `--color-accent`     | `#e8dfd0` 라이트 베이지 | `#e2e8f0` slate-200   | 베이지 → 라이트 그레이               |
| `--font-serif`       | `Cormorant_Garamond`    | `Playfair_Display`    | 부드러운 serif → 강한 contrast serif |
| `--radius-sm`        | `0.375rem` 6 px         | `0`                   | 둥근 모서리 → 직각                   |

### 실제 코드

`app/globals.css` 의 17~25 번 줄:

```css
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

9 줄 — 컴포넌트 코드는 한 줄도 건드리지 않았습니다. `@theme` 의 9 변수 카탈로그가 잘 짜여 있으면 새 테마는 정말 이 정도 분량으로 끝납니다.

---

## Floral 노트 (짧게)

8 주차 Day 3 에 Floral 도 같은 패턴으로 추가했습니다.

- **디자인 의도**: 로즈·뮤트한 마우브 톤. 부드러움. 모서리는 Classic (6 px) 보다 더 둥글게 (10 px) — 꽃잎 같은 인상.
- **폰트**: Cormorant Garamond → Italiana. Italiana 는 더 가늘고 우아한 display serif.
- **변경 토큰 7 개**: 위 카탈로그 표의 Floral 열 참조.

실제 override 블록은 `app/globals.css` 27~35 번 줄. Modern 과 동일 패턴이라 코드 인용은 생략합니다.

> Floral 의 디자인은 1 차 구현 후 사용자 피드백으로 **재검토 보류 상태** 입니다 (memory `project_floral_theme_redesign_pending.md`). 본 가이드는 현재 `app/globals.css` 의 토큰만 reference 로 기술합니다 — 향후 디자인이 갱신되면 토큰 카탈로그도 함께 갱신.

---

## 디자인 결정 가이드

새 테마를 직접 만들 때 빠지기 쉬운 함정:

### 명도 대비 (WCAG AA)

`--color-text` 와 `--color-background` 의 명도차가 **4.5:1 이상** 이어야 본문이 읽힙니다. [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) 로 사전 검증 권장. Classic 의 `#3d342c` on `#faf6ee` 는 약 9:1, Modern 의 `#0f172a` on `#fafafa` 는 약 16:1 — 충분한 여유.

### `--color-primary` 는 충분히 진해야 합니다

primary 는 hero 텍스트 (신랑·신부 이름)·CTA 버튼에 쓰입니다. 흰 배경에 흐릿한 색을 쓰면 모바일 햇빛 아래에서 안 보입니다. **명도 약 30~50% 범위의 진한 색** 을 권장.

### `--font-serif` 는 한국어 미지원입니다

Cormorant · Playfair · Italiana 는 모두 라틴 글자만 그립니다. 이 변수가 적용되는 영역은 D-day 배지 영문 (`D-30`), 영문 헤드라인 정도. 한글이 들어가는 영역은 자동으로 `--font-sans` (Pretendard) 로 폴백되므로 한글 폰트는 의식할 필요 없습니다.

새 테마를 위해 한글 디스플레이 폰트를 갈아끼우고 싶다면 `--font-sans` 자체를 override 하기보다, 별도 변수 (`--font-display-ko`) 를 추가하고 특정 헤드라인 컴포넌트에서만 그 변수를 참조하는 패턴을 권장합니다 — 본문 가독성을 망치지 않기 위해.

### `--radius-sm` 의 효과 범위

이 토큰은 버튼 · 카드 · 입력창 등 작은 UI 요소의 모서리에 쓰입니다. 갤러리 사진의 모서리는 별도 클래스 (`rounded-md` · `rounded-lg`) 로 처리되므로 `--radius-sm` 만 바꾼다고 사진 모서리까지 따라가지 않습니다.

---

## Gotcha

- **선택자 빠뜨리지 않기**: `:root` 이 아니라 반드시 `:root[data-theme="X"]`. attribute 셀렉터를 빠뜨리면 모든 테마가 깨집니다.
- **`@theme` 안에 override 넣지 말 것**: Tailwind v4 의 `@theme` 블록은 Classic 기본값 전용. 다른 테마 변수는 별도 `:root[data-theme="..."]` 블록에만 둡니다 — 그래야 빌드 타임에 token registration 과 runtime override 가 분리됩니다.
- **새 폰트 변수명 충돌 주의**: 기존 변수명 (`--font-cormorant` · `--font-playfair` · `--font-italiana`) 을 재사용하지 말고 새로 짓습니다. 같은 변수에 두 폰트가 들어가면 후자가 전자를 덮어씁니다.
- **`html` 의 `className` 에 폰트 variable 추가 잊지 말기**: `next/font` 가 만든 `cinzel.variable` 같은 클래스 문자열을 `<html className>` 에 concat 해줘야 CSS 변수가 실제로 노출됩니다.
- **dev 에서 `data-theme` 변경 시 새로고침 필요**: `<html data-theme>` 은 SSR 시점에 결정되므로 `invitation.config.ts` 변경 후 페이지 새로고침이 필요합니다 — Fast Refresh 가 자동으로 잡지 못하는 영역.

---

## 다음 단계

- 청첩장 본문 필드 채우기는 → [`config-guide.md`](./config-guide.md)
- 키 발급은 → [`api-keys.md`](./api-keys.md)
- 테마 시스템 결정 배경은 → [`adr/005-multi-theme-runtime-strategy.md`](./adr/005-multi-theme-runtime-strategy.md)
- 프로젝트 디자인 가치 (한국 결혼식 1순위 타깃) 는 → [`01-project-brief.md`](./01-project-brief.md)

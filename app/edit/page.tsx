"use client";

import { useEffect } from "react";

import { Accounts } from "@/components/sections/Accounts";
import { CalendarMonth } from "@/components/sections/CalendarMonth";
import { Gallery } from "@/components/sections/Gallery";
import { Greeting } from "@/components/sections/Greeting";
import { Main } from "@/components/sections/Main";
import { Share } from "@/components/sections/Share";
import { Venue } from "@/components/sections/Venue";
import {
  config as moduleDefaultConfig,
  type ThemeName,
} from "@/invitation.config";
import { useEditorStore } from "@/lib/editor/store";

const THEME_OPTIONS: { value: ThemeName; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
  { value: "floral", label: "Floral" },
];

/**
 * v2.0 editor 진입점 (Phase 2-2 골격).
 *
 * - 좌측 form pane: 호흡 2-3+ 에서 본격 컨트롤 도입. 현재는 theme switcher
 *   1 개로 store ↔ preview 양방향 흐름 검증
 * - 우측 preview pane: 청첩장 컴포넌트 7 종을 store config 의 sub-tree props 로
 *   재사용. RSVP/Guestbook 는 firebase 자동 popup · 실 데이터 호출이 editor
 *   환경에 부적합 → 호흡 2-3 에서 preview 모드 분기 도입 예정
 * - Theme dynamic: store theme 이 바뀌면 `documentElement.dataset.theme`
 *   동기화. editor 이탈 시 RootLayout 의 module config theme 으로 복원
 */
export default function EditPage() {
  const config = useEditorStore((s) => s.config);
  const setField = useEditorStore((s) => s.setField);

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.dataset.theme;
    root.dataset.theme = config.theme;
    return () => {
      root.dataset.theme = previous ?? moduleDefaultConfig.theme;
    };
  }, [config.theme]);

  return (
    <main className="flex min-h-dvh flex-col lg:flex-row">
      <aside className="border-secondary/20 bg-background-alt border-b p-6 lg:sticky lg:top-0 lg:h-dvh lg:w-2/5 lg:overflow-y-auto lg:border-r lg:border-b-0">
        <h1 className="text-primary font-serif text-2xl">청첩장 에디터</h1>
        <p className="text-secondary mt-2 text-sm leading-relaxed">
          v2.0 Phase 2-2 골격. form 컨트롤은 호흡 2-3 부터 본격 도입.
        </p>

        <div className="border-accent mt-8 flex flex-col gap-2 rounded-md border p-4">
          <label
            htmlFor="theme-switcher"
            className="text-secondary text-xs tracking-wider uppercase"
          >
            Theme
          </label>
          <select
            id="theme-switcher"
            value={config.theme}
            onChange={(e) => setField("theme", e.target.value as ThemeName)}
            className="border-accent text-text rounded-sm border bg-transparent px-3 py-2 text-sm"
          >
            {THEME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <p className="text-secondary mt-6 text-xs leading-relaxed">
          form 입력은 자동 저장됩니다 (브라우저 localStorage).
          <br />
          GitHub 연결·배포는 Phase 3~4 에서 추가됩니다.
        </p>
      </aside>

      <div className="flex-1 lg:h-dvh lg:overflow-y-auto">
        <Main groom={config.groom} bride={config.bride} hero={config.hero} />
        <Greeting greeting={config.greeting} />
        <Gallery gallery={config.gallery} />
        <CalendarMonth date={config.date} />
        <Venue venue={config.venue} />
        <Accounts accounts={config.accounts} />
        <Share share={config.share} meta={config.meta} venue={config.venue} />
      </div>
    </main>
  );
}

"use client";

import { useEffect } from "react";

import { Accounts } from "@/components/sections/Accounts";
import { CalendarMonth } from "@/components/sections/CalendarMonth";
import { Gallery } from "@/components/sections/Gallery";
import { Greeting } from "@/components/sections/Greeting";
import { Guestbook } from "@/components/sections/Guestbook";
import { Main } from "@/components/sections/Main";
import { RSVP } from "@/components/sections/RSVP";
import { Share } from "@/components/sections/Share";
import { Venue } from "@/components/sections/Venue";
import { config as moduleDefaultConfig } from "@/invitation.config";
import type { ThemeName } from "@/invitation.config.types";
import { useEditorStore } from "@/lib/editor/store";

import { GithubConnect } from "./_GithubConnect";
import { AccountsForm } from "./_sections/AccountsForm";
import { CalendarForm } from "./_sections/CalendarForm";
import { GalleryForm } from "./_sections/GalleryForm";
import { GreetingForm } from "./_sections/GreetingForm";
import { GuestbookConfigForm } from "./_sections/GuestbookConfigForm";
import { MainForm } from "./_sections/MainForm";
import { MetaForm } from "./_sections/MetaForm";
import { RSVPConfigForm } from "./_sections/RSVPConfigForm";
import { ShareForm } from "./_sections/ShareForm";
import { VenueForm } from "./_sections/VenueForm";

const THEME_OPTIONS: { value: ThemeName; label: string }[] = [
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
  { value: "floral", label: "Floral" },
];

/**
 * v2.0 editor 진입점.
 *
 * - 좌측 form pane: form 4종 (Main · Greeting · Calendar · Meta) + theme.
 *   호흡 2-3c 에서 배열·복잡 form (Venue · Accounts · Gallery · RSVP·
 *   Guestbook config · Share) 추가
 * - 우측 preview pane: 청첩장 컴포넌트 9 종을 store config 의 sub-tree props
 *   로 재사용. RSVP/Guestbook 는 previewMode prop 으로 firebase 실 호출 +
 *   autoPopup 차단
 * - Theme dynamic: store theme 이 바뀌면 `documentElement.dataset.theme`
 *   동기화. editor 이탈 시 RootLayout 의 module config theme 으로 복원
 */
export default function EditPage() {
  const config = useEditorStore((s) => s.config);
  const setField = useEditorStore((s) => s.setField);
  const reset = useEditorStore((s) => s.reset);

  function handleReset() {
    if (
      window.confirm("모든 입력을 샘플 데이터로 되돌립니다. 진행하시겠습니까?")
    ) {
      reset();
    }
  }

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
        <header className="mb-8">
          <h1 className="text-primary font-serif text-2xl">청첩장 에디터</h1>
          <p className="text-secondary mt-2 text-sm leading-relaxed">
            form 입력이 우측 preview 에 즉시 반영됩니다.
          </p>
        </header>

        <div className="flex flex-col gap-10">
          <MainForm />
          <GreetingForm />
          <GalleryForm />
          <CalendarForm />
          <VenueForm />
          <AccountsForm />
          <RSVPConfigForm />
          <GuestbookConfigForm />
          <ShareForm />
          <MetaForm />

          <section className="flex flex-col gap-2">
            <h2 className="text-primary font-serif text-lg">테마</h2>
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
              className="border-accent text-text w-full rounded-sm border bg-transparent px-3 py-2 text-sm"
            >
              {THEME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </section>

          <GithubConnect />

          <section className="flex flex-col gap-2">
            <h2 className="text-primary font-serif text-lg">초기화</h2>
            <button
              type="button"
              onClick={handleReset}
              className="border-accent text-secondary hover:text-primary hover:border-primary rounded-sm border py-2 text-xs tracking-wider uppercase transition-colors"
            >
              샘플 데이터로 되돌리기
            </button>
            <p className="text-secondary/70 text-xs">
              브라우저 localStorage 의 저장값을 지우고 김철수♥이영희 데모로
              복귀합니다.
            </p>
          </section>
        </div>

        <p className="text-secondary/70 mt-10 text-xs leading-relaxed">
          입력은 자동 저장됩니다 (브라우저 localStorage). 본인 repo commit 과
          Vercel 배포는 다음 호흡에서 연결됩니다.
        </p>
      </aside>

      <div className="flex-1 lg:h-dvh lg:overflow-y-auto">
        <Main groom={config.groom} bride={config.bride} hero={config.hero} />
        <Greeting greeting={config.greeting} />
        <Gallery gallery={config.gallery} />
        <CalendarMonth date={config.date} />
        <Venue venue={config.venue} />
        <Accounts accounts={config.accounts} />
        {config.rsvp.enabled && <RSVP rsvp={config.rsvp} previewMode />}
        {config.guestbook.enabled && (
          <Guestbook guestbook={config.guestbook} previewMode />
        )}
        <Share share={config.share} meta={config.meta} venue={config.venue} />
      </div>
    </main>
  );
}

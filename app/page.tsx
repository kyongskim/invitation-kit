import dynamic from "next/dynamic";

import { MusicToggle } from "@/components/MusicToggle";
import { Accounts } from "@/components/sections/Accounts";
import { CalendarMonth } from "@/components/sections/CalendarMonth";
import { Closing } from "@/components/sections/Closing";
import { Gallery } from "@/components/sections/Gallery";
import { Greeting } from "@/components/sections/Greeting";
import { Main } from "@/components/sections/Main";
import { Share } from "@/components/sections/Share";
import { Venue } from "@/components/sections/Venue";
import { config } from "@/invitation.config";

// Guestbook · RSVP 만 firebase 의존 → 별도 chunk 로 분리. 페이지 끝부분에
// 위치해 viewport 도달 전 idle 시간에 prefetch 됨. Guestbook 은 추가로
// bcryptjs + framer-motion 도 동반.
const Guestbook = dynamic(() =>
  import("@/components/sections/Guestbook").then((m) => ({
    default: m.Guestbook,
  })),
);
const RSVP = dynamic(() =>
  import("@/components/sections/RSVP").then((m) => ({ default: m.RSVP })),
);

export default function Home() {
  return (
    <main className="flex flex-col">
      {config.music?.enabled && config.music.src && (
        <MusicToggle src={config.music.src} />
      )}
      <Main groom={config.groom} bride={config.bride} hero={config.hero} />
      <Greeting greeting={config.greeting} />
      <Gallery gallery={config.gallery} />
      <CalendarMonth date={config.date} />
      <Venue venue={config.venue} />
      <Accounts accounts={config.accounts} />
      {config.rsvp.enabled && <RSVP rsvp={config.rsvp} />}
      {config.guestbook.enabled && <Guestbook guestbook={config.guestbook} />}
      {config.closing && <Closing closing={config.closing} />}
      <Share share={config.share} meta={config.meta} venue={config.venue} />
    </main>
  );
}

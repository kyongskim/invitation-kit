import dynamic from "next/dynamic";

import { InAppBrowserNotice } from "@/components/InAppBrowserNotice";
import { MusicToggle } from "@/components/MusicToggle";
import { Accounts } from "@/components/sections/Accounts";
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
      <InAppBrowserNotice />
      {config.music?.enabled && config.music.src && (
        <MusicToggle src={config.music.src} />
      )}
      <Main />
      <Greeting />
      <Gallery />
      <Venue />
      <Accounts />
      {config.rsvp.enabled && <RSVP />}
      {config.guestbook.enabled && <Guestbook />}
      <Share />
    </main>
  );
}

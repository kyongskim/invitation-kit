import { InAppBrowserNotice } from "@/components/InAppBrowserNotice";
import { Accounts } from "@/components/sections/Accounts";
import { Gallery } from "@/components/sections/Gallery";
import { Greeting } from "@/components/sections/Greeting";
import { Main } from "@/components/sections/Main";
import { Share } from "@/components/sections/Share";
import { Venue } from "@/components/sections/Venue";

export default function Home() {
  return (
    <main className="flex flex-col">
      <InAppBrowserNotice />
      <Main />
      <Greeting />
      <Gallery />
      <Venue />
      <Accounts />
      <Share />
    </main>
  );
}

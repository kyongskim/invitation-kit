import { Greeting } from "@/components/sections/Greeting";
import { Main } from "@/components/sections/Main";
import { Venue } from "@/components/sections/Venue";

export default function Home() {
  return (
    <main className="flex flex-col">
      <Main />
      <Greeting />
      <Venue />
    </main>
  );
}

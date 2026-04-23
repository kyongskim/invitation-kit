import { Greeting } from "@/components/sections/Greeting";
import { Main } from "@/components/sections/Main";

export default function Home() {
  return (
    <main className="flex flex-col">
      <Main />
      <Greeting />
    </main>
  );
}

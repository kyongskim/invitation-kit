import { config } from "@/invitation.config";

export default function Home() {
  return (
    <main className="bg-background text-text flex min-h-dvh flex-col items-center justify-center px-6 py-24">
      <p className="text-secondary font-serif text-sm tracking-[0.3em] uppercase">
        Wedding Invitation
      </p>
      <h1 className="text-primary mt-10 flex items-center gap-6 font-serif text-5xl font-light">
        <span>{config.groom.name}</span>
        <span className="text-secondary">&amp;</span>
        <span>{config.bride.name}</span>
      </h1>
    </main>
  );
}

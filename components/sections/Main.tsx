import { config } from "@/invitation.config";

export function Main() {
  return (
    <section className="bg-background text-text relative flex min-h-dvh flex-col items-center justify-center px-6 py-24">
      <div className="animate-fade-in-up flex flex-col items-center">
        <p className="text-secondary font-serif text-sm tracking-[0.3em] uppercase">
          Wedding Invitation
        </p>
        <h1 className="text-primary mt-10 flex items-center gap-6 font-serif text-5xl font-light">
          <span>{config.groom.name}</span>
          <span className="text-secondary">&amp;</span>
          <span>{config.bride.name}</span>
        </h1>
      </div>
      <div
        aria-hidden
        className="text-secondary absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
      >
        <ScrollArrow />
      </div>
    </section>
  );
}

function ScrollArrow() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

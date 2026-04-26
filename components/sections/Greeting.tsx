import type { InvitationConfig } from "@/invitation.config";

export function Greeting({
  greeting,
}: {
  greeting: InvitationConfig["greeting"];
}) {
  return (
    <section className="bg-background-alt flex flex-col items-center px-6 py-24">
      <div className="animate-fade-in-up flex flex-col items-center text-center">
        {greeting.title && (
          <h2 className="text-secondary font-serif text-2xl font-light tracking-wide">
            {greeting.title}
          </h2>
        )}
        <p className="text-text mt-8 leading-loose whitespace-pre-line">
          {greeting.message}
        </p>
      </div>
    </section>
  );
}

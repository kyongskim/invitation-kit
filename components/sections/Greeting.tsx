import { config } from "@/invitation.config";

export function Greeting() {
  return (
    <section className="bg-background-alt flex flex-col items-center px-6 py-24">
      <div className="animate-fade-in-up flex flex-col items-center text-center">
        {config.greeting.title && (
          <h2 className="text-secondary font-serif text-2xl font-light tracking-wide">
            {config.greeting.title}
          </h2>
        )}
        <p className="text-text mt-8 leading-loose whitespace-pre-line">
          {config.greeting.message}
        </p>
      </div>
    </section>
  );
}

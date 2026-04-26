import Image from "next/image";

import type { InvitationConfig, Person } from "@/invitation.config.types";

/**
 * Hero (첫 화면). hero.backgroundImage 가 있으면 풀스크린 사진 +
 * gradient overlay + 흰 텍스트, 없으면 cream 단색 + 진한 텍스트.
 *
 * 카운트다운은 CalendarMonth 섹션으로 이동 — Hero 는 신랑·신부 이름 자체가
 * emotional anchor 로 단독.
 */
export function Main({
  groom,
  bride,
  hero,
}: {
  groom: Person;
  bride: Person;
  hero?: InvitationConfig["hero"];
}) {
  const heroImage = hero?.backgroundImage;
  const heroAlt = hero?.alt ?? "결혼식 메인 사진";
  const hasImage = Boolean(heroImage);

  return (
    <section
      className={`relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-24 ${
        hasImage ? "text-white" : "bg-background text-text"
      }`}
    >
      {hasImage && (
        <>
          <Image
            src={heroImage!}
            alt={heroAlt}
            fill
            priority
            sizes="100vw"
            className="-z-20 object-cover"
          />
          {/* 사진 위 텍스트 legibility 보장 — 검은 overlay 30% 균일 */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-black/25 to-black/45"
          />
        </>
      )}

      <div className="animate-fade-in-up flex flex-col items-center">
        <p
          className={`font-serif text-sm tracking-[0.3em] uppercase ${
            hasImage ? "text-white/90" : "text-secondary"
          }`}
        >
          Wedding Invitation
        </p>
        <h1
          className={`mt-10 flex items-center gap-6 font-serif text-5xl font-light ${
            hasImage ? "text-white" : "text-primary"
          }`}
        >
          <span>{groom.name}</span>
          <span className={hasImage ? "text-white/70" : "text-secondary"}>
            &amp;
          </span>
          <span>{bride.name}</span>
        </h1>
      </div>

      <div
        aria-hidden
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce ${
          hasImage ? "text-white/80" : "text-secondary"
        }`}
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

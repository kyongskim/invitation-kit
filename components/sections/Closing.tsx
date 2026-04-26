import type { InvitationConfig } from "@/invitation.config.types";

/**
 * 끝인사 — 한국 결혼식 청첩장의 자연스러운 종결부.
 * config.closing 이 optional 이므로 마운트 측에서 조건부 렌더 권장.
 *
 * Greeting (인사말 시작) 과 대칭 — 같은 background-alt + serif + 중앙
 * 정렬 패턴. 다만 signature 가 한 줄 더 들어가 Greeting 보다 컴팩트.
 */
export function Closing({
  closing,
}: {
  closing: NonNullable<InvitationConfig["closing"]>;
}) {
  return (
    <section className="bg-background-alt flex flex-col items-center px-6 py-20">
      <div className="animate-fade-in-up flex flex-col items-center text-center">
        {closing.message && (
          <p className="text-text leading-loose whitespace-pre-line">
            {closing.message}
          </p>
        )}
        {closing.signature && (
          <p className="text-secondary mt-6 font-serif text-sm tracking-wide">
            {closing.signature}
          </p>
        )}
      </div>
    </section>
  );
}

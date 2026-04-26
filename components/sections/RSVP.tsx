"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence } from "framer-motion";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import type { RSVPConfig } from "@/invitation.config";
import { db } from "@/lib/firebase";

import type { RSVPSubmitInput } from "./rsvp/RSVPForm";
import { RSVPModal } from "./rsvp/RSVPModal";

const COLLECTION = "rsvp";
const AUTO_POPUP_KEY = "rsvp-modal-shown";

function isClosed(deadline: string | undefined): boolean {
  if (!deadline) return false;
  const t = new Date(deadline).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() > t;
}

function readAutoShown(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(AUTO_POPUP_KEY) === "1";
  } catch {
    return false;
  }
}

function writeAutoShown() {
  try {
    window.sessionStorage.setItem(AUTO_POPUP_KEY, "1");
  } catch {
    /* private 모드 등 — 무시 */
  }
}

const subscribe = () => () => {};

/**
 * 첫 방문 자동 popup 트리거. SSR 에서 false 를 반환하고
 * hydration 직후 한 번 client snapshot (`!readAutoShown() && !closed`)
 * 으로 전환되면서 modalOpen 을 자연스럽게 true 로 끌어올림.
 *
 * useEffect + setState 패턴을 회피해 React 19
 * `react-hooks/set-state-in-effect` 룰 위반을 막는 게 핵심.
 * `lib/hooks.ts` 의 useIsClient 와 같은 결의 SSR-safe 보존 패턴.
 */
function useShouldAutoPopup(closed: boolean): boolean {
  return useSyncExternalStore(
    subscribe,
    () => !readAutoShown() && !closed,
    () => false,
  );
}

export function RSVP({
  rsvp,
  previewMode = false,
}: {
  rsvp: RSVPConfig;
  /**
   * v2.0 editor preview 에서 firebase 실 호출 + 자동 popup 차단.
   * true 면 modal 자동 노출 안 됨 + submit 시 Firestore 미기록.
   */
  previewMode?: boolean;
}) {
  const showCompanions = rsvp.fields?.companions !== false;
  const showMessage = rsvp.fields?.message !== false;
  const closed = isClosed(rsvp.deadline);
  const guideMessage =
    rsvp.message ?? "참석 여부를 알려주시면\n결혼식 준비에 큰 도움이 됩니다.";

  const autoPopupSignal = useShouldAutoPopup(closed);
  const shouldAutoPopup = autoPopupSignal && !previewMode;

  const [submitted, setSubmitted] = useState(false);
  // null = 아직 사용자 인터랙션 없음. auto popup 만 따라감.
  // "open"  = 사용자가 명시적으로 다시 열음.
  // "closed" = 사용자가 닫았거나 submit 완료.
  const [override, setOverride] = useState<"open" | "closed" | null>(null);

  const modalOpen =
    override === "open" || (override === null && shouldAutoPopup);

  const handleSubmit = async (input: RSVPSubmitInput) => {
    if (!previewMode) {
      await addDoc(collection(db, COLLECTION), {
        name: input.name,
        attendance: input.attendance,
        side: input.side,
        companions: input.companions,
        message: input.message,
        createdAt: serverTimestamp(),
      });
    }
    setSubmitted(true);
    setOverride("closed");
    writeAutoShown();
  };

  const openModal = () => setOverride("open");
  const closeModal = () => {
    setOverride("closed");
    writeAutoShown();
  };

  return (
    <>
      <section className="flex flex-col items-center px-6 py-24">
        <div className="animate-fade-in-up flex w-full max-w-md flex-col">
          <div className="flex flex-col items-center text-center">
            <p className="text-secondary font-serif text-sm tracking-[0.3em] uppercase">
              RSVP
            </p>
            <h2 className="text-primary mt-6 font-serif text-3xl font-light">
              참석 의사 전달
            </h2>
            <p className="text-secondary mt-4 text-sm leading-relaxed whitespace-pre-line">
              {guideMessage}
            </p>
          </div>

          {closed ? (
            <p className="text-secondary mt-10 text-center text-sm leading-relaxed">
              RSVP 응답이 마감되었습니다.
              <br />
              참석 여부 변경은 신랑·신부에게 직접 연락해주세요.
            </p>
          ) : submitted ? (
            <div className="mt-10 flex flex-col items-center gap-4">
              <div
                role="status"
                className="border-accent text-secondary w-full rounded-sm border bg-transparent px-6 py-8 text-center text-sm leading-relaxed"
              >
                응답해 주셔서 감사합니다.
                <br />
                결혼식 당일 뵙겠습니다.
              </div>
              <button
                type="button"
                onClick={openModal}
                className="text-secondary hover:text-text text-xs underline underline-offset-4 transition-colors"
              >
                응답을 수정하거나 다시 보낼게요
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openModal}
              className="border-secondary text-secondary hover:bg-secondary mt-10 self-center rounded-sm border px-8 py-3 text-sm tracking-wider transition-colors hover:text-white"
            >
              참석 의사 보내기
            </button>
          )}
        </div>
      </section>

      <AnimatePresence>
        {modalOpen && (
          <RSVPModal
            showCompanions={showCompanions}
            showMessage={showMessage}
            guideMessage={guideMessage}
            onSubmit={handleSubmit}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { useEffect, useId } from "react";
import { motion } from "framer-motion";

import { RSVPForm, type RSVPSubmitInput } from "./RSVPForm";

type Props = {
  showCompanions: boolean;
  showMessage: boolean;
  guideMessage: string;
  /** form submit 성공 책임은 부모. throw 시 RSVPForm 내부 inline 에러 배너. */
  onSubmit: (input: RSVPSubmitInput) => Promise<void>;
  onClose: () => void;
};

/**
 * RSVP 폼을 모달로 래핑. 첫 방문 자동 popup + 재신청 버튼이 트리거.
 * Guestbook 의 DeleteConfirmModal 패턴 응용 — body scroll lock · ESC 닫기 ·
 * backdrop click · framer-motion 페이드. 부모가 mount/unmount 사이클로
 * form state 자동 초기화.
 */
export function RSVPModal({
  showCompanions,
  showMessage,
  guideMessage,
  onSubmit,
  onClose,
}: Props) {
  const headingId = useId();

  // body scroll lock + ESC 닫기. mount 시 단발 등록, unmount cleanup.
  // setState 호출 없음 → React 19 set-state-in-effect 룰과 무관.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.22 }}
        className="border-accent relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border bg-white p-6 shadow-xl sm:rounded-md"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="text-secondary hover:text-text absolute top-3 right-3 rounded-full px-2 py-1 text-xl leading-none transition-colors"
        >
          ×
        </button>

        <div className="flex flex-col items-center text-center">
          <p className="text-secondary font-serif text-sm tracking-[0.3em] uppercase">
            RSVP
          </p>
          <h2
            id={headingId}
            className="text-primary mt-4 font-serif text-2xl font-light"
          >
            참석 의사 전달
          </h2>
          <p className="text-secondary mt-3 text-sm leading-relaxed whitespace-pre-line">
            {guideMessage}
          </p>
        </div>

        <RSVPForm
          showCompanions={showCompanions}
          showMessage={showMessage}
          onSubmit={onSubmit}
        />
      </motion.div>
    </motion.div>
  );
}

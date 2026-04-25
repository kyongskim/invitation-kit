"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { motion } from "framer-motion";

import type { GuestbookEntry } from "../Guestbook";

type Props = {
  entry: GuestbookEntry;
  /**
   * 비밀번호 검증 + 삭제는 부모 책임. throw 시 모달이 inline 에러 표시:
   * - Error("password_mismatch") → "비밀번호가 일치하지 않습니다"
   * - 그 외 → "삭제에 실패했어요. 잠시 후 다시 시도해주세요"
   */
  onConfirm: (entry: GuestbookEntry, password: string) => Promise<void>;
  onCancel: () => void;
};

/**
 * Guestbook orchestrator 가 `<AnimatePresence>` 안에서 entry 있을 때만
 * 마운트한다 (mount/unmount 사이클로 state 자동 초기화 — useEffect 없이
 * React 19 `react-hooks/set-state-in-effect` 룰 회피).
 */
export function DeleteConfirmModal({ entry, onConfirm, onCancel }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordId = useId();
  const headingId = useId();

  // body scroll lock + ESC 닫기. mount 시 단발 등록, unmount cleanup.
  // setState 호출 없음 → set-state-in-effect 룰과 무관.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onCancel]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    if (password.length < 1) {
      setError("비밀번호를 입력해주세요");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onConfirm(entry, password);
      // 성공 시 부모가 entry=null 로 만들어 모달 unmount.
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "password_mismatch") {
        setError("비밀번호가 일치하지 않습니다");
      } else {
        console.error("[guestbook] delete failed", err);
        setError("삭제에 실패했어요. 잠시 후 다시 시도해주세요");
      }
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={() => {
        if (!submitting) onCancel();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.18 }}
        className="border-accent w-full max-w-sm rounded-md border bg-white p-6 shadow-xl"
      >
        <h3
          id={headingId}
          className="text-text font-serif text-base font-medium"
        >
          메시지 삭제
        </h3>
        <p className="text-secondary mt-2 text-sm leading-relaxed">
          <span className="text-text">{entry.name}</span> 님의 메시지를
          삭제할까요? 작성 시 입력한 비밀번호를 입력해주세요.
        </p>

        <form onSubmit={handleSubmit} className="mt-5" noValidate>
          <label
            htmlFor={passwordId}
            className="text-secondary text-xs tracking-wider"
          >
            비밀번호
          </label>
          <input
            id={passwordId}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={64}
            autoComplete="current-password"
            autoFocus
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${passwordId}-err` : undefined}
            disabled={submitting}
            className="border-accent text-text focus:border-secondary mt-1.5 w-full rounded-sm border bg-transparent px-3 py-2.5 text-sm focus:outline-none disabled:opacity-50"
          />
          {error && (
            <p id={`${passwordId}-err`} className="mt-1.5 text-xs text-red-600">
              {error}
            </p>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="text-secondary hover:text-text rounded-sm px-4 py-2 text-sm transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-sm border border-red-600 bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {submitting ? "삭제 중..." : "삭제"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

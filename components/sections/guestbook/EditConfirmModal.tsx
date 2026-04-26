"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { motion } from "framer-motion";

import type { GuestbookEntry } from "../Guestbook";

type Props = {
  entry: GuestbookEntry;
  /**
   * 비밀번호 검증 + updateDoc 은 부모 책임. throw 시 모달이 inline 에러 표시:
   * - Error("password_mismatch") → "비밀번호가 일치하지 않습니다"
   * - 그 외 → "수정에 실패했어요. 잠시 후 다시 시도해주세요"
   */
  onConfirm: (
    entry: GuestbookEntry,
    password: string,
    newName: string,
    newMessage: string,
  ) => Promise<void>;
  onCancel: () => void;
};

/**
 * Guestbook orchestrator 가 `<AnimatePresence>` 안에서 entry 있을 때만
 * 마운트한다 (mount/unmount 사이클로 state 자동 초기화).
 *
 * 단일 모달 안에서 비밀번호 + 새 name/message 입력 — 비밀번호 검증
 * 우선 단계 분리하지 않음. 메시지는 어차피 read 공개라 폼 prefill
 * 노출이 privacy 이슈 아님 + UX 단순화 우선.
 */
export function EditConfirmModal({ entry, onConfirm, onCancel }: Props) {
  const [name, setName] = useState(entry.name);
  const [message, setMessage] = useState(entry.message);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const nameId = useId();
  const messageId = useId();
  const passwordId = useId();
  const headingId = useId();

  // body scroll lock + ESC 닫기. mount 시 단발 등록, unmount cleanup.
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

    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 1 || trimmedName.length > 20) {
      setError("이름은 1~20자로 입력해주세요");
      return;
    }
    if (trimmedMessage.length < 1 || trimmedMessage.length > 500) {
      setError("메시지는 1~500자로 입력해주세요");
      return;
    }
    if (password.length < 1) {
      setError("비밀번호를 입력해주세요");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await onConfirm(entry, password, trimmedName, trimmedMessage);
      // 성공 시 부모가 entry=null 로 만들어 모달 unmount.
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "password_mismatch") {
        setError("비밀번호가 일치하지 않습니다");
      } else {
        console.error("[guestbook] update failed", err);
        setError("수정에 실패했어요. 잠시 후 다시 시도해주세요");
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
          메시지 수정
        </h3>
        <p className="text-secondary mt-2 text-sm leading-relaxed">
          작성 시 입력한 비밀번호를 입력하시면 메시지를 수정할 수 있어요.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={nameId}
              className="text-secondary text-xs tracking-wider"
            >
              이름
            </label>
            <input
              id={nameId}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              disabled={submitting}
              className="border-accent text-text focus:border-secondary rounded-sm border bg-transparent px-3 py-2.5 text-sm focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={messageId}
              className="text-secondary text-xs tracking-wider"
            >
              메시지
            </label>
            <textarea
              id={messageId}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={4}
              disabled={submitting}
              className="border-accent text-text focus:border-secondary rounded-sm border bg-transparent px-3 py-2.5 text-sm leading-relaxed focus:outline-none disabled:opacity-50"
            />
            <span className="text-secondary self-end text-xs tabular-nums">
              {message.length}/500
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
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
              disabled={submitting}
              className="border-accent text-text focus:border-secondary rounded-sm border bg-transparent px-3 py-2.5 text-sm focus:outline-none disabled:opacity-50"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="border-accent rounded-sm border bg-red-50 px-3 py-2 text-xs text-red-600"
            >
              {error}
            </p>
          )}

          <div className="mt-2 flex justify-end gap-2">
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
              className="border-secondary bg-secondary hover:bg-text rounded-sm border px-4 py-2 text-sm text-white transition-colors disabled:opacity-50"
            >
              {submitting ? "수정 중..." : "수정"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

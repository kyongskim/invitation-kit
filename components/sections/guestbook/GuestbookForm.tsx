"use client";

import { useId, useState, type FormEvent } from "react";

import { containsProfanity } from "@/lib/profanity";

export type GuestbookSubmitInput = {
  name: string;
  message: string;
  password: string;
};

type FormErrors = Partial<{
  name: string;
  message: string;
  password: string;
  submit: string;
}>;

type Props = {
  minPasswordLength: number;
  profanityFilterOn: boolean;
  /**
   * 검증 통과 후 호출. 성공 시 폼이 클리어되고, throw 하면 submit error 배너 노출.
   * 호출측이 토스트·optimistic prepend 등을 책임지고, throw 메시지는 표시하지 않으므로
   * 실패 사유는 폼 안의 고정 카피로 안내.
   */
  onSubmit: (input: GuestbookSubmitInput) => Promise<void>;
};

export function GuestbookForm({
  minPasswordLength,
  profanityFilterOn,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const nameId = useId();
  const messageId = useId();
  const passwordId = useId();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors: FormErrors = {};
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 1 || trimmedName.length > 20) {
      nextErrors.name = "이름은 1~20자로 입력해주세요";
    }
    if (trimmedMessage.length < 1 || trimmedMessage.length > 500) {
      nextErrors.message = "메시지는 1~500자로 입력해주세요";
    } else if (profanityFilterOn && containsProfanity(trimmedMessage)) {
      nextErrors.message = "부적절한 표현이 포함되어 있어요";
    }
    if (password.length < minPasswordLength) {
      nextErrors.password = `비밀번호는 ${minPasswordLength}자 이상이어야 해요`;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        message: trimmedMessage,
        password,
      });
      setName("");
      setMessage("");
      setPassword("");
    } catch (err) {
      console.error("[guestbook] submit failed", err);
      setErrors({ submit: "등록에 실패했어요. 잠시 후 다시 시도해주세요" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 flex flex-col gap-4 text-left"
      noValidate
    >
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
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${nameId}-err` : undefined}
          disabled={submitting}
          className="border-accent text-text focus:border-secondary rounded-sm border bg-transparent px-3 py-2.5 text-sm focus:outline-none disabled:opacity-50"
        />
        {errors.name && (
          <p id={`${nameId}-err`} className="text-xs text-red-600">
            {errors.name}
          </p>
        )}
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
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${messageId}-err` : undefined}
          disabled={submitting}
          className="border-accent text-text focus:border-secondary rounded-sm border bg-transparent px-3 py-2.5 text-sm leading-relaxed focus:outline-none disabled:opacity-50"
        />
        <div className="flex items-center justify-between">
          {errors.message ? (
            <p id={`${messageId}-err`} className="text-xs text-red-600">
              {errors.message}
            </p>
          ) : (
            <span />
          )}
          <span className="text-secondary text-xs tabular-nums">
            {message.length}/500
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={passwordId}
          className="text-secondary text-xs tracking-wider"
        >
          비밀번호 ({minPasswordLength}자 이상)
        </label>
        <input
          id={passwordId}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={64}
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? `${passwordId}-err` : undefined}
          disabled={submitting}
          className="border-accent text-text focus:border-secondary rounded-sm border bg-transparent px-3 py-2.5 text-sm focus:outline-none disabled:opacity-50"
        />
        {errors.password && (
          <p id={`${passwordId}-err`} className="text-xs text-red-600">
            {errors.password}
          </p>
        )}
      </div>

      {errors.submit && (
        <p
          role="alert"
          className="border-accent rounded-sm border bg-red-50 px-3 py-2 text-xs text-red-600"
        >
          {errors.submit}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="border-secondary text-secondary hover:bg-secondary disabled:hover:text-secondary mt-2 rounded-sm border px-6 py-3 text-sm tracking-wider transition-colors hover:text-white disabled:opacity-50 disabled:hover:bg-transparent"
      >
        {submitting ? "등록 중..." : "메시지 남기기"}
      </button>
    </form>
  );
}

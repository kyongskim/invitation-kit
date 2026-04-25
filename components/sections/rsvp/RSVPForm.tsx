"use client";

import { useId, useState, type FormEvent } from "react";

export type RSVPSubmitInput = {
  name: string;
  attendance: "yes" | "no";
  side: "groom" | "bride";
  companions: number;
  message: string;
};

type FormErrors = Partial<{
  name: string;
  attendance: string;
  side: string;
  companions: string;
  message: string;
  submit: string;
}>;

type Props = {
  showCompanions: boolean;
  showMessage: boolean;
  /** 검증 통과 후 호출. 성공 시 부모가 success state 로 전환. throw 하면 submit error 배너. */
  onSubmit: (input: RSVPSubmitInput) => Promise<void>;
};

export function RSVPForm({ showCompanions, showMessage, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<"yes" | "no" | "">("");
  const [side, setSide] = useState<"groom" | "bride" | "">("");
  const [companions, setCompanions] = useState("0");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const nameId = useId();
  const companionsId = useId();
  const messageId = useId();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors: FormErrors = {};
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    const companionsNum = Number.parseInt(companions, 10);

    if (trimmedName.length < 1 || trimmedName.length > 20) {
      nextErrors.name = "이름은 1~20자로 입력해주세요";
    }
    if (attendance !== "yes" && attendance !== "no") {
      nextErrors.attendance = "참석 여부를 선택해주세요";
    }
    if (side !== "groom" && side !== "bride") {
      nextErrors.side = "신랑/신부 측을 선택해주세요";
    }
    if (showCompanions) {
      if (
        Number.isNaN(companionsNum) ||
        companionsNum < 0 ||
        companionsNum > 5
      ) {
        nextErrors.companions = "동반 인원은 0~5명 사이여야 해요";
      }
    }
    if (showMessage && trimmedMessage.length > 200) {
      nextErrors.message = "메시지는 200자 이하로 입력해주세요";
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
        attendance: attendance as "yes" | "no",
        side: side as "groom" | "bride",
        companions: showCompanions ? companionsNum : 0,
        message: showMessage ? trimmedMessage : "",
      });
    } catch (err) {
      console.error("[rsvp] submit failed", err);
      setErrors({ submit: "전송에 실패했어요. 잠시 후 다시 시도해주세요" });
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-10 flex flex-col gap-5 text-left"
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

      <fieldset className="flex flex-col gap-2">
        <legend className="text-secondary text-xs tracking-wider">
          참석 여부
        </legend>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <RadioCard
            name="attendance"
            value="yes"
            checked={attendance === "yes"}
            onChange={() => setAttendance("yes")}
            label="참석합니다"
            disabled={submitting}
          />
          <RadioCard
            name="attendance"
            value="no"
            checked={attendance === "no"}
            onChange={() => setAttendance("no")}
            label="참석 어렵습니다"
            disabled={submitting}
          />
        </div>
        {errors.attendance && (
          <p className="text-xs text-red-600">{errors.attendance}</p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-secondary text-xs tracking-wider">
          신랑/신부 측
        </legend>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <RadioCard
            name="side"
            value="groom"
            checked={side === "groom"}
            onChange={() => setSide("groom")}
            label="신랑 측"
            disabled={submitting}
          />
          <RadioCard
            name="side"
            value="bride"
            checked={side === "bride"}
            onChange={() => setSide("bride")}
            label="신부 측"
            disabled={submitting}
          />
        </div>
        {errors.side && <p className="text-xs text-red-600">{errors.side}</p>}
      </fieldset>

      {showCompanions && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={companionsId}
            className="text-secondary text-xs tracking-wider"
          >
            동반 인원 (본인 제외)
          </label>
          <input
            id={companionsId}
            type="number"
            inputMode="numeric"
            value={companions}
            onChange={(e) => setCompanions(e.target.value)}
            min={0}
            max={5}
            aria-invalid={Boolean(errors.companions)}
            aria-describedby={
              errors.companions ? `${companionsId}-err` : undefined
            }
            disabled={submitting}
            className="border-accent text-text focus:border-secondary w-24 rounded-sm border bg-transparent px-3 py-2.5 text-sm tabular-nums focus:outline-none disabled:opacity-50"
          />
          {errors.companions && (
            <p id={`${companionsId}-err`} className="text-xs text-red-600">
              {errors.companions}
            </p>
          )}
        </div>
      )}

      {showMessage && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={messageId}
            className="text-secondary text-xs tracking-wider"
          >
            전하실 말씀 (선택)
          </label>
          <textarea
            id={messageId}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={200}
            rows={3}
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
              {message.length}/200
            </span>
          </div>
        </div>
      )}

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
        {submitting ? "전송 중..." : "응답 보내기"}
      </button>
    </form>
  );
}

function RadioCard({
  name,
  value,
  checked,
  onChange,
  label,
  disabled,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-center rounded-sm border px-3 py-2.5 text-sm transition-colors ${
        checked
          ? "border-secondary bg-secondary text-white"
          : "border-accent text-text hover:border-secondary"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      {label}
    </label>
  );
}

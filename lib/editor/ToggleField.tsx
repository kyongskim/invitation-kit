"use client";

/**
 * boolean toggle (checkbox). Field 와 동일 visual language — 청첩장 토큰
 * 그대로 재사용해 form pane 의 일관성 유지.
 */
export function ToggleField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-primary mt-0.5"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-text text-sm">{label}</span>
        {hint && <span className="text-secondary/70 text-xs">{hint}</span>}
      </span>
    </label>
  );
}

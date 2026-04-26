"use client";

/**
 * v2.0 editor 의 form 컨트롤 wrapper. label + value + onChange 의 thin wrapper.
 *
 * 디자인 의도: 청첩장 컴포넌트의 토큰 (`--color-accent`, `--color-text`,
 * `--color-secondary`) 그대로 재사용해 editor pane 도 같은 visual language.
 * 청첩장 theme 변경 시 form 컨트롤 색도 자동 따라감.
 */
type CommonProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
};

type FieldProps =
  | (CommonProps & {
      multiline?: false;
      type?: "text" | "url" | "datetime-local" | "number";
      step?: string;
    })
  | (CommonProps & { multiline: true; rows?: number });

const baseInputClass =
  "border-accent text-text w-full rounded-sm border bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-secondary";

export function Field(props: FieldProps) {
  const { label, value, onChange, placeholder, hint } = props;
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-secondary text-xs tracking-wider uppercase">
        {label}
      </span>
      {props.multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={props.rows ?? 4}
          className={baseInputClass}
        />
      ) : (
        <input
          type={props.type ?? "text"}
          step={props.type === "number" ? (props.step ?? "any") : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseInputClass}
        />
      )}
      {hint && <span className="text-secondary/70 text-xs">{hint}</span>}
    </label>
  );
}

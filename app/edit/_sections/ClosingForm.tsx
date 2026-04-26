"use client";

import { Field } from "@/lib/editor/Field";
import { useEditorStore } from "@/lib/editor/store";

/**
 * 끝인사. config.closing 은 optional — 두 필드 모두 빈 문자열이면 closing
 * 자체를 undefined 로 set 해서 store · 직렬화에서 빠지게 함.
 */
export function ClosingForm() {
  const closing = useEditorStore((s) => s.config.closing);
  const setField = useEditorStore((s) => s.setField);

  const message = closing?.message ?? "";
  const signature = closing?.signature ?? "";

  function update(next: { message: string; signature: string }) {
    if (!next.message && !next.signature) {
      setField("closing", undefined);
      return;
    }
    setField("closing", {
      ...(next.message ? { message: next.message } : {}),
      ...(next.signature ? { signature: next.signature } : {}),
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-primary font-serif text-lg">끝인사</h2>

      <Field
        label="끝인사 본문"
        multiline
        value={message}
        onChange={(v) => update({ message: v, signature })}
        placeholder="귀한 걸음으로 축복해 주시면 감사하겠습니다."
        rows={3}
      />
      <Field
        label="서명"
        value={signature}
        onChange={(v) => update({ message, signature: v })}
        placeholder="김철수 · 이영희 드림"
      />

      <p className="text-secondary/70 text-xs leading-relaxed">
        두 필드 모두 비우면 끝인사 섹션이 청첩장에서 사라집니다.
      </p>
    </section>
  );
}

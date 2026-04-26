"use client";

import { Field } from "@/lib/editor/Field";
import { useEditorStore } from "@/lib/editor/store";

export function GreetingForm() {
  const greeting = useEditorStore((s) => s.config.greeting);
  const setField = useEditorStore((s) => s.setField);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-primary font-serif text-lg">인사말</h2>
      <Field
        label="제목"
        value={greeting.title ?? ""}
        onChange={(v) => setField("greeting", { ...greeting, title: v })}
        placeholder="모시는 글"
      />
      <Field
        label="본문"
        value={greeting.message}
        onChange={(v) => setField("greeting", { ...greeting, message: v })}
        multiline
        rows={6}
        hint="줄바꿈 그대로 표시됩니다"
      />
    </section>
  );
}

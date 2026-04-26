"use client";

import { Field } from "@/lib/editor/Field";
import { useEditorStore } from "@/lib/editor/store";

export function MetaForm() {
  const meta = useEditorStore((s) => s.config.meta);
  const setField = useEditorStore((s) => s.setField);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-primary font-serif text-lg">사이트 정보</h2>
      <Field
        label="페이지 제목"
        value={meta.title}
        onChange={(v) => setField("meta", { ...meta, title: v })}
        hint="<title> 태그 + OG 태그 + 카카오톡 공유 카드 제목"
      />
      <Field
        label="설명"
        value={meta.description}
        onChange={(v) => setField("meta", { ...meta, description: v })}
        multiline
        rows={3}
      />
      <Field
        label="사이트 URL"
        value={meta.siteUrl}
        onChange={(v) => setField("meta", { ...meta, siteUrl: v })}
        type="url"
        placeholder="https://your-wedding.vercel.app"
        hint="배포된 청첩장의 절대 URL. 카카오톡 공유 버튼 링크 + OG metadata"
      />
    </section>
  );
}

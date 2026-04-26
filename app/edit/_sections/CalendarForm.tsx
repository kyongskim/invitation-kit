"use client";

import { Field } from "@/lib/editor/Field";
import { useEditorStore } from "@/lib/editor/store";

/**
 * KST hard-coded — 한국 결혼식 1순위 정체성 그대로 (CLAUDE.md WHY 2번).
 * datetime-local input 은 timezone 없는 local time → KST 가정으로 +09:00
 * 부착해 ISO 8601 로 저장. timezone 선택 지원은 v2.1+ 후보.
 */
function isoToLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const kstMs = d.getTime() + 9 * 60 * 60 * 1000;
  return new Date(kstMs).toISOString().slice(0, 16);
}

function localToIso(local: string): string {
  if (!local) return "";
  return `${local}:00+09:00`;
}

export function CalendarForm() {
  const date = useEditorStore((s) => s.config.date);
  const setField = useEditorStore((s) => s.setField);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-primary font-serif text-lg">예식 일시</h2>
      <Field
        label="날짜·시각"
        type="datetime-local"
        value={isoToLocal(date)}
        onChange={(v) => setField("date", localToIso(v))}
        hint="한국 시간 (KST) 기준. 카운트다운·캘린더·RSVP 마감 기준"
      />
    </section>
  );
}

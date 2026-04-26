"use client";

import { Field } from "@/lib/editor/Field";
import { useEditorStore } from "@/lib/editor/store";
import { ToggleField } from "@/lib/editor/ToggleField";

export function GuestbookConfigForm() {
  const guestbook = useEditorStore((s) => s.config.guestbook);
  const setField = useEditorStore((s) => s.setField);

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-primary font-serif text-lg">방명록</h2>

      <ToggleField
        label="방명록 활성화"
        value={guestbook.enabled}
        onChange={(v) => setField("guestbook", { ...guestbook, enabled: v })}
        hint="끄면 청첩장에 방명록 섹션이 노출되지 않습니다"
      />

      {guestbook.enabled && (
        <>
          <Field
            label="비밀번호 최소 길이"
            type="number"
            step="1"
            value={String(guestbook.minPasswordLength ?? 4)}
            onChange={(v) =>
              setField("guestbook", {
                ...guestbook,
                minPasswordLength: Math.max(1, Number.parseInt(v, 10) || 4),
              })
            }
            hint="작성·수정·삭제 시 사용자가 입력할 비밀번호 길이"
          />
          <ToggleField
            label="욕설 필터 사용"
            value={guestbook.profanityFilter !== false}
            onChange={(v) =>
              setField("guestbook", { ...guestbook, profanityFilter: v })
            }
            hint="badwords-ko + 자체 보강 데이터 (ADR 006)"
          />
        </>
      )}
    </section>
  );
}

"use client";

import { Field } from "@/lib/editor/Field";
import { useEditorStore } from "@/lib/editor/store";
import { ToggleField } from "@/lib/editor/ToggleField";

/**
 * RSVP 동작 옵션. 데이터 저장은 호스트가 Firebase Console 에서 직접 (ADR 008
 * read 차단). 여기서는 활성 여부 + 마감 + 안내 + 선택 필드 표시만 갱신.
 *
 * deadline 변환 방식은 CalendarForm 과 동일 KST 가정.
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

export function RSVPConfigForm() {
  const rsvp = useEditorStore((s) => s.config.rsvp);
  const setField = useEditorStore((s) => s.setField);
  const fields = rsvp.fields ?? {};

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-primary font-serif text-lg">RSVP</h2>

      <ToggleField
        label="RSVP 활성화"
        value={rsvp.enabled}
        onChange={(v) => setField("rsvp", { ...rsvp, enabled: v })}
        hint="끄면 청첩장에 RSVP 섹션이 노출되지 않습니다"
      />

      {rsvp.enabled && (
        <>
          <Field
            label="응답 마감"
            type="datetime-local"
            value={isoToLocal(rsvp.deadline ?? "")}
            onChange={(v) =>
              setField("rsvp", {
                ...rsvp,
                deadline: localToIso(v) || undefined,
              })
            }
            hint="비우면 항상 활성. 마감 후 form 자동 비활성"
          />
          <Field
            label="안내 문구"
            value={rsvp.message ?? ""}
            onChange={(v) =>
              setField("rsvp", { ...rsvp, message: v || undefined })
            }
            multiline
            rows={3}
            placeholder="참석 여부를 알려주시면 결혼식 준비에 큰 도움이 됩니다."
          />
          <ToggleField
            label="동반 인원 입력"
            value={fields.companions !== false}
            onChange={(v) =>
              setField("rsvp", {
                ...rsvp,
                fields: { ...fields, companions: v },
              })
            }
          />
          <ToggleField
            label="메시지 입력"
            value={fields.message !== false}
            onChange={(v) =>
              setField("rsvp", {
                ...rsvp,
                fields: { ...fields, message: v },
              })
            }
          />
        </>
      )}
    </section>
  );
}

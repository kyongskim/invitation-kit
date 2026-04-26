"use client";

import { Field } from "@/lib/editor/Field";
import { useEditorStore } from "@/lib/editor/store";

/**
 * 예식장. coords 의 lat/lng 는 number → string parseFloat 변환은 form 단.
 * transportation 4 옵션 (지하철·버스·자가용·주차) 은 모두 optional.
 */
export function VenueForm() {
  const venue = useEditorStore((s) => s.config.venue);
  const setField = useEditorStore((s) => s.setField);
  const transportation = venue.transportation ?? {};

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-primary font-serif text-lg">예식장</h2>

      <Field
        label="예식장 이름"
        value={venue.name}
        onChange={(v) => setField("venue", { ...venue, name: v })}
      />
      <Field
        label="홀 이름"
        value={venue.hall ?? ""}
        onChange={(v) => setField("venue", { ...venue, hall: v })}
        placeholder="2층 그랜드볼룸"
      />
      <Field
        label="주소"
        value={venue.address}
        onChange={(v) => setField("venue", { ...venue, address: v })}
        hint="도로명 주소 권장"
      />

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="위도 (lat)"
          type="number"
          value={String(venue.coords.lat)}
          onChange={(v) =>
            setField("venue", {
              ...venue,
              coords: { ...venue.coords, lat: Number.parseFloat(v) || 0 },
            })
          }
        />
        <Field
          label="경도 (lng)"
          type="number"
          value={String(venue.coords.lng)}
          onChange={(v) =>
            setField("venue", {
              ...venue,
              coords: { ...venue.coords, lng: Number.parseFloat(v) || 0 },
            })
          }
        />
      </div>

      <h3 className="text-secondary mt-2 text-xs tracking-wider uppercase">
        교통편 (선택)
      </h3>
      <Field
        label="지하철"
        value={transportation.subway ?? ""}
        onChange={(v) =>
          setField("venue", {
            ...venue,
            transportation: { ...transportation, subway: v },
          })
        }
      />
      <Field
        label="버스"
        value={transportation.bus ?? ""}
        onChange={(v) =>
          setField("venue", {
            ...venue,
            transportation: { ...transportation, bus: v },
          })
        }
      />
      <Field
        label="자가용"
        value={transportation.car ?? ""}
        onChange={(v) =>
          setField("venue", {
            ...venue,
            transportation: { ...transportation, car: v },
          })
        }
      />
      <Field
        label="주차"
        value={transportation.parking ?? ""}
        onChange={(v) =>
          setField("venue", {
            ...venue,
            transportation: { ...transportation, parking: v },
          })
        }
      />
    </section>
  );
}

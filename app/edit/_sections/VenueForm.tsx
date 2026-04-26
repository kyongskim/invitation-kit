"use client";

import { useState } from "react";

import { Field } from "@/lib/editor/Field";
import { useEditorStore } from "@/lib/editor/store";

/**
 * 예식장. coords 의 lat/lng 는 number → string parseFloat 변환은 form 단.
 * transportation 4 옵션 (지하철·버스·자가용·주차) 은 모두 optional.
 *
 * Phase 3-c: 카카오 Local API 검색 UI 추가. 사용자가 예식장 이름으로
 * 검색 → 결과 클릭 시 name + address + coords 자동 채움. 좌표를 외부
 * 도구로 찾는 마찰 제거. 검색 자동화는 KAKAO_REST_API_KEY 미설정 시
 * 503 → "직접 입력" 안내로 graceful degrade.
 */

type SearchPlace = {
  name: string;
  address: string;
  coords: { lat: number; lng: number };
};

type SearchStatus =
  | { kind: "idle" }
  | { kind: "searching" }
  | { kind: "results"; places: SearchPlace[] }
  | { kind: "empty" }
  | { kind: "error"; message: string };

export function VenueForm() {
  const venue = useEditorStore((s) => s.config.venue);
  const setField = useEditorStore((s) => s.setField);
  const transportation = venue.transportation ?? {};

  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<SearchStatus>({ kind: "idle" });

  async function handleSearch() {
    const q = searchQuery.trim();
    if (!q) return;
    setStatus({ kind: "searching" });
    try {
      const res = await fetch(`/api/kakao/search?q=${encodeURIComponent(q)}`);
      const data = (await res.json().catch(() => ({}))) as {
        places?: SearchPlace[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const places = data.places ?? [];
      setStatus(
        places.length === 0 ? { kind: "empty" } : { kind: "results", places },
      );
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  function selectPlace(place: SearchPlace) {
    setField("venue", {
      ...venue,
      name: place.name,
      address: place.address,
      coords: place.coords,
    });
    setStatus({ kind: "idle" });
    setSearchQuery("");
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-primary font-serif text-lg">예식장</h2>

      <div className="border-secondary/20 flex flex-col gap-2 rounded-sm border border-dashed p-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-secondary text-xs tracking-wider uppercase">
            카카오 장소 검색
          </span>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleSearch();
                }
              }}
              placeholder="더채플 광화문"
              className="border-accent text-text focus:border-secondary flex-1 rounded-sm border bg-transparent px-3 py-2 text-sm focus:outline-none"
            />
            <button
              type="button"
              onClick={() => void handleSearch()}
              disabled={status.kind === "searching" || !searchQuery.trim()}
              className="border-accent text-secondary hover:text-primary hover:border-primary rounded-sm border px-3 py-2 text-xs tracking-wider uppercase transition-colors disabled:opacity-50"
            >
              {status.kind === "searching" ? "검색…" : "검색"}
            </button>
          </div>
          <span className="text-secondary/70 text-xs">
            결과 클릭 시 이름·주소·좌표가 자동 채워집니다. 직접 입력도 가능.
          </span>
        </label>

        {status.kind === "results" && (
          <ul className="flex flex-col gap-1">
            {status.places.map((place, i) => (
              <li key={`${place.name}-${i}`}>
                <button
                  type="button"
                  onClick={() => selectPlace(place)}
                  className="border-accent/30 hover:border-accent hover:bg-background-alt w-full rounded-sm border px-3 py-2 text-left text-xs transition-colors"
                >
                  <div className="text-text">{place.name}</div>
                  <div className="text-secondary/70 mt-0.5">
                    {place.address}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
        {status.kind === "empty" && (
          <p className="text-secondary/70 text-xs">검색 결과가 없습니다.</p>
        )}
        {status.kind === "error" && (
          <p className="text-xs text-red-600">{status.message}</p>
        )}
      </div>

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

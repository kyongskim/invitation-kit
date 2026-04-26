"use client";

import { Field } from "@/lib/editor/Field";
import { useEditorStore } from "@/lib/editor/store";
import { ToggleField } from "@/lib/editor/ToggleField";

/**
 * 카카오톡 공유 카드 설정. buttons sub-tree 가 3 단계 deep optional
 * (`buttons?` → `site?`/`map?` → `enabled?`/`label?`) 이라 form 단에서
 * 매 update 시 기본값 보장 후 spread.
 *
 * site/map default enabled (ADR 004): site=true, map=false. UI 는
 * `enabled !== false` / `enabled === true` 분기로 표현. label 빈 string
 * → undefined spread (sample config 의 label 미설정 형태 유지). 카카오
 * 콘솔 도메인 등록은 .claude/rules/kakao-sdk.md 참조.
 */
export function ShareForm() {
  const share = useEditorStore((s) => s.config.share);
  const setField = useEditorStore((s) => s.setField);
  const buttons = share.buttons ?? {};
  const site = buttons.site ?? {};
  const map = buttons.map ?? {};

  function updateSite(next: { enabled?: boolean; label?: string }) {
    setField("share", {
      ...share,
      buttons: { ...buttons, site: { ...site, ...next } },
    });
  }

  function updateMap(next: { enabled?: boolean; label?: string }) {
    setField("share", {
      ...share,
      buttons: { ...buttons, map: { ...map, ...next } },
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-primary font-serif text-lg">카카오톡 공유</h2>

      <Field
        label="공유 카드 타이틀"
        value={share.title}
        onChange={(v) => setField("share", { ...share, title: v })}
      />
      <Field
        label="공유 카드 설명"
        value={share.description}
        onChange={(v) => setField("share", { ...share, description: v })}
        multiline
        rows={2}
      />
      <Field
        label="썸네일 이미지 URL"
        type="url"
        value={share.thumbnailUrl}
        onChange={(v) => setField("share", { ...share, thumbnailUrl: v })}
        placeholder="https://your-domain.vercel.app/images/og.jpg"
        hint="반드시 절대 URL. 호스트가 카카오 콘솔 등록 도메인이어야 합니다"
      />

      <h3 className="text-secondary mt-2 text-xs tracking-wider uppercase">
        공유 카드 버튼
      </h3>

      <ToggleField
        label="청첩장 보기 버튼"
        value={site.enabled !== false}
        onChange={(v) => updateSite({ enabled: v })}
        hint="기본 ON. URL 은 meta.siteUrl 에서 자동 유도"
      />
      {site.enabled !== false && (
        <Field
          label="청첩장 보기 — 버튼 라벨"
          value={site.label ?? ""}
          onChange={(v) => updateSite({ label: v || undefined })}
          placeholder="청첩장 보기"
        />
      )}

      <ToggleField
        label="지도 보기 버튼"
        value={map.enabled === true}
        onChange={(v) => updateMap({ enabled: v })}
        hint="기본 OFF. 활성 시 venue.coords 로 카카오맵 딥링크 자동 조립 — map.kakao.com 의 콘솔 도메인 등록 필요"
      />
      {map.enabled === true && (
        <Field
          label="지도 보기 — 버튼 라벨"
          value={map.label ?? ""}
          onChange={(v) => updateMap({ label: v || undefined })}
          placeholder="지도 보기"
        />
      )}
    </section>
  );
}

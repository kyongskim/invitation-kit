"use client";

import type { GalleryImage } from "@/invitation.config";
import { Field } from "@/lib/editor/Field";
import { useEditorStore } from "@/lib/editor/store";

/**
 * 갤러리 사진 array 의 동적 add/remove. Accounts (Phase 2-3c-ii) 의 add/remove
 * 패턴 단일 array 적용. width/height 는 layout 안정화용 optional → 빈 string
 * 은 undefined 로 처리 (Venue lat/lng 의 `|| 0` required fallback 과 다름).
 *
 * 입력 모델은 ADR 010 + Phase 2-3c-iii 결정으로 URL/path 문자열만 (option C).
 * 파일 업로드는 Phase 3-4 GitHub deploy 호흡에서 별도 도입 — repo commit
 * payload 형식 결정과 같이 처리.
 */
const EMPTY_IMAGE: GalleryImage = { src: "", alt: "" };

function parseDimension(input: string): number | undefined {
  if (input.trim() === "") return undefined;
  const n = Number.parseInt(input, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function rowTitle(image: GalleryImage, idx: number): string {
  if (image.alt) return image.alt;
  if (image.src) {
    const base = image.src.split("/").pop();
    if (base) return base;
  }
  return `사진 ${idx + 1}`;
}

export function GalleryForm() {
  const gallery = useEditorStore((s) => s.config.gallery);
  const setField = useEditorStore((s) => s.setField);

  function addImage() {
    setField("gallery", [...gallery, EMPTY_IMAGE]);
  }

  function removeImage(idx: number) {
    setField(
      "gallery",
      gallery.filter((_, i) => i !== idx),
    );
  }

  function updateImage(idx: number, next: GalleryImage) {
    setField(
      "gallery",
      gallery.map((g, i) => (i === idx ? next : g)),
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-primary font-serif text-lg">갤러리</h2>
      <p className="text-secondary/70 text-xs leading-relaxed">
        파일 업로드는 GitHub 배포 호흡에서 추가됩니다. 지금은 URL 또는 public/
        기준 경로를 직접 입력하세요.
      </p>

      {gallery.map((image, idx) => (
        <div
          key={idx}
          className="border-secondary/20 flex flex-col gap-3 rounded-sm border p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-text text-sm">{rowTitle(image, idx)}</span>
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="text-secondary hover:text-primary text-xs underline-offset-2 hover:underline"
            >
              삭제
            </button>
          </div>

          <Field
            label="이미지 경로 또는 URL"
            value={image.src}
            onChange={(v) => updateImage(idx, { ...image, src: v })}
            placeholder="/images/gallery/sample-01.jpg"
          />
          <Field
            label="대체 텍스트 (alt)"
            value={image.alt}
            onChange={(v) => updateImage(idx, { ...image, alt: v })}
            placeholder="웨딩촬영 01"
            hint="접근성 + 이미지 로드 실패 시 표시"
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="원본 너비 (선택)"
              type="number"
              step="1"
              value={image.width !== undefined ? String(image.width) : ""}
              onChange={(v) =>
                updateImage(idx, { ...image, width: parseDimension(v) })
              }
              placeholder="650"
            />
            <Field
              label="원본 높이 (선택)"
              type="number"
              step="1"
              value={image.height !== undefined ? String(image.height) : ""}
              onChange={(v) =>
                updateImage(idx, { ...image, height: parseDimension(v) })
              }
              placeholder="433"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addImage}
        className="border-accent text-secondary hover:text-primary hover:border-primary rounded-sm border border-dashed py-2 text-xs tracking-wider uppercase transition-colors"
      >
        + 사진 추가
      </button>
    </section>
  );
}

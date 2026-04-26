"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";

import type { GalleryImage } from "@/invitation.config.types";
import { Field } from "@/lib/editor/Field";
import { uploadImage } from "@/lib/editor/github-upload";
import { useEditorStore } from "@/lib/editor/store";

/**
 * 갤러리 사진 array 의 동적 add/remove + 파일 업로드.
 *
 * 입력 모델 (Phase 2-3c-iii) — URL/path 문자열만 (option C). 파일 업로드는
 * Phase 3-b 에서 도입: github 토큰 + publishedRepo 둘 다 있을 때만 활성.
 * 업로드 후 src 자동 갱신 + 짧은 commit URL 안내. config 의 src 변경은
 * 다음 "변경사항 commit" (PublishToGithub) 시 반영됨.
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

type UploadStatus =
  | { kind: "idle" }
  | { kind: "uploading" }
  | { kind: "success"; commitUrl: string | null }
  | { kind: "error"; message: string };

/**
 * 업로드 직전 client 단에서 이미지 픽셀 너비/높이 추출.
 * Next.js `<Image>` CLS 방지용 — 사용자 수동 입력 마찰 제거.
 * createImageBitmap 우선 (빠름) + Image 객체 fallback (구형 브라우저).
 * 실패 시 undefined 반환 — 업로드 흐름 자체는 계속 진행.
 */
async function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number } | undefined> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      const dims = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return dims;
    } catch {
      // fall through to Image fallback
    }
  }
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(undefined);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export function GalleryForm() {
  const gallery = useEditorStore((s) => s.config.gallery);
  const setField = useEditorStore((s) => s.setField);
  const github = useEditorStore((s) => s.github);
  const publishedRepo = useEditorStore((s) => s.publishedRepo);

  const [statuses, setStatuses] = useState<Record<number, UploadStatus>>({});

  const uploadEnabled = Boolean(github.token && publishedRepo);

  function addImage() {
    setField("gallery", [...gallery, EMPTY_IMAGE]);
  }

  function removeImage(idx: number) {
    setField(
      "gallery",
      gallery.filter((_, i) => i !== idx),
    );
    setStatuses((prev) => {
      const next = { ...prev };
      delete next[idx];
      return next;
    });
  }

  function updateImage(idx: number, next: GalleryImage) {
    setField(
      "gallery",
      gallery.map((g, i) => (i === idx ? next : g)),
    );
  }

  async function handleFileChange(
    idx: number,
    e: ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!github.token || !publishedRepo) {
      setStatuses((prev) => ({
        ...prev,
        [idx]: {
          kind: "error",
          message: "GitHub 연결 + 청첩장 만들기 후 업로드 가능합니다.",
        },
      }));
      return;
    }

    setStatuses((prev) => ({ ...prev, [idx]: { kind: "uploading" } }));

    try {
      const dimensions = await readImageDimensions(file);
      const result = await uploadImage({
        token: github.token,
        owner: publishedRepo.owner,
        repo: publishedRepo.name,
        branch: publishedRepo.branch,
        file,
      });
      const current = gallery[idx];
      const nextAlt =
        current?.alt && current.alt.length > 0
          ? current.alt
          : file.name.replace(/\.[^.]+$/, "");
      updateImage(idx, {
        ...(current ?? EMPTY_IMAGE),
        src: result.src,
        alt: nextAlt,
        ...(dimensions
          ? { width: dimensions.width, height: dimensions.height }
          : {}),
      });
      setStatuses((prev) => ({
        ...prev,
        [idx]: { kind: "success", commitUrl: result.commitUrl },
      }));
    } catch (err) {
      setStatuses((prev) => ({
        ...prev,
        [idx]: {
          kind: "error",
          message: err instanceof Error ? err.message : String(err),
        },
      }));
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-primary font-serif text-lg">갤러리</h2>
      <p className="text-secondary/70 text-xs leading-relaxed">
        URL 또는 public/ 기준 경로 직접 입력 가능. 파일 업로드는 GitHub 연결 +
        청첩장 만들기 후 활성화 — 본인 repo 의 public/images/gallery/ 에 직접
        commit 됩니다 (5MB 이하, JPG/PNG/WebP/GIF).
      </p>

      {gallery.map((image, idx) => {
        const status = statuses[idx] ?? { kind: "idle" };
        return (
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

            <label className="flex flex-col gap-1">
              <span className="text-secondary text-xs tracking-wider uppercase">
                파일 업로드
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={!uploadEnabled || status.kind === "uploading"}
                onChange={(e) => handleFileChange(idx, e)}
                className="text-text file:border-accent file:text-secondary hover:file:text-primary text-xs file:mr-3 file:rounded-sm file:border file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:tracking-wider file:uppercase disabled:opacity-40"
              />
              {!uploadEnabled && (
                <span className="text-secondary/70 text-xs">
                  GitHub 연결 + 청첩장 만들기 후 활성화됩니다.
                </span>
              )}
              {status.kind === "uploading" && (
                <span className="text-secondary text-xs">업로드 중…</span>
              )}
              {status.kind === "success" && (
                <span className="text-xs text-emerald-700">
                  업로드 완료. 변경사항을 적용하려면 &quot;변경사항 commit&quot;
                  을 눌러주세요.
                  {status.commitUrl && (
                    <>
                      {" "}
                      <a
                        href={status.commitUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        commit 보기
                      </a>
                    </>
                  )}
                </span>
              )}
              {status.kind === "error" && (
                <span className="text-xs text-red-600">{status.message}</span>
              )}
            </label>
          </div>
        );
      })}

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

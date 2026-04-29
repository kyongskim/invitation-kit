"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import type { GalleryImage } from "@/invitation.config.types";

// 네이티브 touch 이벤트 기반 swipe — framer-motion `drag` 의 모바일
// 안정성 이슈 회피 (iOS Safari 의 pointer event + body touchAction:none
// 조합에서 일관 미발화 사례). threshold 는 50px — 네이티브 정확도가
// 높아 100px 보다 낮춰도 오감 없음.
const SWIPE_THRESHOLD = 50;

// AnimatePresence variants — direction 별 slide. enter/exit 의 x 부호를
// 반대로 두어 "다음 누르면 새 이미지가 오른쪽에서 들어오고 이전 이미지는
// 왼쪽으로 빠지는" 자연스러운 carousel 동작.
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

export function Gallery({ gallery }: { gallery: GalleryImage[] }) {
  const total = gallery.length;
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const touchStartX = useRef<number | null>(null);

  const close = useCallback(() => setActiveIdx(null), []);
  const prev = useCallback(() => {
    setDirection(-1);
    setActiveIdx((i) => (i === null ? null : (i - 1 + total) % total));
  }, [total]);
  const next = useCallback(() => {
    setDirection(1);
    setActiveIdx((i) => (i === null ? null : (i + 1) % total));
  }, [total]);

  useEffect(() => {
    if (activeIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIdx, close, prev, next]);

  useEffect(() => {
    if (activeIdx === null) return;
    const { style } = document.body;
    const prevOverflow = style.overflow;
    const prevTouchAction = style.touchAction;
    style.overflow = "hidden";
    style.touchAction = "none";
    return () => {
      style.overflow = prevOverflow;
      style.touchAction = prevTouchAction;
    };
  }, [activeIdx]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > SWIPE_THRESHOLD) prev();
    else if (deltaX < -SWIPE_THRESHOLD) next();
    touchStartX.current = null;
  };

  const active = activeIdx !== null ? gallery[activeIdx] : null;

  return (
    <>
      <section className="flex flex-col items-center px-6 py-24">
        <div className="animate-fade-in-up flex w-full max-w-3xl flex-col items-center">
          <p className="text-secondary font-serif text-sm tracking-[0.3em] uppercase">
            Gallery
          </p>
          <h2 className="text-primary mt-6 font-serif text-3xl font-light">
            사진첩
          </h2>

          <div className="mt-12 w-full columns-2 gap-3 sm:columns-3">
            {gallery.map((image, idx) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setActiveIdx(idx)}
                aria-label={`사진 ${idx + 1} 크게 보기`}
                className="mb-3 block w-full cursor-zoom-in break-inside-avoid overflow-hidden transition-opacity hover:opacity-85"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width ?? 800}
                  height={image.height ?? 600}
                  sizes="(min-width: 640px) 33vw, 50vw"
                  className="h-auto w-full"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {active && activeIdx !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`사진 ${activeIdx + 1}/${total}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              aria-label="갤러리 닫기"
              className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
            >
              ×
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              aria-label="이전 사진"
              className="absolute top-1/2 left-2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20 sm:left-6"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              aria-label="다음 사진"
              className="absolute top-1/2 right-2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20 sm:right-6"
            >
              ›
            </button>

            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.div
                key={activeIdx}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "tween", duration: 0.3, ease: "easeOut" },
                  opacity: { duration: 0.2 },
                }}
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="relative h-[100dvh] w-full">
                  <Image
                    src={active.src}
                    alt={active.alt}
                    fill
                    sizes="100vw"
                    priority
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            <p className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-sm tracking-wider text-white/80">
              {activeIdx + 1} / {total}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import type { GalleryImage } from "@/invitation.config.types";

// 인스타 스타일 carousel — prev/current/next 3 장이 항상 stacked 되어
// 손가락 따라 컨테이너가 좌우로 이동. threshold (화면 폭 30%) 안 넘으면
// 원위치 snap, 넘으면 다음/이전으로 finish. 네이티브 touch + CSS transform
// 으로 framer-motion drag 의 iOS Safari 안정성 이슈 회피.
const SWIPE_THRESHOLD_RATIO = 0.3;
const TRANSITION_MS = 300;

export function Gallery({ gallery }: { gallery: GalleryImage[] }) {
  const total = gallery.length;
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const isAnimatingRef = useRef(false);
  const touchStartXRef = useRef<number | null>(null);

  const close = useCallback(() => setActiveIdx(null), []);

  // navigate — 버튼/키 모두 이 함수 통해 동일한 slide 애니메이션 거침.
  // dragX 를 ±화면폭 으로 먼저 이동시켜 visual slide 보여주고, transition
  // 끝나는 시점 (TRANSITION_MS 후) 에 activeIdx 갱신 + dragX 0 으로 reset.
  // wrapper 의 key={activeIdx} 가 remount 시켜 새 prev/current/next 위치로
  // 정렬됨. 이 시점 시각적 jump 없음 — 직전 visible 이미지 (slot 2 = next)
  // 가 새 wrapper 의 slot 1 (current) 에 같은 src 로 다시 등장.
  const navigate = useCallback(
    (dir: -1 | 1) => {
      if (isAnimatingRef.current || activeIdx === null) return;
      isAnimatingRef.current = true;
      const sw = window.innerWidth;
      setDragX(dir > 0 ? -sw : sw);
      setTimeout(() => {
        setActiveIdx((i) => (i === null ? null : (i + dir + total) % total));
        setDragX(0);
        isAnimatingRef.current = false;
      }, TRANSITION_MS);
    },
    [activeIdx, total],
  );

  const prev = useCallback(() => navigate(-1), [navigate]);
  const next = useCallback(() => navigate(1), [navigate]);

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
    if (isAnimatingRef.current) return;
    touchStartXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || isAnimatingRef.current) return;
    const delta = e.touches[0].clientX - touchStartXRef.current;
    setDragX(delta);
  };
  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || isAnimatingRef.current) return;
    const sw = window.innerWidth;
    const threshold = sw * SWIPE_THRESHOLD_RATIO;
    const finalDragX = dragX;
    setIsDragging(false);
    touchStartXRef.current = null;

    if (finalDragX < -threshold) {
      isAnimatingRef.current = true;
      setDragX(-sw);
      setTimeout(() => {
        setActiveIdx((i) => (i === null ? null : (i + 1) % total));
        setDragX(0);
        isAnimatingRef.current = false;
      }, TRANSITION_MS);
    } else if (finalDragX > threshold) {
      isAnimatingRef.current = true;
      setDragX(sw);
      setTimeout(() => {
        setActiveIdx((i) => (i === null ? null : (i - 1 + total) % total));
        setDragX(0);
        isAnimatingRef.current = false;
      }, TRANSITION_MS);
    } else {
      setDragX(0);
    }
  };

  const prevImage =
    activeIdx !== null ? gallery[(activeIdx - 1 + total) % total] : null;
  const currentImage = activeIdx !== null ? gallery[activeIdx] : null;
  const nextImage =
    activeIdx !== null ? gallery[(activeIdx + 1) % total] : null;

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
        {currentImage && activeIdx !== null && prevImage && nextImage && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`사진 ${activeIdx + 1}/${total}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              aria-label="갤러리 닫기"
              className="absolute top-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
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
              className="absolute top-1/2 left-2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20 sm:left-6"
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
              className="absolute top-1/2 right-2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20 sm:right-6"
            >
              ›
            </button>

            <div
              className="absolute inset-0 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                key={activeIdx}
                className="relative h-full w-full"
                style={{
                  transform: `translateX(${dragX}px)`,
                  transition: isDragging
                    ? "none"
                    : `transform ${TRANSITION_MS}ms ease-out`,
                }}
              >
                {/* prev — left of viewport (right-full = right edge at 0%) */}
                <div className="absolute inset-y-0 right-full w-full">
                  <div className="relative h-[100dvh] w-full">
                    <Image
                      src={prevImage.src}
                      alt={prevImage.alt}
                      fill
                      sizes="100vw"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </div>
                {/* current */}
                <div className="absolute inset-0">
                  <div className="relative h-[100dvh] w-full">
                    <Image
                      src={currentImage.src}
                      alt={currentImage.alt}
                      fill
                      sizes="100vw"
                      priority
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </div>
                {/* next — right of viewport */}
                <div className="absolute inset-y-0 left-full w-full">
                  <div className="relative h-[100dvh] w-full">
                    <Image
                      src={nextImage.src}
                      alt={nextImage.alt}
                      fill
                      sizes="100vw"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <p className="pointer-events-none absolute bottom-6 left-1/2 z-20 -translate-x-1/2 text-sm tracking-wider text-white/80">
              {activeIdx + 1} / {total}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

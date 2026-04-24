"use client";

import Script from "next/script";
import { useState } from "react";

import { config } from "@/invitation.config";
import { copyText } from "@/lib/clipboard";
import { initKakao, shareInvitation } from "@/lib/kakao";

export function Share() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleShare = async () => {
    try {
      shareInvitation({
        title: config.share.title,
        description: config.share.description,
        thumbnailUrl: config.share.thumbnailUrl,
        siteUrl: config.meta.siteUrl,
        buttons: config.share.buttons,
        venue: { name: config.venue.name, coords: config.venue.coords },
      });
    } catch {
      const ok = await copyText(config.meta.siteUrl);
      showToast(ok ? "링크가 복사되었습니다" : "공유에 실패했습니다");
    }
  };

  return (
    <>
      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.8.1/kakao.min.js"
        integrity="sha384-OL+ylM/iuPLtW5U3XcvLSGhE8JzReKDank5InqlHGWPhb4140/yrBw0bg0y7+C9J"
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={initKakao}
      />
      <section className="flex flex-col items-center px-6 py-24">
        <div className="animate-fade-in-up flex flex-col items-center text-center">
          <p className="text-secondary font-serif text-sm tracking-[0.3em] uppercase">
            Share
          </p>
          <button
            type="button"
            onClick={handleShare}
            className="border-secondary text-secondary hover:bg-secondary mt-8 inline-block rounded-sm border px-6 py-3 text-sm tracking-wider transition-colors hover:text-white"
          >
            카카오톡으로 공유하기
          </button>
        </div>
      </section>
      {toast && (
        <div
          role="status"
          className="bg-text fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full px-5 py-3 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </>
  );
}

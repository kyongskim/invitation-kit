"use client";

import { useState } from "react";

import { useIsClient } from "@/lib/hooks";
import { isInAppBrowser } from "@/lib/userAgent";

const STORAGE_KEY = "inapp-notice-dismissed";

function readDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function InAppBrowserNotice() {
  const isClient = useIsClient();
  const [dismissed, setDismissed] = useState<boolean>(readDismissed);

  if (!isClient) return null;
  if (dismissed) return null;
  if (!isInAppBrowser(navigator.userAgent)) return null;

  const handleDismiss = () => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private 모드 등 storage quota 0 — 무시, 메모리 상 dismiss 만 반영 */
    }
    setDismissed(true);
  };

  return (
    <div
      role="status"
      className="bg-text sticky top-0 z-40 flex items-center gap-3 px-4 py-3 text-sm text-white"
    >
      <p className="flex-1 leading-relaxed">
        카톡 안에서 보고 계신가요? 공유가 원활하지 않을 수 있어요.{" "}
        <strong className="font-medium">외부 브라우저(사파리·크롬)</strong>로
        열어주세요.
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="안내 닫기"
        className="shrink-0 rounded-full px-2 py-1 text-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        ×
      </button>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

import { config } from "@/invitation.config";
import { useIsClient } from "@/lib/hooks";

const CEREMONY_DURATION_MS = 90 * 60 * 1000;

/**
 * 결혼식까지 남은 시간을 일/시/분/초 4-박스 grid 로 1초마다 갱신.
 * 한국 청첩장 SaaS 의 표준 카운트다운 패턴 — `border-accent` 박스
 * 안에 큰 숫자 + 작은 단위 라벨.
 *
 * 결혼식 진행 중 (시작 ~ +90분) 은 "진행 중" 문구로 분기, 종료 후엔
 * badge 자체 hide.
 *
 * useState lazy init + setInterval 로 SSR-safe (server 0 / client
 * Date.now()), useIsClient 가드로 hydration mismatch 차단.
 */
export function DDayBadge() {
  const isClient = useIsClient();
  const [now, setNow] = useState<number>(() =>
    typeof window !== "undefined" ? Date.now() : 0,
  );

  useEffect(() => {
    if (!isClient) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [isClient]);

  if (!isClient || now === 0) return null;

  const target = new Date(config.date).getTime();
  const remaining = target - now;
  const elapsedAfterStart = -remaining;

  if (elapsedAfterStart > CEREMONY_DURATION_MS) return null;

  if (remaining <= 0 && elapsedAfterStart <= CEREMONY_DURATION_MS) {
    return (
      <div className="animate-fade-in-up mt-10 flex flex-col items-center gap-2">
        <span className="text-secondary font-serif text-2xl tracking-[0.2em]">
          진행 중
        </span>
        <span className="text-secondary text-sm">
          저희 결혼식이 진행 중이에요
        </span>
      </div>
    );
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor(totalSeconds / 3_600) % 24;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const seconds = totalSeconds % 60;

  return (
    <div className="animate-fade-in-up mt-10 grid grid-cols-4 gap-3">
      <CountBox n={String(days)} unit="일" />
      <CountBox n={pad(hours)} unit="시" />
      <CountBox n={pad(minutes)} unit="분" />
      <CountBox n={pad(seconds)} unit="초" />
    </div>
  );
}

function CountBox({ n, unit }: { n: string; unit: string }) {
  return (
    <div className="border-accent flex min-w-[60px] flex-col items-center justify-center rounded-sm border px-3 py-3">
      <span className="text-text font-serif text-3xl font-light tabular-nums">
        {n}
      </span>
      <span className="text-secondary mt-1 text-xs tracking-wider">{unit}</span>
    </div>
  );
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

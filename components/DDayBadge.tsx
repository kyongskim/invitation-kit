"use client";

import { useEffect, useState } from "react";

import { config } from "@/invitation.config";
import { useIsClient } from "@/lib/hooks";

const CEREMONY_DURATION_MS = 90 * 60 * 1000;

/**
 * 결혼식까지 남은 시간을 일·시·분·초로 1초마다 갱신.
 *
 * `useSyncExternalStore` 시계 패턴은 production 빌드에서 hydration
 * transition 후 client snapshot 반영이 일관되지 않은 사례 발견 — 단순한
 * `useState` 라지 init + setInterval 로 전환. lazy init 으로 client 첫
 * 렌더부터 정상 시각 반환, useIsClient 가드로 SSR 단계 hydration mismatch
 * 차단. setInterval 의 setState 는 callback 내부 비동기라 React 19
 * `react-hooks/set-state-in-effect` 룰과 무관.
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

  // 결혼식 종료 후 (시작 + 90분 이상 지남) — badge 자체 숨김
  if (elapsedAfterStart > CEREMONY_DURATION_MS) return null;

  // 결혼식 진행 중 — 카운트다운 대신 안내
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

  const badge = days === 0 ? "D-DAY" : `D-${days}`;
  const countdown = `${days}일 ${pad(hours)}시간 ${pad(minutes)}분 ${pad(seconds)}초`;

  return (
    <div className="animate-fade-in-up mt-10 flex flex-col items-center gap-2">
      <span className="text-secondary font-serif text-2xl tracking-[0.2em]">
        {badge}
      </span>
      <span className="text-secondary text-sm tabular-nums">{countdown}</span>
    </div>
  );
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

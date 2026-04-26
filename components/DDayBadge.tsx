"use client";

import { config } from "@/invitation.config";
import { useIsClient, useNow } from "@/lib/hooks";

const CEREMONY_DURATION_MS = 90 * 60 * 1000;

export function DDayBadge() {
  const isClient = useIsClient();
  const now = useNow();
  // now === 0 은 hydration 직후 subscribe 완료 전 sentinel — useNow 의
  // SSR snapshot 이 0 이라 잘못된 값으로 잠시 render 되는 것 방지.
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

  // 자정 기준 일수 (1일=24시간 단위 floor) — daysUntil 의 자정 비교와 다름.
  // 카운트다운은 절대 시각 차이라 시·분·초가 필요해 직접 계산.
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

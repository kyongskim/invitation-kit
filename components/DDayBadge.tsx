"use client";

import { useEffect, useState } from "react";

import { config } from "@/invitation.config";
import { daysUntil } from "@/lib/date";

export function DDayBadge() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    setDays(daysUntil(config.date));
  }, []);

  if (days === null || days < 0) return null;

  const label =
    days === 0 ? "오늘은 저희의 결혼식이에요" : `결혼식까지 ${days}일 남았어요`;
  const badge = days === 0 ? "D-DAY" : `D-${days}`;

  return (
    <div className="animate-fade-in-up mt-10 flex flex-col items-center gap-2">
      <span className="text-secondary font-serif text-2xl tracking-[0.2em]">
        {badge}
      </span>
      <span className="text-secondary text-sm">{label}</span>
    </div>
  );
}

"use client";

import type { FetchStatus, GuestbookEntry } from "../Guestbook";

type Props = {
  entries: GuestbookEntry[];
  status: FetchStatus;
  onRetry: () => void;
  onEditRequest: (entry: GuestbookEntry) => void;
  onDeleteRequest: (entry: GuestbookEntry) => void;
};

function formatRelative(d: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - d.getTime();
  const sec = Math.max(0, Math.floor(diffMs / 1000));
  if (sec < 60) return "방금 전";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day === 1) return "어제";
  if (day < 7) return `${day}일 전`;
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}`;
}

export function GuestbookList({
  entries,
  status,
  onRetry,
  onEditRequest,
  onDeleteRequest,
}: Props) {
  return (
    <div className="mt-10 flex flex-col gap-3">
      {status === "loading" && (
        <p className="text-secondary text-center text-sm">불러오는 중...</p>
      )}
      {status === "error" && (
        <div className="text-center">
          <p className="text-secondary text-sm">메시지를 불러오지 못했어요.</p>
          <button
            type="button"
            onClick={onRetry}
            className="text-primary mt-2 text-sm underline underline-offset-4"
          >
            다시 시도
          </button>
        </div>
      )}
      {status === "ready" && entries.length === 0 && (
        <p className="text-secondary text-center text-sm">
          첫 메시지를 남겨주세요
        </p>
      )}
      {status === "ready" &&
        entries.map((entry) => (
          <article
            key={entry.id}
            className="border-accent rounded-md border p-5 text-left"
          >
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-text font-serif text-base">
                {entry.name}
              </span>
              <span className="text-secondary text-xs">
                {formatRelative(entry.createdAt)}
              </span>
            </div>
            <p className="text-text mt-2 text-sm leading-relaxed whitespace-pre-line">
              {entry.message}
            </p>
            <div className="mt-3 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => onEditRequest(entry)}
                aria-label={`${entry.name} 님의 메시지 수정`}
                className="text-secondary hover:text-text text-xs underline underline-offset-4 transition-colors"
              >
                수정
              </button>
              <button
                type="button"
                onClick={() => onDeleteRequest(entry)}
                aria-label={`${entry.name} 님의 메시지 삭제`}
                className="text-secondary hover:text-text text-xs underline underline-offset-4 transition-colors"
              >
                삭제
              </button>
            </div>
          </article>
        ))}
    </div>
  );
}

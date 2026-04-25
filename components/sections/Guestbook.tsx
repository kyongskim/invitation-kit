"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { config } from "@/invitation.config";
import { db } from "@/lib/firebase";
import { hashPassword } from "@/lib/hash";
import { useIsClient } from "@/lib/hooks";
import { containsProfanity } from "@/lib/profanity";

type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  createdAt: Date;
};

type FetchStatus = "loading" | "ready" | "error";

type FormErrors = Partial<{
  name: string;
  message: string;
  password: string;
  submit: string;
}>;

const COLLECTION = "guestbook";
const FETCH_LIMIT = 200;

function toEntry(doc: QueryDocumentSnapshot): GuestbookEntry {
  const data = doc.data();
  const ts = data.createdAt as Timestamp | null;
  return {
    id: doc.id,
    name: typeof data.name === "string" ? data.name : "",
    message: typeof data.message === "string" ? data.message : "",
    createdAt: ts ? ts.toDate() : new Date(),
  };
}

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

export function Guestbook() {
  const isClient = useIsClient();
  const minPasswordLength = config.guestbook.minPasswordLength ?? 4;
  const profanityFilterOn = config.guestbook.profanityFilter !== false;

  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [toast, setToast] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  const nameId = useId();
  const messageId = useId();
  const passwordId = useId();

  useEffect(() => {
    if (!isClient) return;
    let cancelled = false;
    getDocs(
      query(
        collection(db, COLLECTION),
        orderBy("createdAt", "desc"),
        limit(FETCH_LIMIT),
      ),
    )
      .then((snap) => {
        if (cancelled) return;
        setEntries(snap.docs.map(toEntry));
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("[guestbook] fetch failed", err);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [isClient, fetchTrigger]);

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors: FormErrors = {};
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 1 || trimmedName.length > 20) {
      nextErrors.name = "이름은 1~20자로 입력해주세요";
    }
    if (trimmedMessage.length < 1 || trimmedMessage.length > 500) {
      nextErrors.message = "메시지는 1~500자로 입력해주세요";
    } else if (profanityFilterOn && containsProfanity(trimmedMessage)) {
      nextErrors.message = "부적절한 표현이 포함되어 있어요";
    }
    if (password.length < minPasswordLength) {
      nextErrors.password = `비밀번호는 ${minPasswordLength}자 이상이어야 해요`;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const passwordHash = await hashPassword(password);
      const ref = await addDoc(collection(db, COLLECTION), {
        name: trimmedName,
        message: trimmedMessage,
        passwordHash,
        createdAt: serverTimestamp(),
      });
      setEntries((prev) => [
        {
          id: ref.id,
          name: trimmedName,
          message: trimmedMessage,
          createdAt: new Date(),
        },
        ...prev,
      ]);
      setName("");
      setMessage("");
      setPassword("");
      showToast("메시지가 등록되었습니다");
    } catch (err) {
      console.error("[guestbook] submit failed", err);
      setErrors({ submit: "등록에 실패했어요. 잠시 후 다시 시도해주세요" });
    } finally {
      setSubmitting(false);
    }
  };

  const retryFetch = () => {
    setStatus("loading");
    setFetchTrigger((n) => n + 1);
  };

  return (
    <>
      <section className="flex flex-col items-center px-6 py-24">
        <div className="animate-fade-in-up flex w-full max-w-md flex-col">
          <div className="flex flex-col items-center text-center">
            <p className="text-secondary font-serif text-sm tracking-[0.3em] uppercase">
              Guestbook
            </p>
            <h2 className="text-primary mt-6 font-serif text-3xl font-light">
              방명록
            </h2>
            <p className="text-secondary mt-4 text-sm leading-relaxed">
              따뜻한 한 마디를 남겨주세요
            </p>
            {status === "ready" && entries.length > 0 && (
              <p className="text-secondary mt-2 text-xs tracking-wider">
                총 {entries.length}개의 메시지
              </p>
            )}
          </div>

          <div className="mt-10 flex flex-col gap-3">
            {status === "loading" && (
              <p className="text-secondary text-center text-sm">
                불러오는 중...
              </p>
            )}
            {status === "error" && (
              <div className="text-center">
                <p className="text-secondary text-sm">
                  메시지를 불러오지 못했어요.
                </p>
                <button
                  type="button"
                  onClick={retryFetch}
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
                </article>
              ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-10 flex flex-col gap-4 text-left"
            noValidate
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={nameId}
                className="text-secondary text-xs tracking-wider"
              >
                이름
              </label>
              <input
                id={nameId}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={20}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? `${nameId}-err` : undefined}
                disabled={submitting}
                className="border-accent text-text focus:border-secondary rounded-sm border bg-transparent px-3 py-2.5 text-sm focus:outline-none disabled:opacity-50"
              />
              {errors.name && (
                <p id={`${nameId}-err`} className="text-xs text-red-600">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={messageId}
                className="text-secondary text-xs tracking-wider"
              >
                메시지
              </label>
              <textarea
                id={messageId}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={4}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={
                  errors.message ? `${messageId}-err` : undefined
                }
                disabled={submitting}
                className="border-accent text-text focus:border-secondary rounded-sm border bg-transparent px-3 py-2.5 text-sm leading-relaxed focus:outline-none disabled:opacity-50"
              />
              <div className="flex items-center justify-between">
                {errors.message ? (
                  <p id={`${messageId}-err`} className="text-xs text-red-600">
                    {errors.message}
                  </p>
                ) : (
                  <span />
                )}
                <span className="text-secondary text-xs tabular-nums">
                  {message.length}/500
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={passwordId}
                className="text-secondary text-xs tracking-wider"
              >
                비밀번호 ({minPasswordLength}자 이상)
              </label>
              <input
                id={passwordId}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={64}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? `${passwordId}-err` : undefined
                }
                disabled={submitting}
                className="border-accent text-text focus:border-secondary rounded-sm border bg-transparent px-3 py-2.5 text-sm focus:outline-none disabled:opacity-50"
              />
              {errors.password && (
                <p id={`${passwordId}-err`} className="text-xs text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            {errors.submit && (
              <p
                role="alert"
                className="border-accent rounded-sm border bg-red-50 px-3 py-2 text-xs text-red-600"
              >
                {errors.submit}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="border-secondary text-secondary hover:bg-secondary disabled:hover:text-secondary mt-2 rounded-sm border px-6 py-3 text-sm tracking-wider transition-colors hover:text-white disabled:opacity-50 disabled:hover:bg-transparent"
            >
              {submitting ? "등록 중..." : "메시지 남기기"}
            </button>
          </form>
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

"use client";

import { useEffect, useState } from "react";
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

import {
  GuestbookForm,
  type GuestbookSubmitInput,
} from "./guestbook/GuestbookForm";
import { GuestbookList } from "./guestbook/GuestbookList";

export type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  createdAt: Date;
};

export type FetchStatus = "loading" | "ready" | "error";

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

export function Guestbook() {
  const isClient = useIsClient();
  const minPasswordLength = config.guestbook.minPasswordLength ?? 4;
  const profanityFilterOn = config.guestbook.profanityFilter !== false;

  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [toast, setToast] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);

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

  const handleSubmit = async (input: GuestbookSubmitInput) => {
    const passwordHash = await hashPassword(input.password);
    const ref = await addDoc(collection(db, COLLECTION), {
      name: input.name,
      message: input.message,
      passwordHash,
      createdAt: serverTimestamp(),
    });
    setEntries((prev) => [
      {
        id: ref.id,
        name: input.name,
        message: input.message,
        createdAt: new Date(),
      },
      ...prev,
    ]);
    showToast("메시지가 등록되었습니다");
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

          <GuestbookList
            entries={entries}
            status={status}
            onRetry={retryFetch}
          />

          <GuestbookForm
            minPasswordLength={minPasswordLength}
            profanityFilterOn={profanityFilterOn}
            onSubmit={handleSubmit}
          />
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

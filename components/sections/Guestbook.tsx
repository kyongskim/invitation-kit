"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import type { GuestbookConfig } from "@/invitation.config";
import { db } from "@/lib/firebase";
import { hashPassword, verifyPassword } from "@/lib/hash";
import { useIsClient } from "@/lib/hooks";

import { DeleteConfirmModal } from "./guestbook/DeleteConfirmModal";
import { EditConfirmModal } from "./guestbook/EditConfirmModal";
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

export function Guestbook({ guestbook }: { guestbook: GuestbookConfig }) {
  const isClient = useIsClient();
  const minPasswordLength = guestbook.minPasswordLength ?? 4;
  const profanityFilterOn = guestbook.profanityFilter !== false;

  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [toast, setToast] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [editingEntry, setEditingEntry] = useState<GuestbookEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<GuestbookEntry | null>(
    null,
  );

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

  // 비밀번호 검증 + 수정. 실패 시 throw — 모달이 inline 에러로 표시.
  // ADR 007 C' 경로의 update 확장 — 같은 도메인 적정 트레이드오프
  // (DevTools 우회 가능). passwordHash · createdAt 은 firestore.rules
  // 에서 잠금돼 server 측에서도 변경 차단.
  const handleEdit = async (
    entry: GuestbookEntry,
    password: string,
    newName: string,
    newMessage: string,
  ) => {
    const ref = doc(db, COLLECTION, entry.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
      setEditingEntry(null);
      showToast("이미 삭제된 메시지입니다");
      return;
    }
    const hash = snap.data().passwordHash as string | undefined;
    if (!hash || hash.length !== 60) {
      throw new Error("invalid_hash");
    }
    const ok = await verifyPassword(password, hash);
    if (!ok) {
      throw new Error("password_mismatch");
    }
    await updateDoc(ref, { name: newName, message: newMessage });
    setEntries((prev) =>
      prev.map((e) =>
        e.id === entry.id ? { ...e, name: newName, message: newMessage } : e,
      ),
    );
    setEditingEntry(null);
    showToast("메시지가 수정되었습니다");
  };

  // 비밀번호 검증 + 삭제. 실패 시 throw — 모달이 inline 에러로 표시.
  // 보안 모델은 docs/adr/007 의 C' 경로 (도메인 적정 트레이드오프).
  const handleDelete = async (entry: GuestbookEntry, password: string) => {
    const ref = doc(db, COLLECTION, entry.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      // 다른 사용자가 먼저 삭제. 로컬 entries 에서 제거하고 모달 닫기.
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
      setDeletingEntry(null);
      showToast("이미 삭제된 메시지입니다");
      return;
    }
    const hash = snap.data().passwordHash as string | undefined;
    if (!hash || hash.length !== 60) {
      throw new Error("invalid_hash");
    }
    const ok = await verifyPassword(password, hash);
    if (!ok) {
      throw new Error("password_mismatch");
    }
    await deleteDoc(ref);
    setEntries((prev) => prev.filter((e) => e.id !== entry.id));
    setDeletingEntry(null);
    showToast("메시지가 삭제되었습니다");
  };

  const retryFetch = () => {
    setStatus("loading");
    setFetchTrigger((n) => n + 1);
  };

  return (
    <>
      <section className="bg-background-alt flex flex-col items-center px-6 py-24">
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
            onEditRequest={setEditingEntry}
            onDeleteRequest={setDeletingEntry}
          />

          <GuestbookForm
            minPasswordLength={minPasswordLength}
            profanityFilterOn={profanityFilterOn}
            onSubmit={handleSubmit}
          />

          <p className="text-secondary mt-6 text-center text-xs leading-relaxed">
            비밀번호 분실 시 신랑·신부에게 문의해주세요
          </p>
        </div>
      </section>

      <AnimatePresence>
        {editingEntry && (
          <EditConfirmModal
            entry={editingEntry}
            onConfirm={handleEdit}
            onCancel={() => setEditingEntry(null)}
          />
        )}
        {deletingEntry && (
          <DeleteConfirmModal
            entry={deletingEntry}
            onConfirm={handleDelete}
            onCancel={() => setDeletingEntry(null)}
          />
        )}
      </AnimatePresence>

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

"use client";

import { useId, useState } from "react";

import { config } from "@/invitation.config";
import { copyText } from "@/lib/clipboard";

type Side = "groom" | "bride";

export function Accounts() {
  const [expanded, setExpanded] = useState(false);
  const [side, setSide] = useState<Side>("groom");
  const [toast, setToast] = useState<string | null>(null);
  const panelId = useId();

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleCopy = async (number: string) => {
    const digits = number.replace(/-/g, "");
    const ok = await copyText(digits);
    if (ok) showToast("계좌번호가 복사되었습니다");
    else showToast("복사에 실패했어요. 번호를 길게 눌러 복사해주세요");
  };

  const list =
    side === "groom" ? config.accounts.groomSide : config.accounts.brideSide;

  return (
    <>
      <section className="bg-background-alt flex flex-col items-center px-6 py-24">
        <div className="animate-fade-in-up flex w-full max-w-md flex-col items-center text-center">
          <p className="text-secondary font-serif text-sm tracking-[0.3em] uppercase">
            Accounts
          </p>
          <h2 className="text-primary mt-6 font-serif text-3xl font-light">
            마음 전하실 곳
          </h2>
          <p className="text-secondary mt-4 text-sm leading-relaxed">
            참석이 어려우신 분들을 위해 계좌번호를 안내드립니다.
          </p>

          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={() => setExpanded((v) => !v)}
            className="border-secondary text-secondary hover:bg-secondary mt-8 inline-block rounded-sm border px-6 py-3 text-sm tracking-wider transition-colors hover:text-white"
          >
            {expanded ? "접기" : "계좌번호 보기"}
          </button>

          <div
            id={panelId}
            className="grid w-full transition-[grid-template-rows] duration-300 ease-out"
            style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
          >
            <div className="min-h-0 overflow-hidden">
              <div
                role="radiogroup"
                aria-label="계좌 구분"
                className="border-accent mt-8 inline-flex rounded-sm border p-1"
              >
                {(["groom", "bride"] as const).map((s) => {
                  const label = s === "groom" ? "신랑측" : "신부측";
                  const selected = side === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => setSide(s)}
                      className={
                        selected
                          ? "bg-secondary rounded-sm px-5 py-2 text-sm tracking-wider text-white transition-colors"
                          : "text-secondary rounded-sm px-5 py-2 text-sm tracking-wider transition-colors"
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <ul className="mt-6 flex flex-col gap-3">
                {list.map((account, idx) => (
                  <li key={`${account.label}-${idx}`}>
                    <article className="border-accent rounded-md border p-5 text-left">
                      <div className="flex items-baseline justify-between gap-4">
                        <div>
                          <p className="text-secondary text-xs tracking-wider">
                            {account.label}
                          </p>
                          <p className="text-text mt-1 font-serif text-base">
                            {account.bank}{" "}
                            <span className="text-secondary text-sm">
                              · {account.holder}
                            </span>
                          </p>
                          <p className="text-text mt-2 text-sm tabular-nums">
                            {account.number}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(account.number)}
                          className="border-secondary text-secondary hover:bg-secondary shrink-0 rounded-sm border px-4 py-2 text-xs tracking-wider transition-colors hover:text-white"
                        >
                          복사
                        </button>
                      </div>
                      {(account.kakaoPayUrl || account.tossUrl) && (
                        <div className="mt-4 flex gap-2">
                          {account.kakaoPayUrl && (
                            <a
                              href={account.kakaoPayUrl}
                              className="border-accent text-secondary hover:bg-accent inline-flex rounded-sm border px-3 py-1.5 text-xs tracking-wider transition-colors"
                            >
                              카카오페이
                            </a>
                          )}
                          {account.tossUrl && (
                            <a
                              href={account.tossUrl}
                              className="border-accent text-secondary hover:bg-accent inline-flex rounded-sm border px-3 py-1.5 text-xs tracking-wider transition-colors"
                            >
                              토스
                            </a>
                          )}
                        </div>
                      )}
                    </article>
                  </li>
                ))}
              </ul>
            </div>
          </div>
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

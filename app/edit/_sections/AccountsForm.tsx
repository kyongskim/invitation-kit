"use client";

import type { Account } from "@/invitation.config";
import { Field } from "@/lib/editor/Field";
import { useEditorStore } from "@/lib/editor/store";

/**
 * 양가 계좌 동적 add/remove. 본 호흡에 처음 도입되는 array 편집 패턴.
 * 후속 Gallery (image array) 도 같은 updateSide / addItem / removeItem 골격
 * 재사용 예정.
 *
 * key={idx}: 재정렬 UI 미지원 + 단순 append/remove 도메인이라 acceptable.
 * 중간 삭제 시 focus shift 가능하지만 v2.0 범위 밖.
 */
const EMPTY_ACCOUNT: Account = {
  label: "",
  bank: "",
  number: "",
  holder: "",
};

const SIDES = [
  { key: "groomSide", label: "신랑측" },
  { key: "brideSide", label: "신부측" },
] as const;

type Side = (typeof SIDES)[number]["key"];

export function AccountsForm() {
  const accounts = useEditorStore((s) => s.config.accounts);
  const setField = useEditorStore((s) => s.setField);

  function updateSide(side: Side, next: Account[]) {
    setField("accounts", { ...accounts, [side]: next });
  }

  function addAccount(side: Side) {
    updateSide(side, [...accounts[side], EMPTY_ACCOUNT]);
  }

  function removeAccount(side: Side, idx: number) {
    updateSide(
      side,
      accounts[side].filter((_, i) => i !== idx),
    );
  }

  function updateAccount(side: Side, idx: number, next: Account) {
    updateSide(
      side,
      accounts[side].map((a, i) => (i === idx ? next : a)),
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-primary font-serif text-lg">축의금 계좌</h2>

      {SIDES.map(({ key: side, label: sideLabel }) => (
        <div key={side} className="flex flex-col gap-4">
          <h3 className="text-secondary text-xs tracking-wider uppercase">
            {sideLabel}
          </h3>

          {accounts[side].map((account, idx) => (
            <div
              key={idx}
              className="border-secondary/20 flex flex-col gap-3 rounded-sm border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-text text-sm">
                  {account.label || `계좌 ${idx + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => removeAccount(side, idx)}
                  className="text-secondary hover:text-primary text-xs underline-offset-2 hover:underline"
                >
                  삭제
                </button>
              </div>

              <Field
                label="레이블"
                value={account.label}
                onChange={(v) =>
                  updateAccount(side, idx, { ...account, label: v })
                }
                placeholder="신랑 / 신랑 아버지 / 신부 어머니"
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="은행"
                  value={account.bank}
                  onChange={(v) =>
                    updateAccount(side, idx, { ...account, bank: v })
                  }
                />
                <Field
                  label="예금주"
                  value={account.holder}
                  onChange={(v) =>
                    updateAccount(side, idx, { ...account, holder: v })
                  }
                />
              </div>
              <Field
                label="계좌번호"
                value={account.number}
                onChange={(v) =>
                  updateAccount(side, idx, { ...account, number: v })
                }
              />
              <Field
                label="카카오페이 링크 (선택)"
                type="url"
                value={account.kakaoPayUrl ?? ""}
                onChange={(v) =>
                  updateAccount(side, idx, {
                    ...account,
                    kakaoPayUrl: v || undefined,
                  })
                }
                placeholder="https://qr.kakaopay.com/..."
              />
              <Field
                label="토스 링크 (선택)"
                type="url"
                value={account.tossUrl ?? ""}
                onChange={(v) =>
                  updateAccount(side, idx, {
                    ...account,
                    tossUrl: v || undefined,
                  })
                }
                placeholder="https://toss.me/..."
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => addAccount(side)}
            className="border-accent text-secondary hover:text-primary hover:border-primary rounded-sm border border-dashed py-2 text-xs tracking-wider uppercase transition-colors"
          >
            + {sideLabel} 계좌 추가
          </button>
        </div>
      ))}
    </section>
  );
}

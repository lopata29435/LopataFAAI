"use client";

import { useState } from "react";
import { formatMinor } from "@/lib/money";
import { EditTxModal, type EditableTx } from "./EditTxModal";

type Account = { id: string; name: string; currency: string };
type Category = { id: string; name: string; icon: string | null; kind: string };

export function TxList({
  rows,
  accounts,
  categories,
}: {
  rows: EditableTx[];
  accounts: Account[];
  categories: Category[];
}) {
  const [editing, setEditing] = useState<EditableTx | null>(null);

  if (rows.length === 0) {
    return <div className="muted small">Записей пока нет — добавь первую сверху.</div>;
  }

  return (
    <>
      <div className="list">
        {rows.map((t) => {
          const isTransfer = t.type === "transfer";
          const title = isTransfer
            ? `🔄 ${t.accountName ?? "—"} → ${t.counterAccountName ?? "—"}`
            : `${t.categoryIcon ?? "•"} ${t.categoryName ?? "Без категории"}`;
          const sign = t.type === "income" ? "+" : t.type === "expense" ? "−" : "";
          const cls = t.type === "income" ? "amount-in" : isTransfer ? "amount-transfer" : "amount-out";
          return (
            <button type="button" className="list-item as-button" key={t.id} onClick={() => setEditing(t)}>
              <div>
                <div>{title}</div>
                <div className="muted small">
                  {new Date(t.datetime).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                  {!isTransfer && t.accountName ? ` · ${t.accountName}` : ""}
                  {t.note ? ` · ${t.note}` : ""}
                </div>
              </div>
              <div className={cls}>{sign + formatMinor(t.amountMinor, t.currency)}</div>
            </button>
          );
        })}
      </div>
      {editing && (
        <EditTxModal
          tx={editing}
          accounts={accounts}
          categories={categories}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

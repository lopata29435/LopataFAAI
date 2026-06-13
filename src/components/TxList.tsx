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
    return <div className="muted" style={{ fontSize: 13, padding: "8px 6px" }}>Записей пока нет — нажми + внизу.</div>;
  }

  return (
    <>
      {rows.map((t) => {
        const isTransfer = t.type === "transfer";
        const icon = isTransfer ? "🔄" : t.categoryIcon ?? "•";
        const label = isTransfer ? "Перевод" : t.categoryName ?? "Без категории";
        const sub = isTransfer
          ? `${t.accountName ?? "—"} → ${t.counterAccountName ?? "—"}`
          : [t.accountName, t.note].filter(Boolean).join(" · ");
        const sign = t.type === "income" ? "+" : t.type === "expense" ? "−" : "";
        const cls = t.type === "income" ? "in" : isTransfer ? "tr" : "out";
        return (
          <button type="button" className="txn" key={t.id} onClick={() => setEditing(t)}>
            <span className="ic">{icon}</span>
            <span className="body">
              <span className="label" style={{ display: "block" }}>{label}</span>
              <span className="cat" style={{ display: "block" }}>{sub || "—"}</span>
            </span>
            <span className={"amt num " + cls}>
              {sign}
              {formatMinor(t.amountMinor, t.currency)}
            </span>
          </button>
        );
      })}
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

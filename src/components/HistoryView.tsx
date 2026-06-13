"use client";

import { useMemo, useState } from "react";
import { formatMinor } from "@/lib/money";
import { EditTxModal, type EditableTx } from "./EditTxModal";

type Account = { id: string; name: string; currency: string };
type Category = { id: string; name: string; icon: string | null; kind: string };
type Filter = "all" | "expense" | "income" | "transfer";

const FILTERS: [Filter, string][] = [
  ["all", "Все"],
  ["expense", "Расход"],
  ["income", "Доход"],
  ["transfer", "Переводы"],
];

export function HistoryView({
  rows,
  accounts,
  categories,
}: {
  rows: EditableTx[];
  accounts: Account[];
  categories: Category[];
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editing, setEditing] = useState<EditableTx | null>(null);

  const groups = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const filtered = rows.filter((r) => {
      if (filter !== "all" && r.type !== filter) return false;
      if (!ql) return true;
      const hay = [r.categoryName, r.note, r.accountName, r.counterAccountName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(ql);
    });
    const m = new Map<string, EditableTx[]>();
    for (const r of filtered) {
      const k = r.datetime.slice(0, 10);
      const arr = m.get(k);
      if (arr) arr.push(r);
      else m.set(k, [r]);
    }
    return Array.from(m.values());
  }, [rows, q, filter]);

  return (
    <>
      <h1 className="page-title">История</h1>
      <input
        className="input"
        placeholder="Поиск по тратам, категориям…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="chips mt">
        {FILTERS.map(([f, l]) => (
          <button key={f} type="button" className={"cchip" + (filter === f ? " on" : "")} onClick={() => setFilter(f)}>
            <span>{l}</span>
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <div className="muted" style={{ padding: 16 }}>Ничего не найдено.</div>
      ) : (
        groups.map((items) => {
          const dayExpense = items
            .filter((i) => i.type === "expense")
            .reduce((a, i) => a + i.amountMinor, 0);
          const label = new Date(items[0].datetime).toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "long",
            weekday: "short",
          });
          return (
            <div className="card mt" key={items[0].datetime.slice(0, 10)}>
              <div className="day-head" style={{ padding: "0 0 6px" }}>
                <span className="t" style={{ textTransform: "capitalize" }}>{label}</span>
                {dayExpense > 0 && <span className="muted small">− {formatMinor(dayExpense)}</span>}
              </div>
              {items.map((t) => {
                const isT = t.type === "transfer";
                const icon = isT ? "🔄" : t.categoryIcon ?? "•";
                const title = isT ? "Перевод" : t.categoryName ?? "Без категории";
                const sub = isT
                  ? `${t.accountName ?? "—"} → ${t.counterAccountName ?? "—"}`
                  : [t.accountName, t.note].filter(Boolean).join(" · ");
                const sign = t.type === "income" ? "+" : t.type === "expense" ? "−" : "";
                const cls = t.type === "income" ? "in" : isT ? "tr" : "out";
                return (
                  <button key={t.id} type="button" className="txn" onClick={() => setEditing(t)}>
                    <span className="ic">{icon}</span>
                    <span className="body">
                      <span className="label" style={{ display: "block" }}>{title}</span>
                      <span className="cat" style={{ display: "block" }}>{sub || "—"}</span>
                    </span>
                    <span className={"amt num " + cls}>
                      {sign}
                      {formatMinor(t.amountMinor, t.currency)}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })
      )}

      {editing && (
        <EditTxModal tx={editing} accounts={accounts} categories={categories} onClose={() => setEditing(null)} />
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatMinor, parseAmountToMinor } from "@/lib/money";
import type { BudgetRow } from "@/lib/budgets";

type Cat = { id: string; name: string; icon: string | null; kind: string };

function BudgetModal({ budget, categories, onClose }: { budget: BudgetRow | "new"; categories: Cat[]; onClose: () => void }) {
  const router = useRouter();
  const isNew = budget === "new";
  const b = isNew ? null : (budget as BudgetRow);
  const [categoryId, setCategoryId] = useState<string>(b?.categoryId ?? "");
  const [limit, setLimit] = useState(b ? (b.limitMinor / 100).toString().replace(".", ",") : "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    const m = parseAmountToMinor(limit);
    if (!m || m <= 0) return setMsg("Укажи лимит");
    setBusy(true);
    setMsg(null);
    const res = isNew
      ? await fetch("/api/budgets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ categoryId: categoryId || null, limitMinor: m }) })
      : await fetch(`/api/budgets/${b!.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ limitMinor: m }) });
    if (res.ok) {
      onClose();
      router.refresh();
    } else {
      setBusy(false);
      setMsg("Ошибка");
    }
  }
  async function del() {
    if (!b || !confirm("Удалить лимит?")) return;
    setBusy(true);
    const res = await fetch(`/api/budgets/${b.id}`, { method: "DELETE" });
    if (res.ok) {
      onClose();
      router.refresh();
    } else setBusy(false);
  }

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        <div className="sheet-head">
          <div className="t">{isNew ? "Новый лимит" : "Лимит"}</div>
          <button type="button" className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: "0 14px 16px" }}>
          {isNew ? (
            <div className="field">
              <label>Категория</label>
              <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Общий лимит (все расходы)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{(c.icon ? c.icon + " " : "") + c.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="field"><label>Категория</label><div className="input" style={{ opacity: 0.7 }}>{(b!.categoryIcon ? b!.categoryIcon + " " : "") + b!.categoryName}</div></div>
          )}
          <div className="field"><label>Лимит в месяц, ₽</label><input className="input num" inputMode="decimal" value={limit} onChange={(e) => setLimit(e.target.value)} /></div>
          {msg && <div className="msg err">{msg}</div>}
          <div className="row mt">
            <button type="button" className="btn btn-primary grow" disabled={busy} onClick={save}>{busy ? "…" : "Сохранить"}</button>
            {!isNew && <button type="button" className="btn btn-danger" disabled={busy} onClick={del}>Удалить</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BudgetsView({ budgets, categories }: { budgets: BudgetRow[]; categories: Cat[] }) {
  const [modal, setModal] = useState<BudgetRow | "new" | null>(null);
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 className="page-title">Бюджеты</h1>
        <button type="button" className="btn" style={{ padding: "8px 14px" }} onClick={() => setModal("new")}>+ Лимит</button>
      </div>
      {budgets.length === 0 ? (
        <div className="card muted small">Нет лимитов — добавь бюджет на месяц (общий или по категории).</div>
      ) : (
        <div className="card">
          {budgets.map((b) => {
            const over = b.pct > 1;
            return (
              <button key={b.id} type="button" className="bud-row" onClick={() => setModal(b)}>
                <div className="row" style={{ justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>{(b.categoryIcon ? b.categoryIcon + " " : "") + b.categoryName}</span>
                  <span className="num small" style={{ color: over ? "var(--warm)" : "var(--text-mute)", fontWeight: over ? 600 : 400 }}>
                    {formatMinor(b.spentMinor)} / {formatMinor(b.limitMinor)}
                  </span>
                </div>
                <div className="progress" style={{ height: 6 }}>
                  <span style={{ width: `${Math.min(100, Math.round(b.pct * 100))}%`, background: over ? "var(--warm)" : "var(--accent)" }} />
                </div>
              </button>
            );
          })}
        </div>
      )}
      {modal && <BudgetModal budget={modal} categories={categories} onClose={() => setModal(null)} />}
    </>
  );
}

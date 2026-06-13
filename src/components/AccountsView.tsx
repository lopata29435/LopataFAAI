"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatMinor, parseAmountToMinor } from "@/lib/money";

type Acct = {
  id: string;
  name: string;
  type: string;
  currency: string;
  openingBalanceMinor: number;
  balanceMinor: number;
};

const TYPES: [string, string][] = [
  ["card", "Карта"],
  ["cash", "Наличные"],
  ["bank", "Счёт в банке"],
  ["deposit", "Вклад"],
  ["broker", "Брокерский"],
  ["other", "Другое"],
];
const ICONS: Record<string, string> = { cash: "💵", broker: "📈", deposit: "🏦", bank: "🏦", card: "💳", other: "•" };

function AccountModal({ acct, onClose }: { acct: Acct | "new"; onClose: () => void }) {
  const router = useRouter();
  const isNew = acct === "new";
  const a = isNew ? null : (acct as Acct);
  const [name, setName] = useState(a?.name ?? "");
  const [type, setType] = useState(a?.type ?? "card");
  const [currency, setCurrency] = useState(a?.currency ?? "RUB");
  const [opening, setOpening] = useState(a ? (a.openingBalanceMinor / 100).toString().replace(".", ",") : "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    if (!name.trim()) return setMsg("Введи название");
    setBusy(true);
    setMsg(null);
    const body = {
      name: name.trim(),
      type,
      currency: (currency.toUpperCase().slice(0, 3) || "RUB"),
      openingBalanceMinor: parseAmountToMinor(opening || "0") ?? 0,
    };
    const res = await fetch(isNew ? "/api/accounts" : `/api/accounts/${a!.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      onClose();
      router.refresh();
    } else {
      setBusy(false);
      setMsg("Ошибка сохранения");
    }
  }

  async function archive() {
    if (!a) return;
    if (!confirm("Архивировать счёт? Операции останутся, счёт скроется из списков.")) return;
    setBusy(true);
    const res = await fetch(`/api/accounts/${a.id}`, { method: "DELETE" });
    if (res.ok) {
      onClose();
      router.refresh();
    } else {
      setBusy(false);
      setMsg("Ошибка");
    }
  }

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        <div className="sheet-head">
          <div className="t">{isNew ? "Новый счёт" : "Счёт"}</div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">✕</button>
        </div>
        <div style={{ padding: "0 14px 16px" }}>
          <div className="field">
            <label>Название</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Напр. Карта Tinkoff" />
          </div>
          <div className="field">
            <label>Тип</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="row">
            <div className="field grow">
              <label>Валюта</label>
              <input className="input" value={currency} onChange={(e) => setCurrency(e.target.value)} maxLength={3} />
            </div>
            <div className="field grow">
              <label>Начальный баланс</label>
              <input className="input num" inputMode="decimal" value={opening} onChange={(e) => setOpening(e.target.value)} placeholder="0" />
            </div>
          </div>
          {msg && <div className="msg err">{msg}</div>}
          <div className="row mt">
            <button type="button" className="btn btn-primary grow" disabled={busy} onClick={save}>
              {busy ? "…" : "Сохранить"}
            </button>
            {!isNew && (
              <button type="button" className="btn btn-danger" disabled={busy} onClick={archive}>
                В архив
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AccountsView({ accounts }: { accounts: Acct[] }) {
  const [modal, setModal] = useState<Acct | "new" | null>(null);
  const total = accounts.reduce((a, x) => a + x.balanceMinor, 0);

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 className="page-title">Счета</h1>
        <button type="button" className="btn" onClick={() => setModal("new")} style={{ padding: "8px 14px" }}>
          + Счёт
        </button>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="annot">Всего на счетах</div>
        <div className="num" style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>{formatMinor(total)}</div>
      </div>

      <div className="card">
        {accounts.length === 0 ? (
          <div className="muted small">Нет счетов — добавь первый.</div>
        ) : (
          accounts.map((a) => {
            const label = TYPES.find((t) => t[0] === a.type)?.[1] ?? a.type;
            return (
              <button key={a.id} type="button" className="txn" onClick={() => setModal(a)}>
                <span className="ic">{ICONS[a.type] ?? "•"}</span>
                <span className="body">
                  <span className="label" style={{ display: "block" }}>{a.name}</span>
                  <span className="cat" style={{ display: "block" }}>{label} · {a.currency}</span>
                </span>
                <span className="amt num out">{formatMinor(a.balanceMinor, a.currency)}</span>
              </button>
            );
          })
        )}
      </div>

      {modal && <AccountModal acct={modal} onClose={() => setModal(null)} />}
    </>
  );
}

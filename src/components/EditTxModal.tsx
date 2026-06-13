"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseAmountToMinor } from "@/lib/money";

export type EditableTx = {
  id: string;
  amountMinor: number;
  currency: string;
  type: "expense" | "income" | "transfer";
  datetime: string;
  note: string | null;
  categoryId: string | null;
  accountId: string;
  counterAccountId: string | null;
  categoryName?: string | null;
  categoryIcon?: string | null;
  accountName?: string | null;
  counterAccountName?: string | null;
  scope?: "personal" | "common";
  visibility?: "normal" | "hidden";
  hiddenUntil?: string | null;
};

type Account = { id: string; name: string; currency: string };
type Category = { id: string; name: string; icon: string | null; kind: string };
type TxType = "expense" | "income" | "transfer";

export function EditTxModal({
  tx,
  accounts,
  categories,
  onClose,
}: {
  tx: EditableTx;
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState((tx.amountMinor / 100).toString().replace(".", ","));
  const [type, setType] = useState<TxType>(tx.type);
  const [accountId, setAccountId] = useState(tx.accountId);
  const [counterAccountId, setCounterAccountId] = useState(
    tx.counterAccountId ?? accounts.find((a) => a.id !== tx.accountId)?.id ?? "",
  );
  const [categoryId, setCategoryId] = useState<string | null>(tx.categoryId);
  const [date, setDate] = useState(tx.datetime.slice(0, 10));
  const [note, setNote] = useState(tx.note ?? "");
  const [scope, setScope] = useState<"personal" | "common">(tx.scope ?? "personal");
  const [hidden, setHidden] = useState(tx.visibility === "hidden");
  const [hiddenUntil, setHiddenUntil] = useState(tx.hiddenUntil ? tx.hiddenUntil.slice(0, 10) : "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const cats = categories.filter((c) => c.kind === type);

  async function save() {
    const minor = parseAmountToMinor(amount);
    if (!minor || minor <= 0) return setMsg("Укажи сумму");
    if (type === "transfer" && (!counterAccountId || counterAccountId === accountId)) {
      return setMsg("Нужен другой счёт назначения");
    }
    setBusy(true);
    setMsg(null);
    const payload: Record<string, unknown> = {
      amountMinor: minor,
      type,
      accountId,
      note: note || null,
      datetime: new Date(date + "T12:00:00").toISOString(),
      scope,
      visibility: hidden ? "hidden" : "normal",
      hiddenUntil: hidden ? hiddenUntil || null : null,
    };
    if (type === "transfer") {
      payload.counterAccountId = counterAccountId;
      payload.categoryId = null;
    } else {
      payload.categoryId = categoryId;
      payload.counterAccountId = null;
    }
    const res = await fetch(`/api/transactions/${tx.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      router.refresh();
      onClose();
    } else {
      setMsg("Ошибка сохранения");
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Удалить операцию?")) return;
    setBusy(true);
    const res = await fetch(`/api/transactions/${tx.id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
      onClose();
    } else {
      setMsg("Ошибка удаления");
      setBusy(false);
    }
  }

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        <div className="sheet-head">
          <div className="t">Операция</div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">✕</button>
        </div>

        <div className="field" style={{ marginTop: 4 }}>
          <label>Сумма, ₽</label>
          <input className="input num" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>

        <div className="seg mt">
          {(["expense", "income", "transfer"] as const).map((tt) => (
            <button type="button" key={tt} className={type === tt ? "active" : ""} onClick={() => setType(tt)}>
              {tt === "expense" ? "Расход" : tt === "income" ? "Доход" : "Перевод"}
            </button>
          ))}
        </div>

        <div className="row mt">
          <div className="field grow" style={{ marginTop: 0 }}>
            <label>{type === "transfer" ? "Со счёта" : "Счёт"}</label>
            <select className="input" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          {type === "transfer" && (
            <div className="field grow" style={{ marginTop: 0 }}>
              <label>На счёт</label>
              <select className="input" value={counterAccountId} onChange={(e) => setCounterAccountId(e.target.value)}>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          )}
        </div>

        {type !== "transfer" && (
          <div className="chips mt">
            {cats.map((c) => (
              <button
                type="button"
                key={c.id}
                className={"cchip" + (categoryId === c.id ? " on" : "")}
                onClick={() => setCategoryId(categoryId === c.id ? null : c.id)}
              >
                <span>{(c.icon ? c.icon + " " : "") + c.name}</span>
              </button>
            ))}
          </div>
        )}

        <div className="field">
          <label>Дата</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <input className="input mt" placeholder="Заметка" value={note} onChange={(e) => setNote(e.target.value)} />

        <div className="seg mt">
          <button type="button" className={scope === "personal" ? "active" : ""} onClick={() => setScope("personal")}>Личное</button>
          <button type="button" className={scope === "common" ? "active" : ""} onClick={() => setScope("common")}>Общее (семья)</button>
        </div>

        <label className="hide-toggle mt">
          <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
          <span className="grow">Скрыть от семьи{hidden ? " до даты:" : ""}</span>
          {hidden && (
            <input type="date" className="input" style={{ width: "auto" }} value={hiddenUntil} onChange={(e) => setHiddenUntil(e.target.value)} />
          )}
        </label>

        {msg && <div className="msg err">{msg}</div>}

        <div className="row mt">
          <button type="button" className="btn btn-primary grow" disabled={busy} onClick={save}>
            {busy ? "…" : "Сохранить"}
          </button>
          <button type="button" className="btn btn-danger" disabled={busy} onClick={remove}>Удалить</button>
        </div>
      </div>
    </div>
  );
}

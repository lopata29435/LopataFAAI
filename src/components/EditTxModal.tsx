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
  const [amount, setAmount] = useState((tx.amountMinor / 100).toString());
  const [type, setType] = useState<TxType>(tx.type);
  const [accountId, setAccountId] = useState(tx.accountId);
  const [counterAccountId, setCounterAccountId] = useState(
    tx.counterAccountId ?? accounts.find((a) => a.id !== tx.accountId)?.id ?? "",
  );
  const [categoryId, setCategoryId] = useState<string | null>(tx.categoryId);
  const [date, setDate] = useState(tx.datetime.slice(0, 10));
  const [note, setNote] = useState(tx.note ?? "");
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
    setBusy(false);
    if (res.ok) {
      onClose();
      router.refresh();
    } else {
      setMsg("Ошибка сохранения");
    }
  }

  async function remove() {
    if (!confirm("Удалить операцию?")) return;
    setBusy(true);
    const res = await fetch(`/api/transactions/${tx.id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) {
      onClose();
      router.refresh();
    } else {
      setMsg("Ошибка удаления");
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <strong>Операция</strong>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">
            ✕
          </button>
        </div>

        <input
          className="amount-input mt"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="seg">
          {(["expense", "income", "transfer"] as const).map((t) => (
            <button type="button" key={t} className={type === t ? "active" : ""} onClick={() => setType(t)}>
              {t === "expense" ? "Расход" : t === "income" ? "Доход" : "Перевод"}
            </button>
          ))}
        </div>

        <div className="row mt">
          <div className="grow">
            <label className="muted small">{type === "transfer" ? "Со счёта" : "Счёт"}</label>
            <select className="text-input" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          {type === "transfer" && (
            <div className="grow">
              <label className="muted small">На счёт</label>
              <select
                className="text-input"
                value={counterAccountId}
                onChange={(e) => setCounterAccountId(e.target.value)}
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
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
                className={"chip" + (categoryId === c.id ? " active" : "")}
                onClick={() => setCategoryId(categoryId === c.id ? null : c.id)}
              >
                {(c.icon ? c.icon + " " : "") + c.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt">
          <label className="muted small">Дата</label>
          <input type="date" className="text-input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        <input
          className="text-input mt"
          placeholder="Заметка"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        {msg && <div className="msg err">{msg}</div>}

        <div className="row mt">
          <button type="button" className="btn btn-primary grow" disabled={busy} onClick={save}>
            {busy ? "…" : "Сохранить"}
          </button>
          <button type="button" className="btn btn-danger" disabled={busy} onClick={remove}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

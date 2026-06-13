"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parseAmountToMinor } from "@/lib/money";

type Account = { id: string; name: string; currency: string };
type Category = { id: string; name: string; icon: string | null; kind: string };
type TxType = "expense" | "income" | "transfer";

export function EntryForm({
  accounts,
  categories,
  aiEnabled,
}: {
  accounts: Account[];
  categories: Category[];
  aiEnabled: boolean;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TxType>("expense");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [counterAccountId, setCounterAccountId] = useState(accounts[1]?.id ?? accounts[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [smart, setSmart] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; kind: "ok" | "err" } | null>(null);

  const visibleCats = useMemo(
    () => (type === "transfer" ? [] : categories.filter((c) => c.kind === type)),
    [categories, type],
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const minor = parseAmountToMinor(amount);
    if (!minor || minor <= 0) return setMsg({ text: "Укажи сумму", kind: "err" });
    if (!accountId) return setMsg({ text: "Выбери счёт", kind: "err" });
    if (type === "transfer" && (!counterAccountId || counterAccountId === accountId)) {
      return setMsg({ text: "Выбери другой счёт назначения", kind: "err" });
    }

    setBusy(true);
    setMsg(null);
    try {
      const payload =
        type === "transfer"
          ? { accountId, counterAccountId, amountMinor: minor, type, note: note || null }
          : { accountId, amountMinor: minor, type, categoryId, note: note || null };
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setAmount("");
      setNote("");
      setCategoryId(null);
      setSmart("");
      setMsg({ text: "Записано ✓", kind: "ok" });
      router.refresh();
    } catch {
      setMsg({ text: "Ошибка сохранения", kind: "err" });
    } finally {
      setBusy(false);
    }
  }

  async function runSmart() {
    if (!smart.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: smart }),
      });
      if (res.status === 501) {
        setMsg({ text: "AI-парсинг выключен (нет LEMONADE_BASE_URL)", kind: "err" });
        return;
      }
      if (!res.ok) throw new Error();
      const { parsed } = await res.json();
      if (parsed.amount != null) setAmount(String(parsed.amount));
      if (parsed.type === "expense" || parsed.type === "income") setType(parsed.type);
      if (parsed.note) setNote(parsed.note);
      if (parsed.category) {
        const target = String(parsed.category).toLowerCase();
        const match = categories.find((c) => c.name.toLowerCase() === target);
        if (match) setCategoryId(match.id);
      }
      setMsg({ text: "Проверь поля и подтверди", kind: "ok" });
    } catch {
      setMsg({ text: "Не удалось распознать", kind: "err" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      {aiEnabled && (
        <div className="row">
          <input
            className="smart-input grow"
            placeholder="Напиши строкой: «такси 450 вчера»"
            value={smart}
            onChange={(e) => setSmart(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                runSmart();
              }
            }}
          />
          <button type="button" className="btn" disabled={busy} onClick={runSmart}>
            AI
          </button>
        </div>
      )}

      <input
        className="amount-input mt"
        inputMode="decimal"
        placeholder="0"
        value={amount}
        autoFocus
        onChange={(e) => setAmount(e.target.value)}
      />

      <div className="seg">
        <button type="button" className={type === "expense" ? "active" : ""} onClick={() => setType("expense")}>
          Расход
        </button>
        <button type="button" className={type === "income" ? "active" : ""} onClick={() => setType("income")}>
          Доход
        </button>
        <button type="button" className={type === "transfer" ? "active" : ""} onClick={() => setType("transfer")}>
          Перевод
        </button>
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
          {visibleCats.map((c) => (
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

      <input
        className="text-input mt"
        placeholder="Заметка (необязательно)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      {msg && <div className={"msg " + (msg.kind === "ok" ? "ok" : "err")}>{msg.text}</div>}

      <button type="submit" className="btn btn-primary mt" disabled={busy}>
        {busy ? "…" : type === "transfer" ? "Перевести" : "Добавить"}
      </button>
    </form>
  );
}

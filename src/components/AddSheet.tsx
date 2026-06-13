"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parseAmountToMinor } from "@/lib/money";

type Account = { id: string; name: string; currency: string };
type Category = { id: string; name: string; icon: string | null; kind: string };
type TxType = "expense" | "income" | "transfer";

function displayAmount(raw: string): string {
  if (!raw) return "0";
  const [intPart, decPart] = raw.split(",");
  const grouped = (intPart || "0").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return decPart !== undefined ? `${grouped},${decPart}` : grouped;
}

export function AddSheet({
  accounts,
  categories,
  aiEnabled,
  onClose,
}: {
  accounts: Account[];
  categories: Category[];
  aiEnabled: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TxType>("expense");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [counterAccountId, setCounterAccountId] = useState(accounts[1]?.id ?? accounts[0]?.id ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [scope, setScope] = useState<"personal" | "common">("personal");
  const [note, setNote] = useState("");
  const [smart, setSmart] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; kind: "ok" | "err" } | null>(null);

  const cats = useMemo(
    () => (type === "transfer" ? [] : categories.filter((c) => c.kind === type)),
    [categories, type],
  );

  function key(k: string) {
    setMsg(null);
    setAmount((a) => {
      if (k === "⌫") return a.slice(0, -1);
      if (k === ",") return a.includes(",") || a === "" ? a : a + ",";
      const dec = a.split(",")[1];
      if (dec && dec.length >= 2) return a;
      return a + k;
    });
  }

  async function submit() {
    const minor = parseAmountToMinor(amount);
    if (!minor || minor <= 0) return setMsg({ text: "Укажи сумму", kind: "err" });
    if (!accountId) return setMsg({ text: "Выбери счёт", kind: "err" });
    if (type === "transfer" && (!counterAccountId || counterAccountId === accountId)) {
      return setMsg({ text: "Нужен другой счёт назначения", kind: "err" });
    }
    setBusy(true);
    setMsg(null);
    try {
      const payload =
        type === "transfer"
          ? { accountId, counterAccountId, amountMinor: minor, type, note: note || null }
          : { accountId, amountMinor: minor, type, categoryId, note: note || null, scope };
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      router.refresh();
      onClose();
    } catch {
      setMsg({ text: "Ошибка сохранения", kind: "err" });
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
      if (res.status === 501) return setMsg({ text: "AI выключен (нет LEMONADE_BASE_URL)", kind: "err" });
      if (!res.ok) throw new Error();
      const { parsed } = await res.json();
      if (parsed.amount != null) setAmount(String(parsed.amount).replace(".", ","));
      if (parsed.type === "expense" || parsed.type === "income") setType(parsed.type);
      if (parsed.note) setNote(parsed.note);
      if (parsed.category) {
        const m = categories.find((c) => c.name.toLowerCase() === String(parsed.category).toLowerCase());
        if (m) setCategoryId(m.id);
      }
      setMsg({ text: "Проверь и сохрани", kind: "ok" });
    } catch {
      setMsg({ text: "Не удалось распознать", kind: "err" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="add-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        <div className="sheet-head">
          <div className="t">Новая операция</div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">✕</button>
        </div>

        {/* Settings (scroll on mobile, full form on desktop) */}
        <div className="add-body">
          {aiEnabled && (
            <div className="row">
              <input
                className="input grow"
                placeholder="Строкой: «такси 450 вчера»"
                value={smart}
                onChange={(e) => setSmart(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), runSmart())}
              />
              <button type="button" className="btn" disabled={busy} onClick={runSmart}>AI</button>
            </div>
          )}

          {/* Desktop amount field (mobile uses the numpad below) */}
          <div className="field amount-desktop" style={{ marginTop: aiEnabled ? 12 : 4 }}>
            <label>Сумма, ₽</label>
            <input
              className="input num amount-desktop-input"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="seg" style={{ marginTop: 12 }}>
            <button type="button" className={type === "expense" ? "active" : ""} onClick={() => setType("expense")}>Расход</button>
            <button type="button" className={type === "income" ? "active" : ""} onClick={() => setType("income")}>Доход</button>
            <button type="button" className={type === "transfer" ? "active" : ""} onClick={() => setType("transfer")}>Перевод</button>
          </div>

          {type !== "transfer" && (
            <div className="seg mt">
              <button type="button" className={scope === "personal" ? "active" : ""} onClick={() => setScope("personal")}>Личное</button>
              <button type="button" className={scope === "common" ? "active" : ""} onClick={() => setScope("common")}>Общее (семья)</button>
            </div>
          )}

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

          <input className="input mt" placeholder="Заметка (необязательно)" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        {/* Footer: amount+numpad pinned on mobile; just save on desktop */}
        <div className="add-foot">
          {msg && <div className={"msg " + msg.kind} style={{ padding: "2px 2px 4px" }}>{msg.text}</div>}
          <div className="amount-display mobile-amount">
            <div className="annot">Сумма</div>
            <div className="v num">{displayAmount(amount)} <small>₽</small></div>
          </div>
          <div className="numpad mobile-numpad">
            {[["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"], [",", "0", "⌫"]].map((row, i) => (
              <div className="row" key={i}>
                {row.map((k) => (
                  <button type="button" className="key" key={k} onClick={() => key(k)}>{k}</button>
                ))}
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={submit}>
            {busy ? "…" : type === "transfer" ? "Перевести" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatMinor, parseAmountToMinor } from "@/lib/money";
import type { Holding } from "@/lib/investments";

function fmtPct(p: number) {
  return (p >= 0 ? "+" : "") + (p * 100).toFixed(1) + "%";
}

function HoldingModal({ holding, onClose }: { holding: Holding | "new"; onClose: () => void }) {
  const router = useRouter();
  const isNew = holding === "new";
  const h = isNew ? null : (holding as Holding);
  const [symbol, setSymbol] = useState(h?.symbol ?? "");
  const [name, setName] = useState(h?.name ?? "");
  const [qty, setQty] = useState(h ? String(h.quantity) : "");
  const [avg, setAvg] = useState(h ? (h.avgPriceMinor / 100).toString().replace(".", ",") : "");
  const [last, setLast] = useState(h ? (h.lastPriceMinor / 100).toString().replace(".", ",") : "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    if (!symbol.trim()) return setMsg("Укажи тикер");
    const q = Number((qty || "").replace(",", "."));
    if (!q || q <= 0) return setMsg("Укажи количество");
    const avgM = parseAmountToMinor(avg);
    if (avgM == null || avgM < 0) return setMsg("Укажи среднюю цену");
    const lastM = parseAmountToMinor(last || avg) ?? avgM;
    setBusy(true);
    setMsg(null);
    const body = { symbol: symbol.trim(), name: name || null, quantity: q, avgPriceMinor: avgM, lastPriceMinor: lastM };
    const res = await fetch(isNew ? "/api/holdings" : `/api/holdings/${h!.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      onClose();
      router.refresh();
    } else {
      setBusy(false);
      setMsg("Ошибка");
    }
  }
  async function del() {
    if (!h || !confirm("Удалить позицию?")) return;
    setBusy(true);
    const res = await fetch(`/api/holdings/${h.id}`, { method: "DELETE" });
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
          <div className="t">{isNew ? "Новая позиция" : "Позиция"}</div>
          <button type="button" className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: "0 14px 16px" }}>
          <div className="row">
            <div className="field grow"><label>Тикер</label><input className="input" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="SBER / AAPL / BTC" /></div>
            <div className="field grow"><label>Название</label><input className="input" value={name ?? ""} onChange={(e) => setName(e.target.value)} placeholder="необязательно" /></div>
          </div>
          <div className="field"><label>Количество</label><input className="input num" inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
          <div className="row">
            <div className="field grow"><label>Средняя цена, ₽</label><input className="input num" inputMode="decimal" value={avg} onChange={(e) => setAvg(e.target.value)} /></div>
            <div className="field grow"><label>Текущая цена, ₽</label><input className="input num" inputMode="decimal" value={last} onChange={(e) => setLast(e.target.value)} /></div>
          </div>
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

export function InvestmentsView({ holdings }: { holdings: Holding[] }) {
  const [modal, setModal] = useState<Holding | "new" | null>(null);
  const totalValue = holdings.reduce((a, h) => a + h.valueMinor, 0);
  const totalCost = holdings.reduce((a, h) => a + h.costMinor, 0);
  const totalPnl = totalValue - totalCost;
  const totalPct = totalCost > 0 ? totalPnl / totalCost : 0;

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 className="page-title">Инвестиции</h1>
        <button type="button" className="btn" style={{ padding: "8px 14px" }} onClick={() => setModal("new")}>+ Позиция</button>
      </div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="annot">Стоимость портфеля</div>
        <div className="num" style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>{formatMinor(totalValue)}</div>
        <div className="small" style={{ marginTop: 4, color: totalPnl >= 0 ? "var(--positive)" : "var(--warm)" }}>
          {(totalPnl >= 0 ? "+" : "") + formatMinor(totalPnl)} ({fmtPct(totalPct)})
        </div>
      </div>
      {holdings.length === 0 ? (
        <div className="card muted small">Нет позиций — добавь вложение и текущую цену, посчитаю доходность.</div>
      ) : (
        <div className="card">
          {holdings.map((h) => (
            <button key={h.id} type="button" className="bud-row" onClick={() => setModal(h)}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{h.symbol}{h.name ? <span className="muted small"> · {h.name}</span> : null}</div>
                  <div className="muted small mono">{h.quantity} × {formatMinor(h.lastPriceMinor, h.currency)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="num" style={{ fontWeight: 600 }}>{formatMinor(h.valueMinor, h.currency)}</div>
                  <div className="small" style={{ color: h.pnlMinor >= 0 ? "var(--positive)" : "var(--warm)" }}>{fmtPct(h.pnlPct)}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      {modal && <HoldingModal holding={modal} onClose={() => setModal(null)} />}
    </>
  );
}

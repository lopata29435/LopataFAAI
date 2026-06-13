"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatMinor, parseAmountToMinor } from "@/lib/money";
import type { Goal } from "@/lib/goals";

const COLORS = ["#FFB59A", "#83D5C6", "#7C9C8E", "#C8A47C", "#9B8CCE", "#E08AA0"];

function GoalModal({ goal, onClose }: { goal: Goal | "new"; onClose: () => void }) {
  const router = useRouter();
  const isNew = goal === "new";
  const g = isNew ? null : (goal as Goal);
  const [name, setName] = useState(g?.name ?? "");
  const [target, setTarget] = useState(g ? (g.targetMinor / 100).toString().replace(".", ",") : "");
  const [current, setCurrent] = useState(g ? (g.currentMinor / 100).toString().replace(".", ",") : "");
  const [deadline, setDeadline] = useState(g?.deadline ?? "");
  const [color, setColor] = useState(g?.color ?? COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    if (!name.trim()) return setMsg("Введи название");
    const tMinor = parseAmountToMinor(target);
    if (!tMinor || tMinor <= 0) return setMsg("Укажи цель суммой");
    setBusy(true);
    setMsg(null);
    const body = {
      name: name.trim(),
      targetMinor: tMinor,
      currentMinor: parseAmountToMinor(current || "0") ?? 0,
      deadline: deadline || null,
      color,
    };
    const res = await fetch(isNew ? "/api/goals" : `/api/goals/${g!.id}`, {
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
  async function archive() {
    if (!g || !confirm("Удалить копилку?")) return;
    setBusy(true);
    const res = await fetch(`/api/goals/${g.id}`, { method: "DELETE" });
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
          <div className="t">{isNew ? "Новая копилка" : "Копилка"}</div>
          <button type="button" className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: "0 14px 16px" }}>
          <div className="field"><label>Название</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Напр. Отпуск" /></div>
          <div className="row">
            <div className="field grow"><label>Цель, ₽</label><input className="input num" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} /></div>
            <div className="field grow"><label>Накоплено, ₽</label><input className="input num" inputMode="decimal" value={current} onChange={(e) => setCurrent(e.target.value)} /></div>
          </div>
          <div className="field"><label>Срок (необязательно)</label><input type="date" className="input" value={deadline ?? ""} onChange={(e) => setDeadline(e.target.value)} /></div>
          <div className="field">
            <label>Цвет</label>
            <div className="row" style={{ gap: 8 }}>
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} style={{ width: 28, height: 28, borderRadius: 8, background: c, border: color === c ? "2px solid var(--text)" : "2px solid transparent", cursor: "pointer" }} />
              ))}
            </div>
          </div>
          {msg && <div className="msg err">{msg}</div>}
          <div className="row mt">
            <button type="button" className="btn btn-primary grow" disabled={busy} onClick={save}>{busy ? "…" : "Сохранить"}</button>
            {!isNew && <button type="button" className="btn btn-danger" disabled={busy} onClick={archive}>Удалить</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function GoalsView({ goals }: { goals: Goal[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<Goal | "new" | null>(null);
  async function topup(g: Goal) {
    const v = window.prompt(`Пополнить «${g.name}» на сумму, ₽:`);
    if (!v) return;
    const m = parseAmountToMinor(v);
    if (!m || m <= 0) return;
    await fetch(`/api/goals/${g.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ addMinor: m }) });
    router.refresh();
  }
  const totalSaved = goals.reduce((a, g) => a + g.currentMinor, 0);

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 className="page-title">Копилки</h1>
        <button type="button" className="btn" style={{ padding: "8px 14px" }} onClick={() => setModal("new")}>+ Цель</button>
      </div>
      <div className="card" style={{ marginBottom: 12 }}>
        <div className="annot">Всего накоплено</div>
        <div className="num" style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>{formatMinor(totalSaved)}</div>
      </div>
      {goals.length === 0 ? (
        <div className="card muted small">Нет копилок — создай первую цель.</div>
      ) : (
        goals.map((g) => {
          const col = g.color ?? "#83D5C6";
          const left = Math.max(0, g.targetMinor - g.currentMinor);
          return (
            <div className="card mt" key={g.id}>
              <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <button type="button" className="link-btn" onClick={() => setModal(g)} style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>{(g.icon ? g.icon + " " : "") + g.name}</div>
                  {g.deadline && <div className="muted small mono">до {new Date(g.deadline).toLocaleDateString("ru-RU")}</div>}
                </button>
                <div style={{ padding: "4px 10px", borderRadius: 100, background: "var(--warm-soft)", color: col, fontSize: 11, fontWeight: 600 }}>{Math.round(g.pct * 100)}%</div>
              </div>
              <div className="row" style={{ alignItems: "baseline", gap: 6, marginTop: 10, marginBottom: 6 }}>
                <span className="num" style={{ fontSize: 22, fontWeight: 600 }}>{formatMinor(g.currentMinor)}</span>
                <span className="muted small">/ {formatMinor(g.targetMinor)}</span>
              </div>
              <div className="progress" style={{ height: 8 }}><span style={{ width: `${Math.round(g.pct * 100)}%`, background: col }} /></div>
              <div className="row mt" style={{ justifyContent: "space-between" }}>
                <span className="muted small">осталось {formatMinor(left)}</span>
                <button type="button" className="link-btn accent" onClick={() => topup(g)} style={{ fontWeight: 600 }}>+ Пополнить</button>
              </div>
            </div>
          );
        })
      )}
      {modal && <GoalModal goal={modal} onClose={() => setModal(null)} />}
    </>
  );
}

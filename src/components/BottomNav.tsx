"use client";

import { useState } from "react";
import { AddSheet } from "./AddSheet";

type Account = { id: string; name: string; currency: string };
type Category = { id: string; name: string; icon: string | null; kind: string };

export function BottomNav({
  accounts,
  categories,
  aiEnabled,
}: {
  accounts: Account[];
  categories: Category[];
  aiEnabled: boolean;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function soon() {
    setToast("Скоро — следующие фазы");
    window.setTimeout(() => setToast(null), 1800);
  }

  return (
    <>
      <nav className="bottom-nav">
        <button
          type="button"
          className="nav-item active"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <span className="pill"><span className="dot" /></span>
          Главная
        </button>
        <button type="button" className="nav-item" onClick={soon}>
          <span className="pill"><span className="dot" /></span>
          История
        </button>
        <button type="button" className="fab" aria-label="Добавить операцию" onClick={() => setAddOpen(true)}>
          +
        </button>
        <button type="button" className="nav-item" onClick={soon}>
          <span className="pill"><span className="dot" /></span>
          Аналитика
        </button>
        <button type="button" className="nav-item" onClick={soon}>
          <span className="pill"><span className="dot" /></span>
          Профиль
        </button>
      </nav>

      {toast && <div className="toast">{toast}</div>}
      {addOpen && (
        <AddSheet
          accounts={accounts}
          categories={categories}
          aiEnabled={aiEnabled}
          onClose={() => setAddOpen(false)}
        />
      )}
    </>
  );
}

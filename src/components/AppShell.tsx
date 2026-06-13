"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AddSheet } from "./AddSheet";

type Account = { id: string; name: string; currency: string };
type Category = { id: string; name: string; icon: string | null; kind: string };

const NAV = [
  { href: "/", label: "Главная", icon: "🏠" },
  { href: "/history", label: "История", icon: "🧾" },
  { href: "/analytics", label: "Аналитика", icon: "📊" },
  { href: "/accounts", label: "Счета", icon: "💳" },
  { href: "/settings", label: "Профиль", icon: "👤" },
];
const SOON = ["Бюджеты", "Копилки", "Инвестиции", "Семья"];

export function AppShell({
  accounts,
  categories,
  aiEnabled,
  userName,
  today,
  children,
}: {
  accounts: Account[];
  categories: Category[];
  aiEnabled: boolean;
  userName: string;
  today: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const soon = () => {
    setToast("Скоро — следующие фазы");
    window.setTimeout(() => setToast(null), 1800);
  };
  const initial = (userName || "Я").trim().charAt(0).toUpperCase();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-logo">₽</span>
          <span className="brand-text">
            <span className="brand-name">Копилка</span>
            <span className="brand-sub mono">Личные финансы</span>
          </span>
        </div>
        <nav className="side-nav">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={"side-item" + (pathname === n.href ? " active" : "")}>
              <span className="side-ic">{n.icon}</span>
              {n.label}
            </Link>
          ))}
          <div className="side-sep">Скоро</div>
          {SOON.map((s) => (
            <button key={s} type="button" className="side-item soon" onClick={soon}>
              <span className="side-ic">•</span>
              {s}
            </button>
          ))}
        </nav>
        <div className="grow" />
        <button type="button" className="btn btn-primary" onClick={() => setAddOpen(true)}>
          + Новая операция
        </button>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="grow">
            <div className="tb-greet">Привет, {userName}</div>
            <div className="tb-date mono">{today}</div>
          </div>
          <span className="chip">RUB</span>
          <button type="button" className="tb-add" onClick={() => setAddOpen(true)}>
            + Новая трата
          </button>
          <span className="avatar">{initial}</span>
        </header>

        <main className="content">{children}</main>
      </div>

      <nav className="bottom-nav">
        {[
          { href: "/", label: "Главная" },
          { href: "/history", label: "История" },
        ].map((n) => (
          <Link key={n.href} href={n.href} className={"nav-item" + (pathname === n.href ? " active" : "")}>
            <span className="pill"><span className="dot" /></span>
            {n.label}
          </Link>
        ))}
        <button type="button" className="fab" aria-label="Добавить операцию" onClick={() => setAddOpen(true)}>
          +
        </button>
        {[
          { href: "/analytics", label: "Аналитика" },
          { href: "/settings", label: "Профиль" },
        ].map((n) => (
          <Link key={n.href} href={n.href} className={"nav-item" + (pathname === n.href ? " active" : "")}>
            <span className="pill"><span className="dot" /></span>
            {n.label}
          </Link>
        ))}
      </nav>

      {toast && <div className="toast">{toast}</div>}
      {addOpen && (
        <AddSheet accounts={accounts} categories={categories} aiEnabled={aiEnabled} onClose={() => setAddOpen(false)} />
      )}
    </div>
  );
}

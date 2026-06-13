import { and, desc, eq, gte, isNull, lt, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb, schema } from "@/db";
import { getAccountsWithBalances } from "./balances";
import type { EditableTx } from "@/components/EditTxModal";

export type DashStat = {
  label: string;
  valueMinor: number;
  currency: string;
  deltaPct: number | null;
  tone: "positive" | "warm" | "neutral";
  spark: number[];
};
export type SpendDay = { label: string; valueMinor: number };
export type TopCat = { name: string; icon: string | null; valueMinor: number; pct: number };
export type AccountLite = { id: string; name: string; currency: string };
export type CategoryLite = { id: string; name: string; icon: string | null; kind: string };

function monthStart(offset = 0): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() + offset, 1);
  return d;
}

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export async function getDashboard(baseCurrency = "RUB") {
  const db = getDb();
  const t = schema.transactions;
  const cat = schema.categories;

  const balances = await getAccountsWithBalances();
  const totalMinor = balances.reduce((a, b) => a + b.balanceMinor, 0);
  const investMinor = balances.filter((b) => b.type === "broker").reduce((a, b) => a + b.balanceMinor, 0);
  const accountsForForms: AccountLite[] = balances.map((b) => ({ id: b.id, name: b.name, currency: b.currency }));

  const thisStart = monthStart(0);
  const nextStart = monthStart(1);
  const prevStart = monthStart(-1);

  async function monthSums(from: Date, to: Date) {
    const [r] = await db
      .select({
        income: sql<string>`coalesce(sum(case when ${t.type} = 'income' then ${t.amountMinor} else 0 end), 0)`,
        expense: sql<string>`coalesce(sum(case when ${t.type} = 'expense' then ${t.amountMinor} else 0 end), 0)`,
      })
      .from(t)
      .where(and(isNull(t.deletedAt), gte(t.datetime, from), lt(t.datetime, to)));
    return { income: Number(r?.income ?? 0), expense: Number(r?.expense ?? 0) };
  }
  const cur = await monthSums(thisStart, nextStart);
  const prev = await monthSums(prevStart, thisStart);
  const delta = (now: number, before: number) => (before > 0 ? Math.round(((now - before) / before) * 1000) / 10 : null);

  // last 7 days of expense, bucketed per day
  const day0 = new Date();
  day0.setHours(0, 0, 0, 0);
  const weekStart = new Date(day0);
  weekStart.setDate(day0.getDate() - 6);
  const dayRows = await db
    .select({
      d: sql<string>`to_char(date_trunc('day', ${t.datetime}), 'YYYY-MM-DD')`,
      total: sql<string>`coalesce(sum(${t.amountMinor}), 0)`,
    })
    .from(t)
    .where(and(isNull(t.deletedAt), eq(t.type, "expense"), gte(t.datetime, weekStart)))
    .groupBy(sql`1`);
  const dayMap = new Map(dayRows.map((r) => [r.d, Number(r.total)]));
  const ru = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
  const spend7: SpendDay[] = Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(weekStart);
    dd.setDate(weekStart.getDate() + i);
    return { label: ru[dd.getDay()], valueMinor: dayMap.get(dayKey(dd)) ?? 0 };
  });

  // top categories this month (expense)
  const topRaw = await db
    .select({ name: cat.name, icon: cat.icon, total: sql<string>`sum(${t.amountMinor})` })
    .from(t)
    .leftJoin(cat, eq(cat.id, t.categoryId))
    .where(and(isNull(t.deletedAt), eq(t.type, "expense"), gte(t.datetime, thisStart), lt(t.datetime, nextStart)))
    .groupBy(cat.name, cat.icon)
    .orderBy(desc(sql`sum(${t.amountMinor})`))
    .limit(4);
  const topCategories: TopCat[] = topRaw.map((r) => ({
    name: r.name ?? "Без категории",
    icon: r.icon,
    valueMinor: Number(r.total),
    pct: cur.expense ? Number(r.total) / cur.expense : 0,
  }));

  // categories (leaves) + recent
  const allCats = await db
    .select({ id: cat.id, name: cat.name, icon: cat.icon, kind: cat.kind, parentId: cat.parentId, sortOrder: cat.sortOrder })
    .from(cat)
    .where(eq(cat.isArchived, false))
    .orderBy(cat.sortOrder);
  const parentIds = new Set(allCats.filter((c) => c.parentId).map((c) => c.parentId));
  const leafCategories: CategoryLite[] = allCats
    .filter((c) => c.kind !== "transfer" && !parentIds.has(c.id))
    .map((c) => ({ id: c.id, name: c.name, icon: c.icon, kind: c.kind }));

  const counterAcc = alias(schema.accounts, "counter_acc");
  const recentRaw = await db
    .select({
      id: t.id,
      amountMinor: t.amountMinor,
      currency: t.currency,
      type: t.type,
      datetime: t.datetime,
      note: t.note,
      categoryId: t.categoryId,
      accountId: t.accountId,
      counterAccountId: t.counterAccountId,
      categoryName: cat.name,
      categoryIcon: cat.icon,
      accountName: schema.accounts.name,
      counterAccountName: counterAcc.name,
    })
    .from(t)
    .leftJoin(cat, eq(cat.id, t.categoryId))
    .leftJoin(schema.accounts, eq(schema.accounts.id, t.accountId))
    .leftJoin(counterAcc, eq(counterAcc.id, t.counterAccountId))
    .where(isNull(t.deletedAt))
    .orderBy(desc(t.datetime))
    .limit(30);
  const recent: EditableTx[] = recentRaw.map((r) => ({ ...r, datetime: r.datetime.toISOString() }));

  const stats: DashStat[] = [
    { label: "Баланс", valueMinor: totalMinor, currency: baseCurrency, deltaPct: null, tone: "neutral", spark: [] },
    { label: "Доход", valueMinor: cur.income, currency: baseCurrency, deltaPct: delta(cur.income, prev.income), tone: "positive", spark: [] },
    {
      label: "Расход",
      valueMinor: cur.expense,
      currency: baseCurrency,
      deltaPct: delta(cur.expense, prev.expense),
      tone: "warm",
      spark: spend7.map((s) => s.valueMinor),
    },
    { label: "Инвестиции", valueMinor: investMinor, currency: baseCurrency, deltaPct: null, tone: "positive", spark: [] },
  ];

  return { stats, spend7, topCategories, recent, accountsForForms, leafCategories, monthExpense: cur.expense };
}

import { and, eq, gte, isNull, lt, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";

export type BudgetRow = {
  id: string;
  categoryId: string | null;
  categoryName: string;
  categoryIcon: string | null;
  limitMinor: number;
  spentMinor: number;
  pct: number;
};

function monthStart(off = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() + off, 1);
  return d;
}

export async function getBudgets(): Promise<BudgetRow[]> {
  const db = getDb();
  const b = schema.budgets;
  const cat = schema.categories;
  const t = schema.transactions;
  const thisStart = monthStart(0);
  const nextStart = monthStart(1);

  const rows = await db
    .select({
      id: b.id,
      categoryId: b.categoryId,
      limitMinor: b.limitMinor,
      categoryName: cat.name,
      categoryIcon: cat.icon,
    })
    .from(b)
    .leftJoin(cat, eq(cat.id, b.categoryId));

  const spent = await db
    .select({ categoryId: t.categoryId, total: sql<string>`sum(${t.amountMinor})` })
    .from(t)
    .where(and(isNull(t.deletedAt), eq(t.type, "expense"), gte(t.datetime, thisStart), lt(t.datetime, nextStart)))
    .groupBy(t.categoryId);
  const spentMap = new Map(spent.map((s) => [s.categoryId, Number(s.total)]));
  const totalExpense = spent.reduce((a, s) => a + Number(s.total), 0);

  return rows
    .map((r) => {
      const sp = r.categoryId ? spentMap.get(r.categoryId) ?? 0 : totalExpense;
      return {
        id: r.id,
        categoryId: r.categoryId,
        categoryName: r.categoryId ? r.categoryName ?? "Категория" : "Общий лимит",
        categoryIcon: r.categoryId ? r.categoryIcon : "💰",
        limitMinor: r.limitMinor,
        spentMinor: sp,
        pct: r.limitMinor > 0 ? sp / r.limitMinor : 0,
      };
    })
    .sort((a, b2) => b2.pct - a.pct);
}

import { and, desc, eq, gte, isNull, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { formatMinor } from "@/lib/money";
import { isAiEnabled } from "@/lib/lemonade";
import { EntryForm } from "@/components/EntryForm";

export const dynamic = "force-dynamic";

function startOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function Home() {
  const db = getDb();

  const accounts = await db
    .select({ id: schema.accounts.id, name: schema.accounts.name, currency: schema.accounts.currency })
    .from(schema.accounts)
    .where(eq(schema.accounts.isArchived, false))
    .orderBy(schema.accounts.sortOrder);

  const categories = await db
    .select({
      id: schema.categories.id,
      name: schema.categories.name,
      icon: schema.categories.icon,
      kind: schema.categories.kind,
      parentId: schema.categories.parentId,
      sortOrder: schema.categories.sortOrder,
    })
    .from(schema.categories)
    .where(eq(schema.categories.isArchived, false))
    .orderBy(schema.categories.sortOrder);

  const recent = await db
    .select({
      id: schema.transactions.id,
      amountMinor: schema.transactions.amountMinor,
      currency: schema.transactions.currency,
      type: schema.transactions.type,
      datetime: schema.transactions.datetime,
      note: schema.transactions.note,
      categoryName: schema.categories.name,
      categoryIcon: schema.categories.icon,
      accountName: schema.accounts.name,
    })
    .from(schema.transactions)
    .leftJoin(schema.categories, eq(schema.categories.id, schema.transactions.categoryId))
    .leftJoin(schema.accounts, eq(schema.accounts.id, schema.transactions.accountId))
    .where(isNull(schema.transactions.deletedAt))
    .orderBy(desc(schema.transactions.datetime))
    .limit(25);

  const summary = await db
    .select({
      categoryName: schema.categories.name,
      categoryIcon: schema.categories.icon,
      total: sql<string>`sum(${schema.transactions.amountMinor})`,
    })
    .from(schema.transactions)
    .leftJoin(schema.categories, eq(schema.categories.id, schema.transactions.categoryId))
    .where(
      and(
        isNull(schema.transactions.deletedAt),
        eq(schema.transactions.type, "expense"),
        gte(schema.transactions.datetime, startOfMonth()),
      ),
    )
    .groupBy(schema.categories.name, schema.categories.icon)
    .orderBy(desc(sql`sum(${schema.transactions.amountMinor})`));

  const summaryRows = summary.map((s) => ({
    name: s.categoryName ?? "Без категории",
    icon: s.categoryIcon ?? "•",
    total: Number(s.total ?? 0),
  }));
  const monthTotal = summaryRows.reduce((a, s) => a + s.total, 0);

  return (
    <main className="container">
      <h1>Финансы</h1>

      <EntryForm
        accounts={accounts}
        categories={categories.filter((c) => c.kind !== "transfer")}
        aiEnabled={isAiEnabled()}
      />

      <h2>Этот месяц · {formatMinor(monthTotal)}</h2>
      <div className="card">
        {summaryRows.length === 0 ? (
          <div className="muted small">Пока нет расходов в этом месяце.</div>
        ) : (
          summaryRows.slice(0, 8).map((s) => (
            <div className="sum-row" key={s.name}>
              <span style={{ width: 22 }}>{s.icon}</span>
              <span style={{ minWidth: 120 }}>{s.name}</span>
              <span className="sum-bar-track">
                <span
                  className="sum-bar-fill"
                  style={{ width: `${monthTotal ? Math.round((s.total / monthTotal) * 100) : 0}%` }}
                />
              </span>
              <span className="small right" style={{ minWidth: 90 }}>{formatMinor(s.total)}</span>
            </div>
          ))
        )}
      </div>

      <h2>Последние операции</h2>
      <div className="card list">
        {recent.length === 0 ? (
          <div className="muted small">Записей пока нет — добавь первую сверху.</div>
        ) : (
          recent.map((t) => (
            <div className="list-item" key={t.id}>
              <div>
                <div>{(t.categoryIcon ?? "•") + " " + (t.categoryName ?? "Без категории")}</div>
                <div className="muted small">
                  {new Date(t.datetime).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                  {t.accountName ? ` · ${t.accountName}` : ""}
                  {t.note ? ` · ${t.note}` : ""}
                </div>
              </div>
              <div className={t.type === "income" ? "amount-in" : "amount-out"}>
                {(t.type === "income" ? "+" : "−") + formatMinor(t.amountMinor, t.currency)}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}

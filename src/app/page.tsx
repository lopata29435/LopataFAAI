import { and, desc, eq, gte, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb, schema } from "@/db";
import { getAccountsWithBalances } from "@/lib/balances";
import { formatMinor } from "@/lib/money";
import { isAiEnabled } from "@/lib/lemonade";
import { EntryForm } from "@/components/EntryForm";
import { TxList } from "@/components/TxList";

export const dynamic = "force-dynamic";

function startOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function Home() {
  const db = getDb();

  const balances = await getAccountsWithBalances();
  const totalMinor = balances.reduce((a, b) => a + b.balanceMinor, 0);
  const accountsForForms = balances.map((b) => ({ id: b.id, name: b.name, currency: b.currency }));

  const allCats = await db
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
  const parentIds = new Set(allCats.filter((c) => c.parentId).map((c) => c.parentId));
  const leafCategories = allCats
    .filter((c) => c.kind !== "transfer" && !parentIds.has(c.id))
    .map((c) => ({ id: c.id, name: c.name, icon: c.icon, kind: c.kind }));

  const counterAcc = alias(schema.accounts, "counter_acc");
  const recentRaw = await db
    .select({
      id: schema.transactions.id,
      amountMinor: schema.transactions.amountMinor,
      currency: schema.transactions.currency,
      type: schema.transactions.type,
      datetime: schema.transactions.datetime,
      note: schema.transactions.note,
      categoryId: schema.transactions.categoryId,
      accountId: schema.transactions.accountId,
      counterAccountId: schema.transactions.counterAccountId,
      categoryName: schema.categories.name,
      categoryIcon: schema.categories.icon,
      accountName: schema.accounts.name,
      counterAccountName: counterAcc.name,
    })
    .from(schema.transactions)
    .leftJoin(schema.categories, eq(schema.categories.id, schema.transactions.categoryId))
    .leftJoin(schema.accounts, eq(schema.accounts.id, schema.transactions.accountId))
    .leftJoin(counterAcc, eq(counterAcc.id, schema.transactions.counterAccountId))
    .where(isNull(schema.transactions.deletedAt))
    .orderBy(desc(schema.transactions.datetime))
    .limit(30);
  const recent = recentRaw.map((r) => ({ ...r, datetime: r.datetime.toISOString() }));

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

      <EntryForm accounts={accountsForForms} categories={leafCategories} aiEnabled={isAiEnabled()} />

      <div className="accounts-strip mt">
        {balances.map((b) => (
          <div className="acct" key={b.id}>
            <div className="acct-name muted small">{b.name}</div>
            <div className="acct-bal">{formatMinor(b.balanceMinor, b.currency)}</div>
          </div>
        ))}
        {balances.length > 1 && (
          <div className="acct total">
            <div className="acct-name muted small">Всего</div>
            <div className="acct-bal">{formatMinor(totalMinor)}</div>
          </div>
        )}
      </div>

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
              <span className="small right" style={{ minWidth: 90 }}>
                {formatMinor(s.total)}
              </span>
            </div>
          ))
        )}
      </div>

      <h2>Последние операции</h2>
      <div className="card">
        <TxList rows={recent} accounts={accountsForForms} categories={leafCategories} />
      </div>
    </main>
  );
}

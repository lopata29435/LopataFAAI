import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";

export type AccountBalance = {
  id: string;
  name: string;
  currency: string;
  type: string;
  balanceMinor: number;
};

/**
 * Current balance per account:
 *   opening + income − expense − transfersOut + transfersIn
 * Transfers are single rows (account_id = source, counter_account_id = destination).
 */
export async function getAccountsWithBalances(): Promise<AccountBalance[]> {
  const db = getDb();

  const accounts = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.isArchived, false))
    .orderBy(schema.accounts.sortOrder);

  const flows = await db
    .select({
      accountId: schema.transactions.accountId,
      income: sql<string>`coalesce(sum(case when ${schema.transactions.type} = 'income' then ${schema.transactions.amountMinor} else 0 end), 0)`,
      expense: sql<string>`coalesce(sum(case when ${schema.transactions.type} = 'expense' then ${schema.transactions.amountMinor} else 0 end), 0)`,
      transferOut: sql<string>`coalesce(sum(case when ${schema.transactions.type} = 'transfer' then ${schema.transactions.amountMinor} else 0 end), 0)`,
    })
    .from(schema.transactions)
    .where(isNull(schema.transactions.deletedAt))
    .groupBy(schema.transactions.accountId);

  const transfersIn = await db
    .select({
      accountId: schema.transactions.counterAccountId,
      amt: sql<string>`coalesce(sum(${schema.transactions.amountMinor}), 0)`,
    })
    .from(schema.transactions)
    .where(and(isNull(schema.transactions.deletedAt), eq(schema.transactions.type, "transfer")))
    .groupBy(schema.transactions.counterAccountId);

  const flowMap = new Map(flows.map((f) => [f.accountId, f]));
  const inMap = new Map(
    transfersIn.filter((t) => t.accountId).map((t) => [t.accountId as string, Number(t.amt)]),
  );

  return accounts.map((a) => {
    const f = flowMap.get(a.id);
    const balanceMinor =
      a.openingBalanceMinor +
      (f ? Number(f.income) - Number(f.expense) - Number(f.transferOut) : 0) +
      (inMap.get(a.id) ?? 0);
    return { id: a.id, name: a.name, currency: a.currency, type: a.type, balanceMinor };
  });
}

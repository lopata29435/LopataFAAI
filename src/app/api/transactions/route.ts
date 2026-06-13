import { NextResponse } from "next/server";
import { desc, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";

export const dynamic = "force-dynamic";

const CreateTx = z
  .object({
    accountId: z.string().uuid(),
    amountMinor: z.number().int().positive(),
    type: z.enum(["expense", "income", "transfer"]).default("expense"),
    categoryId: z.string().uuid().nullable().optional(),
    counterAccountId: z.string().uuid().nullable().optional(),
    datetime: z.string().datetime().optional(),
    note: z.string().max(500).nullable().optional(),
    currency: z.string().length(3).optional(),
    scope: z.enum(["personal", "common"]).optional(),
    source: z.enum(["manual", "ai", "import", "recurring"]).default("manual"),
  })
  .refine((d) => d.type !== "transfer" || (!!d.counterAccountId && d.counterAccountId !== d.accountId), {
    message: "Перевод требует другой счёт назначения",
    path: ["counterAccountId"],
  });

async function defaultUserId(db: ReturnType<typeof getDb>) {
  const [u] = await db.select({ id: schema.users.id }).from(schema.users).limit(1);
  if (!u) throw new Error("No user found — run the seed (npm run db:seed)");
  return u.id;
}

export async function POST(req: Request) {
  const db = getDb();
  const body = await req.json().catch(() => null);
  const parsed = CreateTx.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;
  const isTransfer = d.type === "transfer";
  const userId = await defaultUserId(db);

  const [row] = await db
    .insert(schema.transactions)
    .values({
      accountId: d.accountId,
      userId,
      amountMinor: d.amountMinor,
      type: d.type,
      categoryId: isTransfer ? null : d.categoryId ?? null,
      counterAccountId: isTransfer ? d.counterAccountId ?? null : null,
      datetime: d.datetime ? new Date(d.datetime) : new Date(),
      note: d.note ?? null,
      currency: d.currency ?? process.env.BASE_CURRENCY ?? "RUB",
      scope: d.scope ?? "personal",
      source: d.source,
    })
    .returning();

  return NextResponse.json({ transaction: row }, { status: 201 });
}

export async function GET() {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.transactions)
    .where(isNull(schema.transactions.deletedAt))
    .orderBy(desc(schema.transactions.datetime))
    .limit(50);
  return NextResponse.json({ transactions: rows });
}

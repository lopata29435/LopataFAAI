import { NextResponse } from "next/server";
import { asc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";

export const dynamic = "force-dynamic";

const CreateAccount = z.object({
  name: z.string().min(1).max(80),
  type: z.enum(["cash", "card", "bank", "deposit", "broker", "other"]).default("card"),
  currency: z.string().length(3).default("RUB"),
  openingBalanceMinor: z.number().int().optional(),
});

async function defaultUserId(db: ReturnType<typeof getDb>) {
  const [u] = await db.select({ id: schema.users.id }).from(schema.users).limit(1);
  if (!u) throw new Error("No user found — run the seed");
  return u.id;
}

export async function GET() {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.isArchived, false))
    .orderBy(asc(schema.accounts.sortOrder));
  return NextResponse.json({ accounts: rows });
}

export async function POST(req: Request) {
  const db = getDb();
  const body = await req.json().catch(() => null);
  const parsed = CreateAccount.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const d = parsed.data;
  const userId = await defaultUserId(db);
  const [{ m }] = await db.select({ m: sql<number>`coalesce(max(${schema.accounts.sortOrder}), 0)` }).from(schema.accounts);
  const [row] = await db
    .insert(schema.accounts)
    .values({
      ownerId: userId,
      name: d.name,
      type: d.type,
      currency: d.currency,
      openingBalanceMinor: d.openingBalanceMinor ?? 0,
      sortOrder: Number(m) + 1,
    })
    .returning();
  return NextResponse.json({ account: row }, { status: 201 });
}

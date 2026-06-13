import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";

export const dynamic = "force-dynamic";

const UpdateTx = z.object({
  accountId: z.string().uuid().optional(),
  amountMinor: z.number().int().positive().optional(),
  type: z.enum(["expense", "income", "transfer"]).optional(),
  categoryId: z.string().uuid().nullable().optional(),
  counterAccountId: z.string().uuid().nullable().optional(),
  datetime: z.string().datetime().optional(),
  note: z.string().max(500).nullable().optional(),
  scope: z.enum(["personal", "common"]).optional(),
  visibility: z.enum(["normal", "hidden"]).optional(),
  hiddenUntil: z.string().nullable().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const db = getDb();
  const body = await req.json().catch(() => null);
  const parsed = UpdateTx.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const d = parsed.data;

  const patch: Partial<typeof schema.transactions.$inferInsert> = { updatedAt: new Date() };
  if (d.accountId !== undefined) patch.accountId = d.accountId;
  if (d.amountMinor !== undefined) patch.amountMinor = d.amountMinor;
  if (d.type !== undefined) patch.type = d.type;
  if (d.categoryId !== undefined) patch.categoryId = d.categoryId;
  if (d.counterAccountId !== undefined) patch.counterAccountId = d.counterAccountId;
  if (d.datetime !== undefined) patch.datetime = new Date(d.datetime);
  if (d.note !== undefined) patch.note = d.note;
  if (d.scope !== undefined) patch.scope = d.scope;
  if (d.visibility !== undefined) {
    patch.visibility = d.visibility;
    if (d.visibility === "hidden") {
      patch.hiddenUntil = d.hiddenUntil ? new Date(d.hiddenUntil) : null;
      patch.revealedAt = null;
    } else {
      patch.revealedAt = new Date();
    }
  } else if (d.hiddenUntil !== undefined) {
    patch.hiddenUntil = d.hiddenUntil ? new Date(d.hiddenUntil) : null;
  }

  // Keep the model consistent: transfers carry no category; non-transfers carry no counter account.
  if (d.type === "transfer") patch.categoryId = null;
  if (d.type === "expense" || d.type === "income") patch.counterAccountId = null;

  const [row] = await db
    .update(schema.transactions)
    .set(patch)
    .where(and(eq(schema.transactions.id, id), isNull(schema.transactions.deletedAt)))
    .returning();

  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ transaction: row });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const db = getDb();
  const [row] = await db
    .update(schema.transactions)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(schema.transactions.id, id), isNull(schema.transactions.deletedAt)))
    .returning();

  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

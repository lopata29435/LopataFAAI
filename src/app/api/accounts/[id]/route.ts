import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";

export const dynamic = "force-dynamic";

const UpdateAccount = z.object({
  name: z.string().min(1).max(80).optional(),
  type: z.enum(["cash", "card", "bank", "deposit", "broker", "other"]).optional(),
  currency: z.string().length(3).optional(),
  openingBalanceMinor: z.number().int().optional(),
  isArchived: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const db = getDb();
  const body = await req.json().catch(() => null);
  const parsed = UpdateAccount.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const [row] = await db.update(schema.accounts).set(parsed.data).where(eq(schema.accounts.id, id)).returning();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ account: row });
}

// Archive (we never hard-delete an account — its transactions would cascade away).
export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const db = getDb();
  const [row] = await db
    .update(schema.accounts)
    .set({ isArchived: true })
    .where(eq(schema.accounts.id, id))
    .returning();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

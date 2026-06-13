import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";

export const dynamic = "force-dynamic";

const Update = z.object({
  symbol: z.string().min(1).max(20).optional(),
  name: z.string().nullable().optional(),
  quantity: z.number().positive().optional(),
  avgPriceMinor: z.number().int().nonnegative().optional(),
  lastPriceMinor: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  isArchived: z.boolean().optional(),
});
type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const db = getDb();
  const p = Update.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: p.error.flatten() }, { status: 400 });
  const d = p.data;
  const set: Record<string, unknown> = {};
  if (d.symbol !== undefined) set.symbol = d.symbol.toUpperCase();
  if (d.name !== undefined) set.name = d.name;
  if (d.quantity !== undefined) set.quantity = String(d.quantity);
  if (d.avgPriceMinor !== undefined) set.avgPriceMinor = d.avgPriceMinor;
  if (d.lastPriceMinor !== undefined) set.lastPriceMinor = d.lastPriceMinor;
  if (d.currency !== undefined) set.currency = d.currency;
  if (d.isArchived !== undefined) set.isArchived = d.isArchived;
  if (Object.keys(set).length === 0) return NextResponse.json({ error: "empty" }, { status: 400 });
  const [row] = await db.update(schema.holdings).set(set).where(eq(schema.holdings.id, id)).returning();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ holding: row });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const db = getDb();
  const [row] = await db.update(schema.holdings).set({ isArchived: true }).where(eq(schema.holdings.id, id)).returning();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

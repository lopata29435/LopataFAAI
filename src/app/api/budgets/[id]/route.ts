import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";

export const dynamic = "force-dynamic";

const Update = z.object({ limitMinor: z.number().int().positive() });
type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const db = getDb();
  const p = Update.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: p.error.flatten() }, { status: 400 });
  const [row] = await db.update(schema.budgets).set({ limitMinor: p.data.limitMinor }).where(eq(schema.budgets.id, id)).returning();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ budget: row });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const db = getDb();
  const [row] = await db.delete(schema.budgets).where(eq(schema.budgets.id, id)).returning();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

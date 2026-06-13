import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/db";

export const dynamic = "force-dynamic";

const Update = z.object({
  name: z.string().min(1).max(80).optional(),
  targetMinor: z.number().int().positive().optional(),
  currentMinor: z.number().int().nonnegative().optional(),
  addMinor: z.number().int().optional(),
  deadline: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
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
  if (d.name !== undefined) set.name = d.name;
  if (d.targetMinor !== undefined) set.targetMinor = d.targetMinor;
  if (d.deadline !== undefined) set.deadline = d.deadline;
  if (d.icon !== undefined) set.icon = d.icon;
  if (d.color !== undefined) set.color = d.color;
  if (d.isArchived !== undefined) set.isArchived = d.isArchived;
  if (d.addMinor !== undefined) set.currentMinor = sql`${schema.goals.currentMinor} + ${d.addMinor}`;
  else if (d.currentMinor !== undefined) set.currentMinor = d.currentMinor;
  if (Object.keys(set).length === 0) return NextResponse.json({ error: "empty" }, { status: 400 });

  const [row] = await db.update(schema.goals).set(set).where(eq(schema.goals.id, id)).returning();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ goal: row });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const db = getDb();
  const [row] = await db.update(schema.goals).set({ isArchived: true }).where(eq(schema.goals.id, id)).returning();
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

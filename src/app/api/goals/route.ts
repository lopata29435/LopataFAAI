import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { getDefaultUserId } from "@/lib/user";
import { getGoals } from "@/lib/goals";

export const dynamic = "force-dynamic";

const Create = z.object({
  name: z.string().min(1).max(80),
  targetMinor: z.number().int().positive(),
  currentMinor: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  icon: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
});

export async function GET() {
  return NextResponse.json({ goals: await getGoals() });
}

export async function POST(req: Request) {
  const db = getDb();
  const p = Create.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: p.error.flatten() }, { status: 400 });
  const userId = await getDefaultUserId(db);
  const [row] = await db
    .insert(schema.goals)
    .values({
      ownerId: userId,
      name: p.data.name,
      targetMinor: p.data.targetMinor,
      currentMinor: p.data.currentMinor ?? 0,
      currency: p.data.currency ?? "RUB",
      icon: p.data.icon ?? null,
      color: p.data.color ?? null,
      deadline: p.data.deadline ?? null,
    })
    .returning();
  return NextResponse.json({ goal: row }, { status: 201 });
}

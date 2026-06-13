import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { getDefaultUserId } from "@/lib/user";
import { getBudgets } from "@/lib/budgets";

export const dynamic = "force-dynamic";

const Create = z.object({
  categoryId: z.string().uuid().nullable().optional(),
  limitMinor: z.number().int().positive(),
  currency: z.string().length(3).optional(),
});

export async function GET() {
  return NextResponse.json({ budgets: await getBudgets() });
}

export async function POST(req: Request) {
  const db = getDb();
  const p = Create.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: p.error.flatten() }, { status: 400 });
  const userId = await getDefaultUserId(db);
  const [row] = await db
    .insert(schema.budgets)
    .values({
      ownerId: userId,
      categoryId: p.data.categoryId ?? null,
      limitMinor: p.data.limitMinor,
      currency: p.data.currency ?? "RUB",
    })
    .onConflictDoUpdate({
      target: [schema.budgets.ownerId, schema.budgets.categoryId],
      set: { limitMinor: p.data.limitMinor },
    })
    .returning();
  return NextResponse.json({ budget: row }, { status: 201 });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb, schema } from "@/db";
import { getDefaultUserId } from "@/lib/user";
import { getHoldings } from "@/lib/investments";

export const dynamic = "force-dynamic";

const Create = z.object({
  symbol: z.string().min(1).max(20),
  name: z.string().nullable().optional(),
  quantity: z.number().positive(),
  avgPriceMinor: z.number().int().nonnegative(),
  lastPriceMinor: z.number().int().nonnegative().optional(),
  currency: z.string().length(3).optional(),
  accountId: z.string().uuid().nullable().optional(),
});

export async function GET() {
  return NextResponse.json({ holdings: await getHoldings() });
}

export async function POST(req: Request) {
  const db = getDb();
  const p = Create.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: p.error.flatten() }, { status: 400 });
  const userId = await getDefaultUserId(db);
  const [row] = await db
    .insert(schema.holdings)
    .values({
      ownerId: userId,
      accountId: p.data.accountId ?? null,
      symbol: p.data.symbol.toUpperCase(),
      name: p.data.name ?? null,
      quantity: String(p.data.quantity),
      avgPriceMinor: p.data.avgPriceMinor,
      lastPriceMinor: p.data.lastPriceMinor ?? p.data.avgPriceMinor,
      currency: p.data.currency ?? "RUB",
    })
    .returning();
  return NextResponse.json({ holding: row }, { status: 201 });
}

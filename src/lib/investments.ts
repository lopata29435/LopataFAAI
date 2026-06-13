import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";

export type Holding = {
  id: string;
  symbol: string;
  name: string | null;
  quantity: number;
  avgPriceMinor: number;
  lastPriceMinor: number;
  currency: string;
  costMinor: number;
  valueMinor: number;
  pnlMinor: number;
  pnlPct: number;
};

export async function getHoldings(): Promise<Holding[]> {
  const db = getDb();
  const rows = await db.select().from(schema.holdings).where(eq(schema.holdings.isArchived, false));
  return rows.map((h) => {
    const qty = Number(h.quantity);
    const last = h.lastPriceMinor || h.avgPriceMinor;
    const cost = Math.round(qty * h.avgPriceMinor);
    const value = Math.round(qty * last);
    const pnl = value - cost;
    return {
      id: h.id,
      symbol: h.symbol,
      name: h.name,
      quantity: qty,
      avgPriceMinor: h.avgPriceMinor,
      lastPriceMinor: h.lastPriceMinor,
      currency: h.currency,
      costMinor: cost,
      valueMinor: value,
      pnlMinor: pnl,
      pnlPct: cost > 0 ? pnl / cost : 0,
    };
  });
}

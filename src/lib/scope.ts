import { sql } from "drizzle-orm";
import { schema } from "@/db";

/**
 * A transaction counts in aggregates (balances/stats) iff it is NOT effectively
 * hidden: an op is effectively hidden while visibility='hidden' AND it has no
 * reveal date yet OR the reveal date is still in the future. Evaluated with
 * now() at query time, so date-based reveal needs no cron for correctness.
 */
export const txVisible = sql`not (${schema.transactions.visibility} = 'hidden' and (${schema.transactions.hiddenUntil} is null or ${schema.transactions.hiddenUntil} > now()))`;

import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";

export type Goal = {
  id: string;
  name: string;
  targetMinor: number;
  currentMinor: number;
  currency: string;
  icon: string | null;
  color: string | null;
  deadline: string | null;
  pct: number;
};

export async function getGoals(): Promise<Goal[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.goals)
    .where(eq(schema.goals.isArchived, false))
    .orderBy(asc(schema.goals.sortOrder));
  return rows.map((g) => ({
    id: g.id,
    name: g.name,
    targetMinor: g.targetMinor,
    currentMinor: g.currentMinor,
    currency: g.currency,
    icon: g.icon,
    color: g.color,
    deadline: g.deadline,
    pct: g.targetMinor > 0 ? Math.min(1, g.currentMinor / g.targetMinor) : 0,
  }));
}

/** The goal to feature in the dashboard hero: nearest deadline, else most progressed. */
export async function getTopGoal(): Promise<Goal | null> {
  const goals = await getGoals();
  if (goals.length === 0) return null;
  const withDeadline = goals.filter((g) => g.deadline).sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1));
  if (withDeadline.length) return withDeadline[0];
  return goals.slice().sort((a, b) => b.pct - a.pct)[0];
}

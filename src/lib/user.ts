import { getDb, schema } from "@/db";

/** Current data-owner. Single-user for now (first user / seeded, linked to ZITADEL). */
export async function getDefaultUserId(db = getDb()): Promise<string> {
  const [u] = await db.select({ id: schema.users.id }).from(schema.users).limit(1);
  if (!u) throw new Error("No user found — run the seed");
  return u.id;
}

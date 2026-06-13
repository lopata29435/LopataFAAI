// Idempotent seed: default user, default accounts, system category tree.
import postgres from "postgres";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("[seed] DATABASE_URL is not set");
  process.exit(1);
}

const baseCurrency = process.env.BASE_CURRENCY || "RUB";
const here = path.dirname(fileURLToPath(import.meta.url));
const catsPath = path.join(here, "..", "src", "db", "seed-data", "categories.json");
const cats = JSON.parse(await readFile(catsPath, "utf8"));

const sql = postgres(url, { max: 1 });

async function ensureCategory(c, parentId, kind) {
  const k = c.kind || kind || "expense";
  const existing = await sql`SELECT id FROM categories WHERE owner_id IS NULL AND slug = ${c.slug} LIMIT 1`;
  let id;
  if (existing.length) {
    id = existing[0].id;
  } else {
    const rows = await sql`
      INSERT INTO categories (owner_id, name, slug, parent_id, kind, icon, color, sort_order)
      VALUES (NULL, ${c.name}, ${c.slug}, ${parentId ?? null}, ${k}, ${c.icon ?? null}, ${c.color ?? null}, ${c.sort ?? 0})
      RETURNING id`;
    id = rows[0].id;
  }
  if (Array.isArray(c.children)) {
    for (const child of c.children) await ensureCategory(child, id, k);
  }
}

try {
  let [user] = await sql`SELECT id FROM users LIMIT 1`;
  if (!user) {
    [user] = await sql`INSERT INTO users (name) VALUES ('Я') RETURNING id`;
    console.log("[seed] created default user");
  }

  const [{ count }] = await sql`SELECT count(*)::int AS count FROM accounts WHERE owner_id = ${user.id}`;
  if (count === 0) {
    await sql`INSERT INTO accounts (owner_id, name, type, currency, sort_order) VALUES
      (${user.id}, 'Наличные', 'cash', ${baseCurrency}, 0),
      (${user.id}, 'Карта', 'card', ${baseCurrency}, 1)`;
    console.log("[seed] created default accounts");
  }

  for (const c of cats) await ensureCategory(c, null, c.kind);
  console.log(`[seed] categories ensured (${cats.length} top-level groups)`);
  console.log("[seed] done");
} catch (err) {
  console.error("[seed] failed:", err);
  process.exitCode = 1;
} finally {
  await sql.end();
}

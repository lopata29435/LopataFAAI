// Minimal forward-only migration runner. Applies drizzle/*.sql in order,
// tracking applied files in a _migrations table. No drizzle-kit needed at runtime.
import postgres from "postgres";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("[migrate] DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "drizzle");

try {
  await sql`CREATE TABLE IF NOT EXISTS _migrations (
    name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`;
  const appliedRows = await sql`SELECT name FROM _migrations`;
  const applied = new Set(appliedRows.map((r) => r.name));

  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  let count = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const content = await readFile(path.join(dir, file), "utf8");
    console.log(`[migrate] applying ${file}`);
    await sql.unsafe(content);
    await sql`INSERT INTO _migrations (name) VALUES (${file})`;
    count++;
  }
  console.log(count ? `[migrate] applied ${count} migration(s)` : "[migrate] up to date");
} catch (err) {
  console.error("[migrate] failed:", err);
  process.exitCode = 1;
} finally {
  await sql.end();
}

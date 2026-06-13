import { defineConfig } from "drizzle-kit";

// Used only for local tooling (drizzle-kit generate / studio).
// Runtime migrations are applied by scripts/migrate.mjs from drizzle/*.sql.
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgres://finance:finance@localhost:5433/finance",
  },
});

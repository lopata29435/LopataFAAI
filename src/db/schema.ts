import {
  pgTable,
  pgEnum,
  uuid,
  text,
  char,
  integer,
  bigint,
  numeric,
  boolean,
  date,
  timestamp,
} from "drizzle-orm/pg-core";

// --- enums -----------------------------------------------------------------
export const memberRole = pgEnum("member_role", ["owner", "adult", "child", "member"]);
export const accountType = pgEnum("account_type", ["cash", "card", "bank", "deposit", "broker", "other"]);
export const categoryKind = pgEnum("category_kind", ["expense", "income", "transfer"]);
export const txType = pgEnum("tx_type", ["expense", "income", "transfer"]);
export const txSource = pgEnum("tx_source", ["manual", "ai", "import", "recurring"]);
export const txScope = pgEnum("tx_scope", ["personal", "common"]);
export const txVisibility = pgEnum("tx_visibility", ["normal", "hidden"]);
export const envelopeTarget = pgEnum("envelope_target", ["common", "personal", "savings"]);

// --- core ------------------------------------------------------------------
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email"),
  oidcSub: text("oidc_sub"),
  oidcIssuer: text("oidc_issuer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const households = pgTable("households", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  baseCurrency: char("base_currency", { length: 3 }).notNull().default("RUB"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const householdMembers = pgTable("household_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: memberRole("role").notNull().default("member"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: accountType("type").notNull().default("card"),
  currency: char("currency", { length: 3 }).notNull().default("RUB"),
  openingBalanceMinor: bigint("opening_balance_minor", { mode: "number" }).notNull().default(0),
  isArchived: boolean("is_archived").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: uuid("owner_id").references(() => users.id, { onDelete: "cascade" }),
  householdId: uuid("household_id").references(() => households.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug"),
  parentId: uuid("parent_id"),
  kind: categoryKind("kind").notNull().default("expense"),
  icon: text("icon"),
  color: text("color"),
  sortOrder: integer("sort_order").notNull().default(0),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  datetime: timestamp("datetime", { withTimezone: true }).notNull().defaultNow(),
  amountMinor: bigint("amount_minor", { mode: "number" }).notNull(),
  currency: char("currency", { length: 3 }).notNull().default("RUB"),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  counterAccountId: uuid("counter_account_id").references(() => accounts.id, { onDelete: "set null" }),
  type: txType("type").notNull().default("expense"),
  counterparty: text("counterparty"),
  note: text("note"),
  source: txSource("source").notNull().default("manual"),
  scope: txScope("scope").notNull().default("personal"),
  visibility: txVisibility("visibility").notNull().default("normal"),
  hiddenUntil: timestamp("hidden_until", { withTimezone: true }),
  transferGroupId: uuid("transfer_group_id"),
  externalId: text("external_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const fxRates = pgTable("fx_rates", {
  id: uuid("id").primaryKey().defaultRandom(),
  onDate: date("on_date").notNull(),
  base: char("base", { length: 3 }).notNull(),
  quote: char("quote", { length: 3 }).notNull(),
  rate: numeric("rate", { precision: 20, scale: 10 }).notNull(),
  source: text("source"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const attachments = pgTable("attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id").notNull().references(() => transactions.id, { onDelete: "cascade" }),
  filePath: text("file_path").notNull(),
  mime: text("mime"),
  ocrText: text("ocr_text"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- family allocation (virtual envelopes) ---------------------------------
export const envelopes = pgTable("envelopes", {
  id: uuid("id").primaryKey().defaultRandom(),
  householdId: uuid("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
  memberUserId: uuid("member_user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  percent: numeric("percent", { precision: 5, scale: 2 }).notNull(),
  target: envelopeTarget("target").notNull().default("common"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

-- Phase 1 initial schema. Idempotent: safe to run repeatedly.
-- gen_random_uuid() is built into PostgreSQL core since v13.

DO $$ BEGIN CREATE TYPE member_role AS ENUM ('owner','adult','child','member'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE account_type AS ENUM ('cash','card','bank','deposit','broker','other'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE category_kind AS ENUM ('expense','income','transfer'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE tx_type AS ENUM ('expense','income','transfer'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE tx_source AS ENUM ('manual','ai','import','recurring'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE tx_scope AS ENUM ('personal','common'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE tx_visibility AS ENUM ('normal','hidden'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE envelope_target AS ENUM ('common','personal','savings'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS households (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  base_currency char(3) NOT NULL DEFAULT 'RUB',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS household_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, user_id)
);

CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type account_type NOT NULL DEFAULT 'card',
  currency char(3) NOT NULL DEFAULT 'RUB',
  opening_balance_minor bigint NOT NULL DEFAULT 0,
  is_archived boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS accounts_owner_idx ON accounts(owner_id);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES users(id) ON DELETE CASCADE,
  household_id uuid REFERENCES households(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text,
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  kind category_kind NOT NULL DEFAULT 'expense',
  icon text,
  color text,
  sort_order integer NOT NULL DEFAULT 0,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS categories_system_slug_idx ON categories(slug) WHERE owner_id IS NULL;
CREATE INDEX IF NOT EXISTS categories_owner_idx ON categories(owner_id);
CREATE INDEX IF NOT EXISTS categories_parent_idx ON categories(parent_id);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  datetime timestamptz NOT NULL DEFAULT now(),
  amount_minor bigint NOT NULL,
  currency char(3) NOT NULL DEFAULT 'RUB',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  type tx_type NOT NULL DEFAULT 'expense',
  counterparty text,
  note text,
  source tx_source NOT NULL DEFAULT 'manual',
  scope tx_scope NOT NULL DEFAULT 'personal',
  visibility tx_visibility NOT NULL DEFAULT 'normal',
  hidden_until timestamptz,
  transfer_group_id uuid,
  external_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS tx_user_datetime_idx ON transactions(user_id, datetime DESC);
CREATE INDEX IF NOT EXISTS tx_account_idx ON transactions(account_id);
CREATE INDEX IF NOT EXISTS tx_category_idx ON transactions(category_id);
CREATE INDEX IF NOT EXISTS tx_transfer_group_idx ON transactions(transfer_group_id);
CREATE INDEX IF NOT EXISTS tx_hidden_idx ON transactions(hidden_until) WHERE visibility = 'hidden';
CREATE UNIQUE INDEX IF NOT EXISTS tx_external_id_idx ON transactions(external_id) WHERE external_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS fx_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  on_date date NOT NULL,
  base char(3) NOT NULL,
  quote char(3) NOT NULL,
  rate numeric(20,10) NOT NULL,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (on_date, base, quote)
);

CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  mime text,
  ocr_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS attachments_tx_idx ON attachments(transaction_id);

CREATE TABLE IF NOT EXISTS envelopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  member_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  percent numeric(5,2) NOT NULL,
  target envelope_target NOT NULL DEFAULT 'common',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS envelopes_household_idx ON envelopes(household_id);

-- Phase: family/household (req5). Fully additive — single-user app keeps working.

ALTER TABLE households ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE households ADD COLUMN IF NOT EXISTS settings jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE household_members ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE household_members ADD COLUMN IF NOT EXISTS display_name text;

ALTER TABLE accounts ADD COLUMN IF NOT EXISTS household_id uuid REFERENCES households(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS accounts_household_idx ON accounts(household_id);

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS household_id uuid REFERENCES households(id) ON DELETE SET NULL;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS revealed_at timestamptz;
CREATE INDEX IF NOT EXISTS tx_household_datetime_idx ON transactions(household_id, datetime DESC) WHERE deleted_at IS NULL;

ALTER TABLE envelopes ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE envelopes ADD COLUMN IF NOT EXISTS effective_from date NOT NULL DEFAULT current_date;

CREATE TABLE IF NOT EXISTS allocation_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  member_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  income_tx_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  envelope_id uuid REFERENCES envelopes(id) ON DELETE SET NULL,
  target envelope_target NOT NULL,
  percent numeric(5,2) NOT NULL,
  amount_minor bigint NOT NULL,
  currency char(3) NOT NULL,
  period date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (income_tx_id, target)
);
CREATE INDEX IF NOT EXISTS alloc_household_period_target_idx ON allocation_lines(household_id, period, target);

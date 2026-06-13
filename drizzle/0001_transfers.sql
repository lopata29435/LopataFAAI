-- Phase 1.1: transfers between accounts (single-row model).
-- A transfer is one row: type='transfer', account_id = source, counter_account_id = destination.
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS counter_account_id uuid REFERENCES accounts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS tx_counter_account_idx ON transactions(counter_account_id);

-- Phase 1.5: link users to a ZITADEL (OIDC) identity.
ALTER TABLE users ADD COLUMN IF NOT EXISTS oidc_sub text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS oidc_issuer text;
CREATE UNIQUE INDEX IF NOT EXISTS users_oidc_idx ON users (oidc_issuer, oidc_sub) WHERE oidc_sub IS NOT NULL;

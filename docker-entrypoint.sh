#!/bin/sh
set -e

if [ "${AUTO_MIGRATE}" = "true" ]; then
  echo "[entrypoint] running migrations…"
  node scripts/migrate.mjs
fi

if [ "${AUTO_SEED}" = "true" ]; then
  echo "[entrypoint] running seed…"
  node scripts/seed.mjs
fi

echo "[entrypoint] starting Next.js…"
exec node server.js

#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env ]; then set -a; . ./.env; set +a; fi
if [ -n "${DB_PASSWORD:-}" ]; then export PGPASSWORD="$DB_PASSWORD"; fi

STAMP=$(date +%Y%m%d-%H%M%S)
OUT=../backups
mkdir -p "$OUT"

if [ -n "${DATABASE_URL:-}" ]; then
  pg_dump --no-owner "$DATABASE_URL" | gzip > "$OUT/db-$STAMP.sql.gz"
else
  pg_dump --no-owner -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "$DB_USER" "$DB_NAME" | gzip > "$OUT/db-$STAMP.sql.gz"
fi
tar -czf "$OUT/uploads-$STAMP.tar.gz" -C uploads .

echo "Backup saved in backups/ ($STAMP)"

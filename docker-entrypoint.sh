#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy 2>/dev/null || echo "Warning: migrations skipped (no pending migrations or DB not ready)"

echo "Running seed..."
npx prisma db seed 2>/dev/null || echo "Warning: seed skipped"

echo "Starting Next.js server..."
exec "$@"

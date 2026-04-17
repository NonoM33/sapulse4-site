#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy || echo "Warning: migrations skipped"

echo "Running seed..."
node prisma/seed-prod.mjs || echo "Warning: seed skipped"

echo "Starting Next.js server..."
exec "$@"

#!/bin/sh
set -e

echo "Running Prisma migrations..."
node node_modules/prisma/build/index.js migrate deploy || echo "Warning: migrations skipped"

echo "Running seed..."
node prisma/seed-prod.mjs || echo "Warning: seed skipped"

echo "Starting Next.js server..."
exec "$@"

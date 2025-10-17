#!/bin/sh
set -e

echo "Waiting for database to be ready..."
while ! pg_isready -h postgres -p 5432 -U $(echo $DATABASE_URL | sed -E 's/.*:\/\/(.*):.*/\1/') >/dev/null 2>&1; do
  sleep 2
done
echo "Database is ready."

echo "Applying database migrations..."
bunx prisma migrate deploy

echo "Running database seed script..."
bun prisma/seed.js

echo "Starting application..."
exec "$@"
#!/bin/sh
set -e

echo "Waiting for database to be ready..."
while ! pg_isready -h postgres -p 5432 -U $(echo $DATABASE_URL | sed -E 's/.*:\/\/(.*):.*/\1/') >/dev/null 2>&1; do
  sleep 2
done
echo "Database is ready."

echo "Applying database migrations..."
bunx prisma migrate dev --name init

echo "Running database seed script..."
bunx ts-node prisma/seed.ts

echo "Starting application..."
exec "$@"
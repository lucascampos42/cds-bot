#!/bin/sh
set -e

echo "Waiting for database to be ready..."
while ! pg_isready -h postgres -p 5432 -U $(echo $DATABASE_URL | sed -E 's/.*:\/\/(.*):.*/\1/') >/dev/null 2>&1; do
  sleep 2
done
echo "Database is ready."

# Generate the Prisma client for the correct environment
echo "Generating Prisma client..."
bunx prisma generate

# Apply database migrations
echo "Applying database migrations..."
bunx prisma migrate deploy

# Build and seed the database
echo "Building seed script..."
bun run build:seed
echo "Seeding database..."
bun prisma/seed.js

# Start the application
echo "Starting application..."
exec bun run start:dev
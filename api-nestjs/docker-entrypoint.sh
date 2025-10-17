#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Wait for the database to be ready
# The `while` loop continues as long as `pg_isready` fails.
# `pg_isready` is a utility that checks the connection status of a PostgreSQL server.
# -h specifies the host (postgres)
# -p specifies the port (5432)
# -U specifies the user (retrieved from the DATABASE_URL environment variable)
# `>/dev/null 2>&1` redirects stdout and stderr to /dev/null to suppress output.
echo "Waiting for database to be ready..."
while ! pg_isready -h postgres -p 5432 -U $(echo $DATABASE_URL | sed -E 's/.*:\/\/(.*):.*/\1/') >/dev/null 2>&1; do
  sleep 2
done
echo "Database is ready."

# Apply migrations
# `bunx prisma migrate deploy` is the recommended way to apply migrations in a production environment.
# It applies all pending migrations from the prisma/migrations folder.
echo "Applying database migrations..."
bunx prisma migrate deploy

# Run the seed script (assuming it's compiled to JavaScript)
# This command executes the compiled seed script using Bun.
echo "Running database seed script..."
bun prisma/seed.js

# Execute the main command (passed as arguments to this script)
# `$@` represents all the arguments that were passed to the shell script.
# In the Dockerfile, this will be `bun ./dist/src/main.js`.
echo "Starting application..."
exec "$@"
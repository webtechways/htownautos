#!/bin/bash
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=libs/prisma/prisma/schema.prisma

echo "Starting all services..."
node dist/apps/api/src/main.js &
node dist/apps/image-service/src/main.js &
node dist/apps/ai-services/src/main.js &
node dist/apps/data-sync/src/main.js &

wait -n
exit $?

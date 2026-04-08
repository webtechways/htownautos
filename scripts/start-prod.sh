#!/bin/bash
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=libs/prisma/prisma/schema.prisma

echo "Starting services..."
node dist/apps/api/src/main.js &

# Optional microservices — start only if built
[ -f dist/apps/image-service/src/main.js ] && node dist/apps/image-service/src/main.js &
[ -f dist/apps/ai-services/src/main.js ] && node dist/apps/ai-services/src/main.js &
[ -f dist/apps/data-sync/src/main.js ] && node dist/apps/data-sync/src/main.js &

wait -n
exit $?

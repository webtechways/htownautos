#!/bin/bash
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=libs/prisma/prisma/schema.prisma

echo "Starting services..."

# Find the actual main.js path (handles both dist structures)
API_MAIN=$(find dist -path "*/api/src/main.js" -type f | head -1)
if [ -z "$API_MAIN" ]; then
  echo "ERROR: Cannot find API main.js in dist/"
  exit 1
fi

node "$API_MAIN" &

# Optional microservices
for svc in image-service ai-services data-sync; do
  SVC_MAIN=$(find dist -path "*/$svc/src/main.js" -type f 2>/dev/null | head -1)
  [ -n "$SVC_MAIN" ] && node "$SVC_MAIN" &
done

wait -n
exit $?

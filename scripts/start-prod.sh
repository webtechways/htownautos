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

# Start API as the main process
echo "Starting API: $API_MAIN"
node "$API_MAIN" &
API_PID=$!

# Optional microservices — start but don't crash if they fail
for svc in image-service ai-services data-sync; do
  SVC_MAIN=$(find dist -path "*/$svc/src/main.js" -type f 2>/dev/null | head -1)
  if [ -n "$SVC_MAIN" ]; then
    echo "Starting $svc: $SVC_MAIN"
    node "$SVC_MAIN" 2>&1 | sed "s/^/[$svc] /" &
  fi
done

# Only wait on the API process — if it dies, container restarts
wait $API_PID
exit $?

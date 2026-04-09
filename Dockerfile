# ---- Build Stage ----
FROM node:20-bookworm AS builder

WORKDIR /app

# Force development mode during build so devDependencies (nx, typescript, etc.) are installed
ENV NODE_ENV=development

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.base.json tsconfig.json nx.json prisma.config.ts ./
COPY apps ./apps
COPY libs ./libs

# Generate Prisma client
RUN npx prisma generate --schema=libs/prisma/prisma/schema.prisma

# Build all NX apps sequentially
RUN npx nx run-many --target=build --parallel=1

# ---- Production Stage ----
FROM node:20-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/libs/prisma/prisma ./libs/prisma/prisma
COPY prisma.config.ts ./
RUN npx prisma generate --schema=libs/prisma/prisma/schema.prisma

COPY --from=builder /app/dist ./dist

# Create symlinks for all @htownautos/* workspace packages so they resolve at runtime.
# NX compiles them into dist/ — we create symlinks to the compiled output.
RUN mkdir -p node_modules/@htownautos && \
    # Libs from libs/ folder (compiled into dist/apps/api/libs/<lib>/src/)
    for lib in $(ls dist/apps/api/libs/ 2>/dev/null); do \
      [ -d "dist/apps/api/libs/$lib/src" ] && \
        ln -sf /app/dist/apps/api/libs/$lib/src node_modules/@htownautos/$lib; \
    done && \
    # Cross-app libs (media, tts, carfax-analyzer, damage-detector)
    [ -d "dist/apps/api/apps/image-service/src/media" ] && \
      ln -sf /app/dist/apps/api/apps/image-service/src/media node_modules/@htownautos/media; \
    [ -d "dist/apps/api/apps/ai-services/src/tts" ] && \
      ln -sf /app/dist/apps/api/apps/ai-services/src/tts node_modules/@htownautos/tts; \
    [ -d "dist/apps/api/apps/ai-services/src/carfax-analyzer" ] && \
      ln -sf /app/dist/apps/api/apps/ai-services/src/carfax-analyzer node_modules/@htownautos/carfax-analyzer; \
    [ -d "dist/apps/api/apps/ai-services/src/damage-detector" ] && \
      ln -sf /app/dist/apps/api/apps/ai-services/src/damage-detector node_modules/@htownautos/damage-detector; \
    echo "Symlinks created:" && ls -la node_modules/@htownautos/

COPY scripts/start-prod.sh ./start-prod.sh
RUN chmod +x start-prod.sh

EXPOSE 3000 3002 3003 3004

CMD ["./start-prod.sh"]

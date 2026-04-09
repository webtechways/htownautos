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

# Build all NX apps (sequential to avoid OOM on limited memory servers)
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

COPY scripts/start-prod.sh ./start-prod.sh
RUN chmod +x start-prod.sh

EXPOSE 3000 3002 3003 3004

CMD ["./start-prod.sh"]

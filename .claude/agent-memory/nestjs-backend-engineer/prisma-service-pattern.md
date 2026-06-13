---
name: prisma-service-wrapper
description: PrismaService is a manual wrapper class in libs/prisma/src/prisma.service.ts — every new Prisma model needs an explicit getter added
metadata:
  type: project
---

PrismaService wraps PrismaClient and exposes each model as an explicit getter method. It does NOT extend PrismaClient. Located at `libs/prisma/src/prisma.service.ts`.

**Why:** The project uses `@prisma/adapter-pg` (PrismaPg) which requires constructor-time adapter injection — can't use the typical `extends PrismaClient` pattern with global middleware.

**How to apply:** After any schema change that adds a new model, you MUST add a getter to PrismaService OR TypeScript will emit TS2551 errors claiming "Did you mean partOrder?" on any new model access. Pattern:

```ts
get myNewModel() {
  return this.prisma.myNewModel;
}
```

The `node_modules/.prisma/client/index.d.ts` will have the model typed correctly — the issue is always the wrapper.

Models added during portal build: `customerLedgerEntry`, `portalOrder` (added 2026-06-12).

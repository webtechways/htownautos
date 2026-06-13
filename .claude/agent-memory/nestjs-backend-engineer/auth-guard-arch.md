---
name: auth-guard-architecture
description: Global guards (ApiKeyGuard → ClerkJwtGuard → TenantGuard) apply to ALL routes; portal customer auth uses a separate non-global CustomerGuard
metadata:
  type: project
---

## Global guard chain (AuthModule)
Registered as APP_GUARD, they run for every request in order:
1. `ApiKeyGuard` — X-API-Key header; stamps request.user + request.tenant, skips downstream.
2. `ClerkJwtGuard` — Clerk JWT; looks up staff User record, sets request.user + request.clerkOrgId.
3. `TenantGuard` — resolves tenant from clerkOrgId or X-Tenant-Id header; enforces membership.

Staff tokens carry `org_id` in the JWT. The ClerkJwtGuard reads `payload.org_id || payload.o?.id`.

## Customer portal guard (CustomerGuard)
Located: `libs/auth/src/guards/customer.guard.ts`

Applied via `@UseGuards(CustomerGuard)` or `@CustomerAuth()` decorator at controller level — NOT global.

**Key distinction:** CustomerGuard REJECTS tokens with an org_id (staff) with ForbiddenException. Customer tokens have no org_id.

**Auto-provision:** On first portal login, creates a Buyer row in the canonical portal tenant (50197477-9e89-4465-bed5-99c638c435a0). Idempotent via unique clerkUserId constraint + P2002 race guard.

**Request shape after CustomerGuard:** `request.buyer: PortalBuyer`, `request.tenantId: string`.

## Decorators
- `@CurrentBuyer()` — extracts `request.buyer` (PortalBuyer)
- `@CustomerAuth()` — composite: `@UseGuards(CustomerGuard)`
- `@CurrentUser()` — extracts `request.user` (AuthenticatedUser, staff only)
- `@CurrentTenant()` — extracts `request.tenant.id` (staff only)

## IMPORTANT: Portal routes and global ClerkJwtGuard
Since ClerkJwtGuard is global, it also runs on portal routes. It will proceed normally for customer tokens (no org_id means it creates/finds a User row). This is harmless but slightly wasteful — the ClerkJwtGuard's output (request.user) is ignored by portal routes which use request.buyer instead.

TODO: Consider marking portal routes with a custom decorator to skip the staff guard chain, but for now the overhead is acceptable.

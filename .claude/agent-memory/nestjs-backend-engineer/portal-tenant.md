---
name: portal-tenant-constant
description: Canonical portal tenant ID for htownautos.com — all portal customers belong to this tenant
metadata:
  type: project
---

**Portal tenant ID:** `50197477-9e89-4465-bed5-99c638c435a0`
**Slug/subdomain:** `htownautos`
**Constant location:** `libs/auth/src/guards/customer.guard.ts` → `PORTAL_TENANT_ID`

**Why:** htownautos.com is the single customer-facing portal. Multi-tenant isolation still applies — every portal query scopes to this tenantId. Staff from other tenants cannot access portal data.

**How to apply:** CustomerGuard always sets `request.tenantId = PORTAL_TENANT_ID` (via `buyer.tenantId`). Portal service methods always use `buyer.tenantId`, never hardcode the UUID.

## Env vars introduced by portal build
- `PORTAL_INSPECTION_FEE_USD` — inspection fee in cents (integer string), default 4900 ($49.00)
- `PORTAL_BASE_URL` — base URL for Stripe success/cancel redirects, default `https://htownautos.com`
- `STRIPE_SECRET_KEY` — already existed, reused
- `CLERK_SECRET_KEY` — already existed, reused by CustomerGuard

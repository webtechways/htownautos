---
name: feedback-best-effort-clerk
description: Pattern for best-effort Clerk account creation on staff-created buyers — wraps in try/catch, never blocks staff workflow
metadata:
  type: feedback
---

When linking a Clerk account to a buyer created by staff, always use best-effort (try/catch that swallows all errors and logs a warning). A Clerk API failure must NOT fail the buyer create/update endpoint — staff workflow takes priority and the CustomerGuard email-link flow is the fallback.

**Why:** Staff create buyers in the dashboard in bulk; a transient Clerk 5xx or rate-limit must not cascade into a 500 for the staff member.

**How to apply:** Wrap the entire Clerk call + Prisma update in a single try/catch inside a private `linkClerkAccount()` helper. Log at `warn` level on catch. Then re-fetch the buyer row to pick up the new clerkUserId before returning — but only if the linkage succeeded (check the updated row exists).

Related: [[auth-guard-arch]], [[portal-tenant]]

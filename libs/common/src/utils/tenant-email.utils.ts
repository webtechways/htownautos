import type { PrismaClient } from '@prisma/client';

const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || 'htownautos.com';

type TxClient = Pick<PrismaClient, 'tenantUser'> | any;

/**
 * Slugify a string for use as a tenant-local username:
 * - lowercase
 * - only a-z0-9.-
 * - collapse repeats, trim leading/trailing punctuation
 */
export function slugifyUsername(input: string): string {
  const cleaned = (input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/^[.\-_]+|[.\-_]+$/g, '')
    .replace(/[-_.]{2,}/g, '-');
  return cleaned || 'user';
}

/** Best-effort base username from a user's email or name. */
export function baseUsernameForUser(user: {
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}): string {
  if (user.email) {
    const localPart = user.email.split('@')[0] || '';
    const slug = slugifyUsername(localPart);
    if (slug) return slug;
  }
  const fromName = slugifyUsername(`${user.firstName || ''}-${user.lastName || ''}`);
  if (fromName && fromName !== 'user') return fromName;
  return 'user';
}

/**
 * Find a unique username within a tenant. If the base is taken by another
 * TenantUser, suffixes -2, -3, ... are tried until one is free.
 */
export async function findAvailableUsername(
  prisma: TxClient,
  tenantId: string,
  base: string,
  excludeTenantUserId?: string,
): Promise<string> {
  const slug = slugifyUsername(base);
  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? slug : `${slug}-${i + 1}`;
    const clash = await prisma.tenantUser.findFirst({
      where: {
        tenantId,
        username: candidate,
        ...(excludeTenantUserId ? { NOT: { id: excludeTenantUserId } } : {}),
      },
      select: { id: true },
    });
    if (!clash) return candidate;
  }
  // Extremely unlikely fallback
  return `${slug}-${Date.now().toString(36)}`;
}

/**
 * Build the full tenant email for a given username + tenant subdomain.
 * Returns null if the tenant has no subdomain (email can't be routed).
 */
export function buildTenantEmail(
  username: string,
  subdomain: string | null | undefined,
): string | null {
  if (!subdomain) return null;
  return `${username}@${subdomain}.${EMAIL_DOMAIN}`;
}

/**
 * Full resolution: pick a username (unique within tenant) and compute tenantEmail.
 * Use this when creating a TenantUser from a path that doesn't already have a
 * username (e.g. auto-provisioning via Clerk webhook / TenantGuard).
 */
export async function resolveTenantUserIdentity(
  prisma: TxClient,
  tenantId: string,
  user: { email?: string | null; firstName?: string | null; lastName?: string | null },
  subdomain: string | null | undefined,
  excludeTenantUserId?: string,
): Promise<{ username: string; tenantEmail: string | null }> {
  const base = baseUsernameForUser(user);
  const username = await findAvailableUsername(prisma, tenantId, base, excludeTenantUserId);
  const tenantEmail = buildTenantEmail(username, subdomain);
  return { username, tenantEmail };
}

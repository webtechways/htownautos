import type { PrismaClient } from '@prisma/client';
type TxClient = Pick<PrismaClient, 'tenantUser'> | any;
export declare function slugifyUsername(input: string): string;
export declare function baseUsernameForUser(user: {
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
}): string;
export declare function findAvailableUsername(prisma: TxClient, tenantId: string, base: string, excludeTenantUserId?: string): Promise<string>;
export declare function buildTenantEmail(username: string, subdomain: string | null | undefined): string | null;
export declare function resolveTenantUserIdentity(prisma: TxClient, tenantId: string, user: {
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
}, subdomain: string | null | undefined, excludeTenantUserId?: string): Promise<{
    username: string;
    tenantEmail: string | null;
}>;
export {};

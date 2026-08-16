import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@htownautos/prisma';
export interface ClerkTokenPayload {
    sub: string;
    org_id?: string;
    org_role?: string;
    org_slug?: string;
    email?: string;
    email_verified?: boolean;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    image_url?: string;
}
export interface AuthenticatedUser {
    id: string;
    clerkUserId: string;
    email: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    avatar: string | null;
    isActive: boolean;
    emailVerified: boolean;
    tenants: Array<{
        id: string;
        tenantId: string;
        roleId: string;
        isActive: boolean;
        tenant: {
            id: string;
            name: string;
            slug: string;
        };
    }>;
}
export declare class ClerkJwtGuard implements CanActivate {
    private reflector;
    private prisma;
    private readonly logger;
    constructor(reflector: Reflector, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractToken;
    private extractUserMeta;
    private getOrCreateUser;
    private getClientIp;
    private createAuthAuditLog;
}

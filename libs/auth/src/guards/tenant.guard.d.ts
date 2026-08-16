import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@htownautos/prisma';
export declare const TENANT_OPTIONAL_KEY = "tenantOptional";
export declare const TENANT_ERROR_CODE = "TENANT_REQUIRED";
export declare class TenantGuard implements CanActivate {
    private reflector;
    private prisma;
    private readonly logger;
    constructor(reflector: Reflector, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private autoProvisionMembership;
}

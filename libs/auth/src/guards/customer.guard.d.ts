import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
export declare const PORTAL_TENANT_ID = "50197477-9e89-4465-bed5-99c638c435a0";
export interface PortalBuyer {
    id: string;
    tenantId: string;
    clerkUserId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneMain: string;
    phoneMobile: string | null;
    phoneSecondary: string | null;
    currentAddress: string;
    currentCity: string;
    currentState: string;
    currentZipCode: string;
    currentCountry: string;
    stripeCustomerId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export declare class CustomerGuard implements CanActivate {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractToken;
    private extractUserMeta;
    private mergeEmailDuplicates;
    private getOrProvisionBuyer;
}

import { PrismaService } from '@htownautos/prisma';
export declare class ClerkWebhooksController {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleWebhook(req: any): Promise<{
        received: boolean;
    }>;
    private handleMembershipCreated;
    private handleMembershipUpdated;
    private handleMembershipDeleted;
    private handleOrganizationCreated;
    private handleOrganizationDeleted;
}

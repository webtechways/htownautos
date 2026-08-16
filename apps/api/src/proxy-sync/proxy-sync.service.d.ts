import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
export declare class ProxySyncService implements OnModuleInit {
    private readonly prisma;
    private readonly logger;
    private readonly endpoint;
    private readonly apiKey;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    syncProxies(): Promise<void>;
    private fetchAllProxies;
}

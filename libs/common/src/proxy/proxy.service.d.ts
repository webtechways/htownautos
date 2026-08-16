import { PrismaService } from '@htownautos/prisma';
export declare class ProxyService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getRandomProxy(): Promise<string | null>;
    fetchViaProxy(url: string): Promise<Response>;
}

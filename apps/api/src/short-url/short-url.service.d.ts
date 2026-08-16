import { PrismaService } from '@htownautos/prisma';
export declare class ShortUrlService {
    private readonly prisma;
    private readonly baseUrl;
    constructor(prisma: PrismaService);
    create(originalUrl: string, tenantId: string, createdBy?: string, expiresAt?: Date): Promise<{
        shortUrl: string;
        code: string;
    }>;
    buildShortUrl(code: string): string;
    resolve(code: string): Promise<string>;
    private generateCode;
}

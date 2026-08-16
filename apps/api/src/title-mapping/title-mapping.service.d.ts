import { PrismaService } from '@htownautos/prisma';
import { type TitleOverrides } from '@htownautos/common';
export declare class TitleMappingService {
    private readonly prisma;
    private cache;
    constructor(prisma: PrismaService);
    getOverrides(): Promise<TitleOverrides>;
    list(): Promise<Array<{
        code: string;
        category: string;
    }>>;
    setMapping(code: string, category: string, assignedById: string | null): Promise<{
        code: string;
        category: string;
    }>;
    removeMapping(code: string): Promise<void>;
}

import { PrismaService } from '@htownautos/prisma';
export declare class AuctionFacetsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    makes(params: {
        yearFrom?: number;
        yearTo?: number;
    }): Promise<string[]>;
    models(params: {
        make: string;
        yearFrom?: number;
        yearTo?: number;
    }): Promise<string[]>;
    trims(params: {
        make: string;
        models: string[];
        yearFrom?: number;
        yearTo?: number;
    }): Promise<string[]>;
    colors(): Promise<string[]>;
    titleTypes(): Promise<string[]>;
    yearBounds(): Promise<{
        min: number | null;
        max: number | null;
    }>;
}

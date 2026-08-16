import { PrismaService } from '@htownautos/prisma';
export declare class WantedMatchNotifierService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    notifyNewListings(newLotNumberStrings: string[]): Promise<number>;
}

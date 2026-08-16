import { PrismaService } from '@htownautos/prisma';
import { OpenSearchService } from './opensearch.service';
export declare class AuctionSyncService {
    private readonly prisma;
    private readonly openSearchService;
    private readonly logger;
    private readonly BATCH_SIZE;
    constructor(prisma: PrismaService, openSearchService: OpenSearchService);
    syncAllCopart(): Promise<{
        success: number;
        failed: number;
        total: number;
    }>;
    syncAll(): Promise<{
        copart: {
            success: number;
            failed: number;
            total: number;
        };
    }>;
    indexCopartListing(listing: any): Promise<boolean>;
    indexCopartListings(listings: any[]): Promise<{
        success: number;
        failed: number;
    }>;
    deleteCopartListing(lotNumber: string): Promise<boolean>;
    private mapCopartToUnified;
    getSyncStats(): Promise<{
        copartInDb: number;
        totalInIndex: number;
    }>;
}

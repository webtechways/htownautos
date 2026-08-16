import { AuctionSearchService } from './auction-search.service';
import { AuctionSyncService, AuctionIndexService } from '@htownautos/opensearch';
import { RabbitMQService } from '@htownautos/rabbitmq';
import { SearchAuctionsDto } from './dto/search-auctions.dto';
import { DiscardAuctionDto } from './dto/discard-auction.dto';
import { UpsertAnalysisSnapshotDto } from './dto/upsert-analysis-snapshot.dto';
import { PrismaService } from '@htownautos/prisma';
export declare class AuctionSearchController {
    private readonly searchService;
    private readonly syncService;
    private readonly indexService;
    private readonly rabbitMQ;
    private readonly prisma;
    constructor(searchService: AuctionSearchService, syncService: AuctionSyncService, indexService: AuctionIndexService, rabbitMQ: RabbitMQService, prisma: PrismaService);
    search(dto: SearchAuctionsDto): Promise<import("@htownautos/opensearch").AuctionSearchResult>;
    getFilterOptions(dto: SearchAuctionsDto): Promise<import("@htownautos/opensearch").AuctionAggregations>;
    getCopartGallery(id: string, bypass?: string): Promise<import("./auction-search.service").GalleryResponse>;
    getLastSync(): Promise<{
        lastSyncAt: Date | null;
        totalListings: number;
    }>;
    importCopart(): Promise<{
        queued: boolean;
        kind: string;
    }>;
    recreateAndImport(): Promise<{
        queued: boolean;
        kind: string;
    }>;
    syncAll(): Promise<{
        queued: boolean;
        kind: string;
    }>;
    syncCopart(): Promise<{
        queued: boolean;
        kind: string;
    }>;
    getSyncStats(): Promise<{
        copartInDb: number;
        totalInIndex: number;
    }>;
    getSyncStatus(): Promise<{
        status: string;
        source: string;
        startedAt: Date;
        finishedAt: Date | null;
        phase: string | null;
        progress: number | null;
        processedRows: number | null;
        totalRows: number | null;
        bytesDownloaded: number | null;
        rowsParsed: number;
        rowsUpserted: number;
        rowsStaleMarked: number;
        durationMs: number | null;
    } | {
        status: string;
        progress: number;
    }>;
    getIndexStats(): Promise<any>;
    recreateIndex(): Promise<{
        queued: boolean;
        kind: string;
    }>;
    refreshCopartBid(lotNumber: string): Promise<{
        lotNumber: string;
        highBid: number | null;
    }>;
    discardAuction(source: 'copart' | 'iaai', sourceId: string, dto: DiscardAuctionDto, userId: string): Promise<{
        lotNumber: string;
        discarded: boolean;
        discardReason: string | null;
        discardedAt: Date | null;
    }>;
    upsertAnalysisSnapshot(sourceId: string, dto: UpsertAnalysisSnapshotDto): Promise<{
        ok: true;
    }>;
    getAnalysisSnapshots(sourceId: string): Promise<{
        data: Record<string, unknown>;
    }>;
    findBySourceId(source: 'copart' | 'iaai', sourceId: string): Promise<(Omit<import("@htownautos/opensearch").UnifiedAuction, "discarded" | "discardReason" | "discardedAt"> & import("./auction-search.service").DiscardFields) | {
        error: string;
        source: "copart" | "iaai";
        sourceId: string;
    }>;
    private publishSync;
}

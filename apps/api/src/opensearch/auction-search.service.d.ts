import { OpenSearchService, AuctionSyncService } from '@htownautos/opensearch';
import type { UnifiedAuction, AuctionAggregations, AuctionSearchResult } from '@htownautos/opensearch';
import { PrismaService } from '@htownautos/prisma';
import { RabbitMQService } from '@htownautos/rabbitmq';
import { ProxyService } from '@htownautos/common';
import { TitleMappingService } from '../title-mapping/title-mapping.service';
import { AuctionAnalysisType } from '@prisma/client';
import { SearchAuctionsDto } from './dto/search-auctions.dto';
export interface DiscardFields {
    discarded: boolean;
    discardReason: string | null;
    discardedAt: Date | null;
}
export interface GalleryImage {
    sequence: number;
    thumbnail: string;
    fullSize: string;
}
export interface GalleryResponse {
    lotNumber: string;
    imageCount: number;
    images: GalleryImage[];
}
export declare const GALLERY_CACHE_QUEUE = "gallery.cache";
export declare class AuctionSearchService {
    private readonly openSearchService;
    private readonly prisma;
    private readonly rabbitMQ;
    private readonly proxyService;
    private readonly syncService;
    private readonly titleMapping;
    private readonly logger;
    constructor(openSearchService: OpenSearchService, prisma: PrismaService, rabbitMQ: RabbitMQService, proxyService: ProxyService, syncService: AuctionSyncService, titleMapping: TitleMappingService);
    search(dto: SearchAuctionsDto): Promise<AuctionSearchResult>;
    private getTodayAsInt;
    private buildQuery;
    private buildSort;
    private getSortField;
    private buildAggregations;
    private parseAggregations;
    getFilterOptions(dto?: SearchAuctionsDto): Promise<AuctionAggregations>;
    findById(id: string): Promise<UnifiedAuction | null>;
    findBySourceId(source: 'copart' | 'iaai', sourceId: string): Promise<(Omit<UnifiedAuction, 'discarded' | 'discardReason' | 'discardedAt'> & DiscardFields) | null>;
    getDiscardFields(sourceId: string): Promise<DiscardFields | null>;
    discardListing(sourceId: string, discarded: boolean, reason: string | undefined, userId: string | null): Promise<{
        lotNumber: string;
        discarded: boolean;
        discardReason: string | null;
        discardedAt: Date | null;
    }>;
    refreshHighBid(lotNumberStr: string): Promise<{
        lotNumber: string;
        highBid: number | null;
    }>;
    getLastSyncTime(): Promise<{
        lastSyncAt: Date | null;
        totalListings: number;
    }>;
    getCopartGalleryRaw(lotNumberStr: string): Promise<GalleryResponse>;
    getCopartGallery(lotNumberStr: string): Promise<GalleryResponse>;
    private fetchCopartImages;
    cleanupExpiredGalleryCache(): Promise<void>;
    upsertAnalysisSnapshot(sourceId: string, type: AuctionAnalysisType, data: Record<string, unknown>): Promise<{
        ok: true;
    }>;
    getAnalysisSnapshots(sourceId: string): Promise<{
        data: Record<string, unknown>;
    }>;
}

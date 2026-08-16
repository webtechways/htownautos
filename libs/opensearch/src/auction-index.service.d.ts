import { OnModuleInit } from '@nestjs/common';
import { OpenSearchService } from './opensearch.service';
export declare const AUCTION_INDEX_NAME = "auction_listings";
export declare class AuctionIndexService implements OnModuleInit {
    private readonly openSearchService;
    private readonly logger;
    constructor(openSearchService: OpenSearchService);
    onModuleInit(): Promise<void>;
    ensureIndex(): Promise<boolean>;
    createIndex(): Promise<boolean>;
    deleteIndex(): Promise<boolean>;
    recreateIndex(): Promise<boolean>;
    getIndexStats(): Promise<any>;
    private formatBytes;
}

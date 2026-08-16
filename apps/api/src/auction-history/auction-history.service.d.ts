export interface AuctionRecord {
    sale_index?: number | string;
    price?: string | number;
    'sale status'?: string;
    vname?: string;
    'lot-number'?: string;
    'car-features'?: unknown;
    'title-and-condition'?: unknown;
    'technical-specs'?: unknown;
    'sale-date-location'?: unknown;
    'listing-history'?: unknown;
    year?: string | number;
    make?: string;
    model?: string;
    images?: string[];
    'market-value'?: unknown;
    vin?: string;
    [key: string]: unknown;
}
export interface AuctionHistoryResponse {
    status: string;
    vin: string;
    data: AuctionRecord[];
}
export declare class AuctionHistoryService {
    private readonly logger;
    private extractProviderMessage;
    getAuctionHistory(vin: string): Promise<AuctionHistoryResponse>;
}

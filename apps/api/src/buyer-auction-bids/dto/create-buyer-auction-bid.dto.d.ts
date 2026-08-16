export declare class BidItemDto {
    lotNumber: string;
    maxBid: number;
    notes?: string;
}
export declare class CreateBuyerAuctionBidsDto {
    items: BidItemDto[];
}

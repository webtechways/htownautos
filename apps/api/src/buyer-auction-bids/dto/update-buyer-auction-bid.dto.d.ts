export declare class UpdateBuyerAuctionBidDto {
    maxBid?: number;
    status?: 'pending' | 'won' | 'lost';
    finalAmount?: number | null;
    notes?: string;
}

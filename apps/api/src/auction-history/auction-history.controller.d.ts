import { AuctionHistoryService } from './auction-history.service';
export declare class AuctionHistoryController {
    private readonly auctionHistoryService;
    constructor(auctionHistoryService: AuctionHistoryService);
    getAuctionHistory(vin: string): Promise<import("./auction-history.service").AuctionHistoryResponse>;
}

import { BuyerAuctionBidsService } from './buyer-auction-bids.service';
import { CreateBuyerAuctionBidsDto } from './dto/create-buyer-auction-bid.dto';
import { UpdateBuyerAuctionBidDto } from './dto/update-buyer-auction-bid.dto';
export declare class BuyerAuctionBidsController {
    private readonly service;
    constructor(service: BuyerAuctionBidsService);
    list(tenantId: string, buyerId: string): Promise<any[]>;
    create(tenantId: string, userId: string, buyerId: string, dto: CreateBuyerAuctionBidsDto): Promise<any>;
    update(tenantId: string, buyerId: string, id: string, dto: UpdateBuyerAuctionBidDto): Promise<any>;
    remove(tenantId: string, buyerId: string, id: string): Promise<{
        deleted: boolean;
    }>;
}

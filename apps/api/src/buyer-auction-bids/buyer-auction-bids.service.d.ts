import { PrismaService } from '@htownautos/prisma';
import { BidItemDto } from './dto/create-buyer-auction-bid.dto';
import { UpdateBuyerAuctionBidDto } from './dto/update-buyer-auction-bid.dto';
export declare class BuyerAuctionBidsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private ensureBuyer;
    list(buyerId: string, tenantId: string): Promise<any[]>;
    createMany(buyerId: string, tenantId: string, userId: string | null, items: BidItemDto[]): Promise<any>;
    update(id: string, buyerId: string, tenantId: string, dto: UpdateBuyerAuctionBidDto): Promise<any>;
    remove(id: string, buyerId: string, tenantId: string): Promise<{
        deleted: boolean;
    }>;
}

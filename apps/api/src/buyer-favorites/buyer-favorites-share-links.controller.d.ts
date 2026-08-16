import { BuyerFavoritesShareLinksService } from './buyer-favorites-share-links.service';
import { CreateFavoritesShareLinkDto } from './dto/create-favorites-share-link.dto';
export declare class BuyerFavoritesShareLinksController {
    private readonly service;
    constructor(service: BuyerFavoritesShareLinksService);
    create(tenantId: string, userId: string, buyerId: string, dto: CreateFavoritesShareLinkDto): Promise<{
        token: string;
        url: string;
        shortUrl: string | null;
        expiresAt: Date | null;
    }>;
    resolvePublic(token: string): Promise<{
        buyerName: string;
        expiresAt: Date | null;
        items: {
            id: string;
            lotNumber: string;
            createdAt: Date;
            listing: {
                lotNumber: string;
                inspectable: boolean;
            } | null;
        }[];
    }>;
    removePublic(lotNumber: string, token: string): Promise<{
        ok: boolean;
    }>;
}

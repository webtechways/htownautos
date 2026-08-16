import { BuyerFavoritesService } from './buyer-favorites.service';
import { ToggleBuyerFavoriteDto } from './dto/toggle-buyer-favorite.dto';
export declare class BuyerFavoritesController {
    private readonly service;
    constructor(service: BuyerFavoritesService);
    list(tenantId: string, buyerId: string): Promise<{
        id: string;
        lotNumber: string;
        createdAt: Date;
        listing: {
            lotNumber: string;
            inspectable: boolean;
        } | null;
    }[]>;
    add(tenantId: string, buyerId: string, dto: ToggleBuyerFavoriteDto): Promise<{
        id: string;
        lotNumber: string;
        added: boolean;
    }>;
    remove(buyerId: string, lotNumber: string): Promise<{
        lotNumber: string;
        removed: boolean;
    }>;
}

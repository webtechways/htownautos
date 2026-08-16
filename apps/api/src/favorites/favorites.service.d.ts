import { PrismaService } from '@htownautos/prisma';
import { FavoriteType } from './dto/toggle-favorite.dto';
export declare class FavoritesService {
    private prisma;
    constructor(prisma: PrismaService);
    addFavorite(tenantId: string, userId: string, listingId: string, type: FavoriteType): Promise<{
        id: string;
        type: FavoriteType;
        listingId: string;
        added: boolean;
    }>;
    removeFavorite(tenantId: string, userId: string, listingId: string, type: FavoriteType): Promise<{
        type: FavoriteType;
        listingId: string;
        removed: boolean;
    }>;
    getFavoriteIds(tenantId: string, userId: string, type: FavoriteType): Promise<string[]>;
    isFavorite(tenantId: string, userId: string, listingId: string, type: FavoriteType): Promise<boolean>;
}

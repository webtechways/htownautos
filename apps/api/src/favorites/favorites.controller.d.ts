import { FavoritesService } from './favorites.service';
import { ToggleFavoriteDto, FavoriteType } from './dto/toggle-favorite.dto';
export declare class FavoritesController {
    private readonly favoritesService;
    constructor(favoritesService: FavoritesService);
    addFavorite(tenantId: string, user: {
        id: string;
    }, dto: ToggleFavoriteDto): Promise<{
        id: string;
        type: FavoriteType;
        listingId: string;
        added: boolean;
    }>;
    removeFavorite(tenantId: string, user: {
        id: string;
    }, dto: ToggleFavoriteDto): Promise<{
        type: FavoriteType;
        listingId: string;
        removed: boolean;
    }>;
    getFavoriteIds(tenantId: string, user: {
        id: string;
    }, type: FavoriteType): Promise<{
        ids: string[];
    }>;
    checkFavorite(tenantId: string, user: {
        id: string;
    }, listingId: string, type: FavoriteType): Promise<{
        isFavorite: boolean;
    }>;
}

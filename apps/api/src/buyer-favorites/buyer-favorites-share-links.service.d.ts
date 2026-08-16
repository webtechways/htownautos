import { PrismaService } from '@htownautos/prisma';
import { ShortUrlService } from '../short-url/short-url.service';
import { BuyerFavoritesService } from './buyer-favorites.service';
import { CreateFavoritesShareLinkDto } from './dto/create-favorites-share-link.dto';
export declare class BuyerFavoritesShareLinksService {
    private readonly prisma;
    private readonly shortUrl;
    private readonly favoritesService;
    private readonly logger;
    private readonly frontendUrl;
    constructor(prisma: PrismaService, shortUrl: ShortUrlService, favoritesService: BuyerFavoritesService);
    private buildLongUrl;
    private ensureBuyer;
    private resolveLink;
    create(buyerId: string, tenantId: string, userId: string | null, dto: CreateFavoritesShareLinkDto): Promise<{
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
    removePublic(token: string, lotNumber: string): Promise<{
        ok: boolean;
    }>;
}

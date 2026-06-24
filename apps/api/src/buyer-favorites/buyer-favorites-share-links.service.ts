import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '@htownautos/prisma';
import { ShortUrlService } from '../short-url/short-url.service';
import { BuyerFavoritesService } from './buyer-favorites.service';
import { CreateFavoritesShareLinkDto } from './dto/create-favorites-share-link.dto';

@Injectable()
export class BuyerFavoritesShareLinksService {
  private readonly logger = new Logger(BuyerFavoritesShareLinksService.name);

  /** Base URL of the customer-facing frontend (htownautos-web). */
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly shortUrl: ShortUrlService,
    private readonly favoritesService: BuyerFavoritesService,
  ) {
    this.frontendUrl = (
      process.env.FRONTEND_URL || 'https://htownautos.com'
    ).replace(/\/+$/, '');
  }

  // ─── helpers ───────────────────────────────────────────────────────

  private buildLongUrl(token: string): string {
    return `${this.frontendUrl}/favorites/shared?token=${token}`;
  }

  private async ensureBuyer(buyerId: string, tenantId: string): Promise<{ firstName: string; lastName: string }> {
    const buyer = await this.prisma.buyer.findFirst({
      where: { id: buyerId, tenantId: tenantId || undefined },
      select: { firstName: true, lastName: true },
    });
    if (!buyer) throw new NotFoundException(`Buyer ${buyerId} not found`);
    return buyer;
  }

  private async resolveLink(token: string) {
    const link = await this.prisma.buyerFavoritesShareLink.findUnique({
      where: { token },
      include: { buyer: { select: { id: true, firstName: true, lastName: true, tenantId: true } } },
    });
    if (!link || link.revoked) throw new NotFoundException('Favorites link not found');
    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new NotFoundException('Favorites link has expired');
    }
    return link;
  }

  // ─── staff (authenticated) ─────────────────────────────────────────

  async create(
    buyerId: string,
    tenantId: string,
    userId: string | null,
    dto: CreateFavoritesShareLinkDto,
  ) {
    await this.ensureBuyer(buyerId, tenantId);

    const expiresAt = dto.expirationHours
      ? new Date(Date.now() + dto.expirationHours * 60 * 60 * 1000)
      : null;

    // 32 bytes of entropy → 43-char base64url token (same as InspectionShareLink).
    const token = randomBytes(32).toString('hex');

    const link = await this.prisma.buyerFavoritesShareLink.create({
      data: { token, buyerId, tenantId, expiresAt, createdBy: userId },
    });

    // Build companion short URL. Best-effort: share link works without it.
    let shortUrlCode: string | null = null;
    if (tenantId) {
      try {
        const longUrl = this.buildLongUrl(token);
        const res = await this.shortUrl.create(
          longUrl,
          tenantId,
          userId ?? undefined,
          expiresAt ?? undefined,
        );
        shortUrlCode = res.code;
        await this.prisma.buyerFavoritesShareLink.update({
          where: { id: link.id },
          data: { shortUrlCode },
        });
      } catch (err) {
        this.logger.warn(
          `Short URL creation failed for favorites share link ${link.id}: ${(err as Error).message}`,
        );
      }
    }

    const url = this.buildLongUrl(token);
    const shortUrl = shortUrlCode ? this.shortUrl.buildShortUrl(shortUrlCode) : null;

    return { token, url, shortUrl, expiresAt };
  }

  // ─── public (no auth) ──────────────────────────────────────────────

  /** Resolve a share token → buyer name + enriched favorites list. */
  async resolvePublic(token: string) {
    if (!token) throw new NotFoundException('Favorites link not found');

    const link = await this.resolveLink(token);
    const { buyer } = link;

    // Best-effort access log; doesn't block the response.
    this.prisma.buyerFavoritesShareLink
      .update({ where: { id: link.id }, data: { lastAccessedAt: new Date() } })
      .catch(() => undefined);

    const items = await this.favoritesService.list(buyer.id, buyer.tenantId ?? null);

    return {
      buyerName: `${buyer.firstName} ${buyer.lastName}`.trim(),
      expiresAt: link.expiresAt,
      items,
    };
  }

  /** Remove a lot from the buyer's favorites via share token. Public mutation. */
  async removePublic(token: string, lotNumber: string) {
    if (!token) throw new NotFoundException('Favorites link not found');

    const link = await this.resolveLink(token);

    // Best-effort access log.
    this.prisma.buyerFavoritesShareLink
      .update({ where: { id: link.id }, data: { lastAccessedAt: new Date() } })
      .catch(() => undefined);

    await this.favoritesService.remove(link.buyerId, lotNumber);
    return { ok: true };
  }
}

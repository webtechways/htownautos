import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';

/**
 * Shared-secret guard for the external auction-result ingester. Mirrors the
 * PostmarkWebhookGuard pattern (constant-time compare) rather than the
 * tenant-scoped ApiKeyGuard, because auction data is global (not per-tenant)
 * and the poster is a simple external scraper.
 *
 * Accepts the secret via `X-API-Key: <secret>`, `Authorization: Bearer <secret>`,
 * or `?token=<secret>`, compared against AUCTION_INGEST_API_KEY.
 */
@Injectable()
export class AuctionIngestGuard implements CanActivate {
  private readonly logger = new Logger(AuctionIngestGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const expected = process.env.AUCTION_INGEST_API_KEY;
    if (!expected) {
      this.logger.error('AUCTION_INGEST_API_KEY not configured');
      throw new UnauthorizedException('Ingest auth not configured');
    }

    const req = context.switchToHttp().getRequest();
    const provided = this.extract(req);
    if (!provided) {
      throw new UnauthorizedException('Missing API key (X-API-Key, Bearer, or ?token=)');
    }
    if (!this.constantTimeEqual(provided, expected)) {
      throw new UnauthorizedException('Invalid API key');
    }
    return true;
  }

  private extract(req: any): string | null {
    const header = req.headers?.['x-api-key'];
    if (typeof header === 'string' && header.length) return header;

    const auth: string | undefined = req.headers?.authorization;
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      return auth.slice(7).trim();
    }

    const token = req.query?.token;
    if (typeof token === 'string' && token.length) return token;

    return null;
  }

  private constantTimeEqual(a: string, b: string): boolean {
    const aBuf = Buffer.from(a, 'utf8');
    const bBuf = Buffer.from(b, 'utf8');
    if (aBuf.length !== bBuf.length) return false;
    return timingSafeEqual(aBuf, bBuf);
  }
}

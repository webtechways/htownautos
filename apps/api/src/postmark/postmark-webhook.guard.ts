import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';

/**
 * Authorises Postmark webhook deliveries using one of two mechanisms:
 *
 *   1. `Authorization: Basic base64(user:pass)` — used by the outbound events
 *      webhook (created via the Webhooks API which supports HttpAuth objects).
 *
 *   2. `?token=<password>` query parameter — used by the InboundHookUrl, since
 *      Postmark's server-level inbound config only supports auth embedded in
 *      the URL, and some intermediate proxies (Cloudflare Tunnel, nginx) strip
 *      the userinfo portion of URLs before forwarding, breaking Basic auth.
 *
 * Either mechanism is accepted; both compare credentials with constant-time
 * equality to avoid timing side-channels.
 */
@Injectable()
export class PostmarkWebhookGuard implements CanActivate {
  private readonly logger = new Logger(PostmarkWebhookGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const expectedUser = process.env.POSTMARK_WEBHOOK_USER;
    const expectedPass = process.env.POSTMARK_WEBHOOK_PASSWORD;

    if (!expectedUser || !expectedPass) {
      this.logger.error('POSTMARK_WEBHOOK_USER or POSTMARK_WEBHOOK_PASSWORD not configured');
      throw new UnauthorizedException('Webhook auth not configured');
    }

    // Option 1 — query token (used by InboundHookUrl to survive proxies that strip userinfo)
    const queryToken = request.query?.token;
    if (typeof queryToken === 'string' && queryToken.length > 0) {
      if (this.constantTimeEqual(queryToken, expectedPass)) {
        return true;
      }
      throw new UnauthorizedException('Invalid webhook token');
    }

    // Option 2 — Basic auth (used by outbound events webhook via Postmark HttpAuth)
    const header: string | undefined = request.headers?.authorization;
    if (header && header.toLowerCase().startsWith('basic ')) {
      const b64 = header.slice(6).trim();
      let decoded = '';
      try {
        decoded = Buffer.from(b64, 'base64').toString('utf8');
      } catch {
        throw new UnauthorizedException('Invalid Basic auth encoding');
      }
      const idx = decoded.indexOf(':');
      if (idx < 0) throw new UnauthorizedException('Invalid Basic auth format');
      const user = decoded.slice(0, idx);
      const pass = decoded.slice(idx + 1);

      if (
        this.constantTimeEqual(user, expectedUser) &&
        this.constantTimeEqual(pass, expectedPass)
      ) {
        return true;
      }
      throw new UnauthorizedException('Invalid webhook credentials');
    }

    throw new UnauthorizedException('Missing webhook credentials (expect Basic auth or ?token=)');
  }

  private constantTimeEqual(a: string, b: string): boolean {
    const aBuf = Buffer.from(a, 'utf8');
    const bBuf = Buffer.from(b, 'utf8');
    if (aBuf.length !== bBuf.length) return false;
    return timingSafeEqual(aBuf, bBuf);
  }
}

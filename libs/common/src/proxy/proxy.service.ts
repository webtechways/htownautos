import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
import { ProxyAgent, fetch as undiciFetch } from 'undici';

/** Thrown when a URL stays blocked (captcha/firewall/Cloudflare) after every retry. */
export class ImageFetchBlockedError extends Error {
  constructor(
    public readonly url: string,
    public readonly attempts: number,
    public readonly lastStatus?: number,
  ) {
    super(
      `Blocked fetching ${url} after ${attempts} attempt(s)` +
        (lastStatus ? ` (last status ${lastStatus})` : ''),
    );
    this.name = 'ImageFetchBlockedError';
  }
}

// Browser-ish headers to reduce trivial bot blocks.
const DEFAULT_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
};

const DEFAULT_MAX_ATTEMPTS = 5;
const CREDS_CACHE_MS = 5 * 60_000;

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  // Cached backbone proxy URL (Webshare rotates the exit IP per connection).
  private cachedProxyUrl: string | null = null;
  private cachedProxyUrlAt = 0;

  constructor(private readonly prisma: PrismaService) {}

  /** Legacy helper: pick a random active proxy (kept for compatibility). */
  async getRandomProxy(): Promise<string | null> {
    const proxies = await this.prisma.proxy.findMany({
      where: { isActive: true },
      select: { address: true, port: true, username: true, password: true },
    });
    if (proxies.length === 0) return null;
    const p = proxies[Math.floor(Math.random() * proxies.length)];
    return p.username && p.password
      ? `http://${p.username}:${p.password}@${p.address}:${p.port}`
      : `http://${p.address}:${p.port}`;
  }

  /**
   * Fetch a URL through the Webshare backbone proxy. Webshare rotates the exit IP
   * on every new connection, so each attempt effectively uses a different proxy.
   *
   * Retries up to `maxAttempts` on blocks (403/429/5xx) and network errors, opening
   * a fresh connection each time. Throws `ImageFetchBlockedError` if all attempts
   * are blocked. Non-block responses (e.g. 404) are returned as-is without retry.
   *
   * The body is fully buffered and returned as a standard `Response`, so callers
   * can safely call `.json()` / `.arrayBuffer()` after the proxy agent is closed.
   */
  async fetchViaProxy(
    url: string,
    opts?: { maxAttempts?: number },
  ): Promise<Response> {
    const maxAttempts = opts?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
    let lastStatus: number | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      let agent: ProxyAgent | undefined;
      try {
        const proxyUrl = await this.getBackboneProxyUrl();
        let res: Response;
        if (proxyUrl) {
          agent = new ProxyAgent(proxyUrl);
          res = (await undiciFetch(url, {
            dispatcher: agent,
            headers: DEFAULT_HEADERS,
          })) as unknown as Response;
        } else {
          // No proxy configured (local/dev) → direct fetch.
          res = await fetch(url, { headers: DEFAULT_HEADERS });
        }

        lastStatus = res.status;

        if (this.isRetryableStatus(res.status)) {
          this.logger.warn(
            `[Proxy] Blocked (${res.status}) attempt ${attempt}/${maxAttempts}: ${url}`,
          );
          await this.sleep(this.backoffMs(attempt));
          continue;
        }

        // Success or a non-retryable error (404/400/…): buffer + return a
        // standalone Response so the proxy agent can be closed safely.
        const buffer = Buffer.from(await res.arrayBuffer());
        return new Response(buffer, {
          status: res.status,
          statusText: res.statusText,
          headers: {
            'content-type':
              res.headers.get('content-type') ?? 'application/octet-stream',
          },
        });
      } catch (err) {
        this.logger.warn(
          `[Proxy] Error attempt ${attempt}/${maxAttempts} for ${url}: ${(err as Error).message}`,
        );
        if (attempt < maxAttempts) await this.sleep(this.backoffMs(attempt));
      } finally {
        if (agent) await agent.close().catch(() => undefined);
      }
    }

    throw new ImageFetchBlockedError(url, maxAttempts, lastStatus);
  }

  private isRetryableStatus(status: number): boolean {
    // 403 (Akamai/Cloudflare block), 429 (rate limit), 5xx (transient/challenge).
    return status === 403 || status === 429 || status >= 500;
  }

  private backoffMs(attempt: number): number {
    // Short backoff with jitter; keep the crawler moving.
    return Math.min(attempt * 500, 3000) + Math.floor(Math.random() * 250);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }

  /**
   * Resolve the Webshare backbone proxy URL. Prefers explicit env config; falls
   * back to credentials from the synced proxy inventory (all rows share the same
   * account username/password). Returns null when nothing is configured.
   */
  private async getBackboneProxyUrl(): Promise<string | null> {
    if (process.env.PROXY_BACKBONE_URL) return process.env.PROXY_BACKBONE_URL;

    const host = process.env.PROXY_BACKBONE_HOST || 'p.webshare.io:3128';
    const user = process.env.PROXY_BACKBONE_USER;
    const pass = process.env.PROXY_BACKBONE_PASS;
    if (user && pass) return `http://${user}:${pass}@${host}`;

    const now = Date.now();
    if (this.cachedProxyUrl && now - this.cachedProxyUrlAt < CREDS_CACHE_MS) {
      return this.cachedProxyUrl;
    }

    const proxy = await this.prisma.proxy.findFirst({
      where: { isActive: true, username: { not: null }, password: { not: null } },
      select: { username: true, password: true },
    });
    this.cachedProxyUrlAt = now;
    this.cachedProxyUrl =
      proxy?.username && proxy?.password
        ? `http://${proxy.username}:${proxy.password}@${host}`
        : null;

    if (!this.cachedProxyUrl) {
      this.logger.warn(
        '[Proxy] No backbone credentials (env or proxy inventory) — fetching direct',
      );
    }
    return this.cachedProxyUrl;
  }
}

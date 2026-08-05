import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@htownautos/prisma';

interface WebshareProxy {
  id: string;
  username: string;
  password: string;
  proxy_address: string;
  port: number;
  valid: boolean;
  last_verification: string;
  country_code: string;
  city_name: string;
  asn_name: string;
  asn_number: number;
  high_country_confidence: boolean;
  created_at: string;
}

interface WebshareResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WebshareProxy[];
}

export interface ProxySyncResult {
  fetched: number;
  active: number;
  total: number;
  retired: number;
}

const CONFIG_ID = 'singleton';
const DEFAULT_RESYNC_HOURS = 168;

@Injectable()
export class ProxySyncService implements OnModuleInit {
  private readonly logger = new Logger(ProxySyncService.name);
  private readonly endpoint = process.env.PROXY_API_ENDPOINT;
  private readonly apiKey = process.env.PROXY_API_KEY;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    if (!this.endpoint || !this.apiKey) {
      this.logger.warn('PROXY_API_ENDPOINT or PROXY_API_KEY not configured, proxy sync disabled');
      return;
    }
    // Sync on startup if table is empty
    const count = await this.prisma.proxy.count();
    if (count === 0) {
      this.logger.log('No proxies found, running initial sync...');
      await this.syncProxies().catch((e) =>
        this.logger.error(`[ProxySync] Initial sync failed: ${e.message}`),
      );
    }
  }

  /** Hourly check; runs a full sync when the configured interval has elapsed. */
  @Cron(CronExpression.EVERY_HOUR)
  async autoResync() {
    try {
      const cfg = await this.prisma.imageScrapeConfig.findUnique({ where: { id: CONFIG_ID } });
      const hours = cfg?.proxyResyncHours ?? DEFAULT_RESYNC_HOURS;
      if (hours <= 0) return; // auto-resync disabled

      const last = cfg?.proxyLastSyncAt;
      if (last && Date.now() - last.getTime() < hours * 3_600_000) return; // not due yet

      this.logger.log(`[ProxySync] Auto-resync due (every ${hours}h)`);
      await this.syncProxies();
    } catch (err: any) {
      this.logger.error(`[ProxySync] Auto-resync failed: ${err.message}`);
    }
  }

  /**
   * Fetch the current Webshare proxy list and refresh the inventory
   * non-destructively (upsert seen, retire missing). Throws on failure so the
   * manual "Resync" endpoint can surface the error. Returns counts for the UI.
   */
  async syncProxies(): Promise<ProxySyncResult> {
    if (!this.endpoint || !this.apiKey) {
      throw new Error('Proxy API not configured (PROXY_API_ENDPOINT / PROXY_API_KEY)');
    }

    this.logger.log('[ProxySync] Fetching proxy list from Webshare...');
    const proxies = await this.fetchAllProxies();

    if (proxies.length === 0) {
      this.logger.warn('[ProxySync] No proxies returned from API, skipping refresh');
      const [active, total] = await this.counts();
      return { fetched: 0, active, total, retired: 0 };
    }

    // Non-destructive refresh: upsert the current feed, then retire (not delete)
    // any proxy that dropped out — keeps historical inventory in the UI.
    const runAt = new Date();

    for (const p of proxies) {
      const data = {
        username: p.username || null,
        password: p.password || null,
        authMethod: 'username_password',
        connectionMethod: 'direct',
        country: p.country_code || null,
        city: p.city_name || null,
        status: p.valid ? 'active' : 'inactive',
        lastCheckedAt: p.last_verification ? new Date(p.last_verification) : null,
        isActive: p.valid,
        lastSeenInFeedAt: runAt,
        retiredAt: null,
      };
      await this.prisma.proxy.upsert({
        where: { address_port: { address: p.proxy_address, port: p.port } },
        update: data,
        create: { address: p.proxy_address, port: p.port, ...data },
      });
    }

    const retired = await this.prisma.proxy.updateMany({
      where: {
        retiredAt: null,
        OR: [{ lastSeenInFeedAt: null }, { lastSeenInFeedAt: { lt: runAt } }],
      },
      data: { retiredAt: runAt, isActive: false, status: 'retired' },
    });

    // Record the sync time so auto-resync can pace itself.
    await this.prisma.imageScrapeConfig.updateMany({
      where: { id: CONFIG_ID },
      data: { proxyLastSyncAt: runAt },
    });

    const [active, total] = await this.counts();
    this.logger.log(
      `[ProxySync] Upserted ${proxies.length}, retired ${retired.count} — active=${active} total=${total}`,
    );
    return { fetched: proxies.length, active, total, retired: retired.count };
  }

  private async counts(): Promise<[number, number]> {
    const [active, total] = await Promise.all([
      this.prisma.proxy.count({ where: { isActive: true } }),
      this.prisma.proxy.count(),
    ]);
    return [active, total];
  }

  private async fetchAllProxies(): Promise<WebshareProxy[]> {
    const all: WebshareProxy[] = [];
    let url: string | null = this.endpoint!;

    while (url) {
      const response = await fetch(url, {
        headers: { Authorization: this.apiKey! },
      });

      if (!response.ok) {
        throw new Error(`Webshare API returned ${response.status}: ${await response.text()}`);
      }

      const data: WebshareResponse = await response.json();
      all.push(...data.results);
      url = data.next;
    }

    return all;
  }
}

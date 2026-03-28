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
      await this.syncProxies();
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async syncProxies() {
    if (!this.endpoint || !this.apiKey) return;

    this.logger.log('[ProxySync] Starting weekly proxy sync...');

    try {
      const proxies = await this.fetchAllProxies();

      if (proxies.length === 0) {
        this.logger.warn('[ProxySync] No proxies returned from API, skipping refresh');
        return;
      }

      // Delete old proxies and insert new ones in a transaction
      await this.prisma.$transaction([
        this.prisma.proxy.deleteMany(),
        this.prisma.proxy.createMany({
          data: proxies.map((p) => ({
            address: p.proxy_address,
            port: p.port,
            username: p.username || null,
            password: p.password || null,
            authMethod: 'username_password',
            connectionMethod: 'direct',
            country: p.country_code || null,
            city: p.city_name || null,
            status: p.valid ? 'active' : 'inactive',
            lastCheckedAt: p.last_verification ? new Date(p.last_verification) : null,
            isActive: p.valid,
          })),
        }),
      ]);

      this.logger.log(`[ProxySync] Refreshed ${proxies.length} proxies`);
    } catch (error: any) {
      this.logger.error(`[ProxySync] Failed: ${error.message}`);
    }
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

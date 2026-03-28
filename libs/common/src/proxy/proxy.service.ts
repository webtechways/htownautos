import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
// import { ProxyAgent, fetch as undiciFetch } from 'undici';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getRandomProxy(): Promise<string | null> {
    const proxies = await this.prisma.proxy.findMany({
      where: { isActive: true },
      select: { address: true, port: true, username: true, password: true },
    });

    if (proxies.length === 0) return null;

    const proxy = proxies[Math.floor(Math.random() * proxies.length)];

    if (proxy.username && proxy.password) {
      return `http://${proxy.username}:${proxy.password}@${proxy.address}:${proxy.port}`;
    }
    return `http://${proxy.address}:${proxy.port}`;
  }

  async fetchViaProxy(url: string): Promise<Response> {
    // TODO: Re-enable proxy once OVH firewall allows outbound proxy ports (or switch to backbone mode p.webshare.io:3128)
    this.logger.log(`[Proxy] Proxy disabled — fetching directly: ${url}`);
    return fetch(url);
  }
}

import { Injectable, Logger } from '@nestjs/common';

export type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX';

export interface DnsRecord {
  id: string;
  type: DnsRecordType;
  name: string;
  content: string;
  priority?: number;
  ttl?: number;
}

interface CloudflareResponse<T> {
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: Array<{ code: number; message: string }>;
  result: T;
}

@Injectable()
export class CloudflareDnsService {
  private readonly logger = new Logger(CloudflareDnsService.name);
  private readonly apiBase = 'https://api.cloudflare.com/client/v4';
  private readonly token: string | undefined;
  private readonly zoneId: string | undefined;

  constructor() {
    this.token = process.env.CLOUDFLARE_SUBDOMAIN_EMAIL_VERIFY;
    this.zoneId = process.env.CLOUDFLARE_ZONE_ID;
    if (!this.token || !this.zoneId) {
      this.logger.warn('Cloudflare DNS not configured (missing CLOUDFLARE_SUBDOMAIN_EMAIL_VERIFY or CLOUDFLARE_ZONE_ID)');
    }
  }

  async createTxt(name: string, content: string, ttl = 300): Promise<DnsRecord> {
    return this.createRecord({ type: 'TXT', name, content, ttl });
  }

  async createCname(name: string, target: string, ttl = 300): Promise<DnsRecord> {
    return this.createRecord({ type: 'CNAME', name, content: target, ttl, proxied: false });
  }

  async createMx(name: string, target: string, priority = 10, ttl = 300): Promise<DnsRecord> {
    return this.createRecord({ type: 'MX', name, content: target, priority, ttl });
  }

  async listByName(name: string): Promise<DnsRecord[]> {
    this.assertConfigured();
    const url = `${this.apiBase}/zones/${this.zoneId}/dns_records?name=${encodeURIComponent(name)}`;
    const res = await this.request<any[]>('GET', url);
    return (res.result || []).map(this.toDnsRecord);
  }

  async deleteRecord(id: string): Promise<void> {
    this.assertConfigured();
    const url = `${this.apiBase}/zones/${this.zoneId}/dns_records/${id}`;
    await this.request<unknown>('DELETE', url);
  }

  /**
   * Delete any records at a given name (useful when record IDs weren't tracked).
   * Optionally filter by type.
   */
  async deleteByName(name: string, type?: DnsRecordType): Promise<number> {
    const records = await this.listByName(name);
    const toDelete = type ? records.filter((r) => r.type === type) : records;
    let count = 0;
    for (const record of toDelete) {
      try {
        await this.deleteRecord(record.id);
        count++;
      } catch (err: any) {
        this.logger.warn(`Failed to delete DNS record ${record.id} (${record.name}): ${err?.message}`);
      }
    }
    return count;
  }

  private async createRecord(body: {
    type: DnsRecordType;
    name: string;
    content: string;
    ttl?: number;
    priority?: number;
    proxied?: boolean;
  }): Promise<DnsRecord> {
    this.assertConfigured();
    const url = `${this.apiBase}/zones/${this.zoneId}/dns_records`;
    const res = await this.request<any>('POST', url, body);
    return this.toDnsRecord(res.result);
  }

  private async request<T>(method: string, url: string, body?: unknown, attempt = 0): Promise<CloudflareResponse<T>> {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 429 && attempt < 3) {
      const wait = 500 * Math.pow(2, attempt);
      this.logger.warn(`Cloudflare rate-limited; retrying in ${wait}ms`);
      await new Promise((r) => setTimeout(r, wait));
      return this.request<T>(method, url, body, attempt + 1);
    }

    const text = await response.text();
    let parsed: CloudflareResponse<T>;
    try {
      parsed = text ? JSON.parse(text) : ({ success: response.ok, errors: [], messages: [], result: null as any });
    } catch {
      throw new Error(`Cloudflare API returned non-JSON (${response.status}): ${text.slice(0, 200)}`);
    }

    if (!response.ok || parsed.success === false) {
      const msg = parsed.errors?.map((e) => `${e.code}: ${e.message}`).join('; ') || response.statusText;
      throw new Error(`Cloudflare API error (${response.status}): ${msg}`);
    }

    return parsed;
  }

  private toDnsRecord = (raw: any): DnsRecord => ({
    id: raw.id,
    type: raw.type,
    name: raw.name,
    content: raw.content,
    priority: raw.priority,
    ttl: raw.ttl,
  });

  private assertConfigured(): void {
    if (!this.token || !this.zoneId) {
      throw new Error('Cloudflare DNS is not configured');
    }
  }
}

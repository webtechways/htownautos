"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CloudflareDnsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudflareDnsService = void 0;
const common_1 = require("@nestjs/common");
let CloudflareDnsService = CloudflareDnsService_1 = class CloudflareDnsService {
    logger = new common_1.Logger(CloudflareDnsService_1.name);
    apiBase = 'https://api.cloudflare.com/client/v4';
    token;
    zoneId;
    constructor() {
        this.token = process.env.CLOUDFLARE_SUBDOMAIN_EMAIL_VERIFY;
        this.zoneId = process.env.CLOUDFLARE_ZONE_ID;
        if (!this.token || !this.zoneId) {
            this.logger.warn('Cloudflare DNS not configured (missing CLOUDFLARE_SUBDOMAIN_EMAIL_VERIFY or CLOUDFLARE_ZONE_ID)');
        }
    }
    async createTxt(name, content, ttl = 300) {
        return this.createRecord({ type: 'TXT', name, content, ttl });
    }
    async createCname(name, target, ttl = 300) {
        return this.createRecord({ type: 'CNAME', name, content: target, ttl, proxied: false });
    }
    async createMx(name, target, priority = 10, ttl = 300) {
        return this.createRecord({ type: 'MX', name, content: target, priority, ttl });
    }
    async listByName(name) {
        this.assertConfigured();
        const url = `${this.apiBase}/zones/${this.zoneId}/dns_records?name=${encodeURIComponent(name)}`;
        const res = await this.request('GET', url);
        return (res.result || []).map(this.toDnsRecord);
    }
    async deleteRecord(id) {
        this.assertConfigured();
        const url = `${this.apiBase}/zones/${this.zoneId}/dns_records/${id}`;
        await this.request('DELETE', url);
    }
    async deleteByName(name, type) {
        const records = await this.listByName(name);
        const toDelete = type ? records.filter((r) => r.type === type) : records;
        let count = 0;
        for (const record of toDelete) {
            try {
                await this.deleteRecord(record.id);
                count++;
            }
            catch (err) {
                this.logger.warn(`Failed to delete DNS record ${record.id} (${record.name}): ${err?.message}`);
            }
        }
        return count;
    }
    async createRecord(body) {
        this.assertConfigured();
        const url = `${this.apiBase}/zones/${this.zoneId}/dns_records`;
        const res = await this.request('POST', url, body);
        return this.toDnsRecord(res.result);
    }
    async request(method, url, body, attempt = 0) {
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
            return this.request(method, url, body, attempt + 1);
        }
        const text = await response.text();
        let parsed;
        try {
            parsed = text ? JSON.parse(text) : ({ success: response.ok, errors: [], messages: [], result: null });
        }
        catch {
            throw new Error(`Cloudflare API returned non-JSON (${response.status}): ${text.slice(0, 200)}`);
        }
        if (!response.ok || parsed.success === false) {
            const msg = parsed.errors?.map((e) => `${e.code}: ${e.message}`).join('; ') || response.statusText;
            throw new Error(`Cloudflare API error (${response.status}): ${msg}`);
        }
        return parsed;
    }
    toDnsRecord = (raw) => ({
        id: raw.id,
        type: raw.type,
        name: raw.name,
        content: raw.content,
        priority: raw.priority,
        ttl: raw.ttl,
    });
    assertConfigured() {
        if (!this.token || !this.zoneId) {
            throw new Error('Cloudflare DNS is not configured');
        }
    }
};
exports.CloudflareDnsService = CloudflareDnsService;
exports.CloudflareDnsService = CloudflareDnsService = CloudflareDnsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CloudflareDnsService);
//# sourceMappingURL=cloudflare-dns.service.js.map
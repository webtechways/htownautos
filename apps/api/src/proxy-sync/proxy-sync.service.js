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
var ProxySyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxySyncService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_1 = require("@htownautos/prisma");
let ProxySyncService = ProxySyncService_1 = class ProxySyncService {
    prisma;
    logger = new common_1.Logger(ProxySyncService_1.name);
    endpoint = process.env.PROXY_API_ENDPOINT;
    apiKey = process.env.PROXY_API_KEY;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        if (!this.endpoint || !this.apiKey) {
            this.logger.warn('PROXY_API_ENDPOINT or PROXY_API_KEY not configured, proxy sync disabled');
            return;
        }
        const count = await this.prisma.proxy.count();
        if (count === 0) {
            this.logger.log('No proxies found, running initial sync...');
            await this.syncProxies();
        }
    }
    async syncProxies() {
        if (!this.endpoint || !this.apiKey)
            return;
        this.logger.log('[ProxySync] Starting weekly proxy sync...');
        try {
            const proxies = await this.fetchAllProxies();
            if (proxies.length === 0) {
                this.logger.warn('[ProxySync] No proxies returned from API, skipping refresh');
                return;
            }
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
        }
        catch (error) {
            this.logger.error(`[ProxySync] Failed: ${error.message}`);
        }
    }
    async fetchAllProxies() {
        const all = [];
        let url = this.endpoint;
        while (url) {
            const response = await fetch(url, {
                headers: { Authorization: this.apiKey },
            });
            if (!response.ok) {
                throw new Error(`Webshare API returned ${response.status}: ${await response.text()}`);
            }
            const data = await response.json();
            all.push(...data.results);
            url = data.next;
        }
        return all;
    }
};
exports.ProxySyncService = ProxySyncService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_WEEK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProxySyncService.prototype, "syncProxies", null);
exports.ProxySyncService = ProxySyncService = ProxySyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], ProxySyncService);
//# sourceMappingURL=proxy-sync.service.js.map
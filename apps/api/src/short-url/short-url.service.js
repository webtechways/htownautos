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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShortUrlService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const crypto_1 = require("crypto");
let ShortUrlService = class ShortUrlService {
    prisma;
    baseUrl;
    constructor(prisma) {
        this.prisma = prisma;
        this.baseUrl =
            process.env.SHORT_URL_BASE || 'https://link.htownautos.com';
    }
    async create(originalUrl, tenantId, createdBy, expiresAt) {
        const code = this.generateCode();
        await this.prisma.shortUrl.create({
            data: { code, originalUrl, tenantId, createdBy, expiresAt },
        });
        return {
            code,
            shortUrl: `${this.baseUrl}/${code}`,
        };
    }
    buildShortUrl(code) {
        return `${this.baseUrl}/${code}`;
    }
    async resolve(code) {
        const record = await this.prisma.shortUrl.findUnique({ where: { code } });
        if (!record) {
            throw new common_1.NotFoundException('Link not found');
        }
        if (record.expiresAt && record.expiresAt < new Date()) {
            throw new common_1.NotFoundException('Link has expired');
        }
        this.prisma.shortUrl
            .update({ where: { code }, data: { clicks: { increment: 1 } } })
            .catch(() => { });
        return record.originalUrl;
    }
    generateCode() {
        return (0, crypto_1.randomBytes)(4).toString('base64url');
    }
};
exports.ShortUrlService = ShortUrlService;
exports.ShortUrlService = ShortUrlService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], ShortUrlService);
//# sourceMappingURL=short-url.service.js.map
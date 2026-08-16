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
exports.TitleMappingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
let TitleMappingService = class TitleMappingService {
    prisma;
    cache = null;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOverrides() {
        if (this.cache)
            return this.cache;
        const rows = await this.prisma.auctionTitleTypeMapping.findMany({
            select: { code: true, category: true },
        });
        const map = {};
        for (const r of rows) {
            if (common_2.ASSIGNABLE_TITLE_CATEGORIES.includes(r.category)) {
                map[r.code.toLowerCase()] = r.category;
            }
        }
        this.cache = map;
        return map;
    }
    async list() {
        return this.prisma.auctionTitleTypeMapping.findMany({
            select: { code: true, category: true },
            orderBy: { code: 'asc' },
        });
    }
    async setMapping(code, category, assignedById) {
        const c = code.toLowerCase().trim();
        const row = await this.prisma.auctionTitleTypeMapping.upsert({
            where: { code: c },
            create: { code: c, category, assignedById },
            update: { category, assignedById },
            select: { code: true, category: true },
        });
        this.cache = null;
        return row;
    }
    async removeMapping(code) {
        await this.prisma.auctionTitleTypeMapping
            .delete({ where: { code: code.toLowerCase().trim() } })
            .catch(() => undefined);
        this.cache = null;
    }
};
exports.TitleMappingService = TitleMappingService;
exports.TitleMappingService = TitleMappingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], TitleMappingService);
//# sourceMappingURL=title-mapping.service.js.map
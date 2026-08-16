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
exports.PortalPricingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const DEFAULT_INSPECTION_FEE_CENTS = 3500;
const DEFAULT_TRAVEL_FEE_CENTS = 5000;
let PortalPricingService = class PortalPricingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPricing(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { settings: true },
        });
        const raw = tenant?.settings;
        const portal = (raw?.['portal'] ?? {});
        const inspectionFeeCents = typeof portal.inspectionFeeCents === 'number' &&
            Number.isInteger(portal.inspectionFeeCents) &&
            portal.inspectionFeeCents > 0
            ? portal.inspectionFeeCents
            : DEFAULT_INSPECTION_FEE_CENTS;
        const travelFeeCents = typeof portal.travelFeeCents === 'number' &&
            Number.isInteger(portal.travelFeeCents) &&
            portal.travelFeeCents > 0
            ? portal.travelFeeCents
            : DEFAULT_TRAVEL_FEE_CENTS;
        return { inspectionFeeCents, travelFeeCents };
    }
    async setPricing(tenantId, updates) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { settings: true },
        });
        const existing = (tenant?.settings ?? {});
        const existingPortal = (existing['portal'] ?? {});
        const merged = {
            ...existingPortal,
            ...(updates.inspectionFeeCents !== undefined && {
                inspectionFeeCents: updates.inspectionFeeCents,
            }),
            ...(updates.travelFeeCents !== undefined && {
                travelFeeCents: updates.travelFeeCents,
            }),
        };
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                settings: {
                    ...existing,
                    portal: merged,
                },
            },
        });
        return this.getPricing(tenantId);
    }
};
exports.PortalPricingService = PortalPricingService;
exports.PortalPricingService = PortalPricingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], PortalPricingService);
//# sourceMappingURL=portal-pricing.service.js.map
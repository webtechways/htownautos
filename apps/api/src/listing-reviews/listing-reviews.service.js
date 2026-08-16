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
var ListingReviewsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
let ListingReviewsService = ListingReviewsService_1 = class ListingReviewsService {
    prisma;
    logger = new common_1.Logger(ListingReviewsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getByLotNumber(tenantId, lotNumber) {
        return this.prisma.auctionListingReview.findUnique({
            where: { tenantId_lotNumber: { tenantId, lotNumber } },
        });
    }
    async upsert(tenantId, userId, lotNumber, data) {
        this.logger.log(`[upsert] tenantId=${tenantId}, userId=${userId}, lotNumber=${lotNumber}, data=${JSON.stringify(data)}`);
        try {
            return await this.prisma.auctionListingReview.upsert({
                where: { tenantId_lotNumber: { tenantId, lotNumber } },
                create: {
                    tenantId,
                    userId,
                    lotNumber,
                    notes: data.notes ?? null,
                    checked: data.checked ?? false,
                    damageLevel: data.damageLevel ?? null,
                },
                update: {
                    userId,
                    ...(data.notes !== undefined && { notes: data.notes }),
                    ...(data.checked !== undefined && { checked: data.checked }),
                    ...(data.damageLevel !== undefined && { damageLevel: data.damageLevel }),
                },
            });
        }
        catch (error) {
            this.logger.error(`[upsert] Failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ListingReviewsService = ListingReviewsService;
exports.ListingReviewsService = ListingReviewsService = ListingReviewsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], ListingReviewsService);
//# sourceMappingURL=listing-reviews.service.js.map
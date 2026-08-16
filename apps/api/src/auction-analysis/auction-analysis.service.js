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
var AuctionAnalysisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionAnalysisService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
const NULL_ANALYSIS = {
    damages: null,
    parts: null,
    maxBid: null,
    marketCheck: null,
    comparables: null,
    auctionHistory: null,
    carfax: { hasReport: false, aiSummary: null, analysis: null },
};
const CARFAX_SIGNED_URL_TTL = 60 * 60 * 6;
let AuctionAnalysisService = AuctionAnalysisService_1 = class AuctionAnalysisService {
    prisma;
    s3;
    logger = new common_1.Logger(AuctionAnalysisService_1.name);
    constructor(prisma, s3) {
        this.prisma = prisma;
        this.s3 = s3;
    }
    async gatherForLot(lotNumber) {
        if (!lotNumber)
            return NULL_ANALYSIS;
        let listingId;
        try {
            listingId = BigInt(lotNumber);
        }
        catch {
            return NULL_ANALYSIS;
        }
        try {
            const [damageRow, partRows, maxBidRow, snapshots, carfaxRow] = await Promise.all([
                this.prisma.auctionVehicleAnalysis.findFirst({
                    where: { auctionListingId: listingId },
                    orderBy: { createdAt: 'desc' },
                    include: {
                        damages: {
                            orderBy: { part: 'asc' },
                        },
                    },
                }),
                this.prisma.vehicleMarketPart.findMany({
                    where: { auctionListingId: listingId },
                    orderBy: { part: 'asc' },
                }),
                this.prisma.maxBidRecommendation.findFirst({
                    where: { auctionListingId: listingId },
                    orderBy: { createdAt: 'desc' },
                }),
                this.prisma.auctionAnalysisSnapshot.findMany({
                    where: { auctionListingId: listingId },
                }),
                this.prisma.carfaxReport.findFirst({
                    where: { auctionListingId: listingId },
                    orderBy: { createdAt: 'desc' },
                    select: { id: true, s3Key: true, aiSummary: true, analysis: true, date: true },
                }),
            ]);
            const damages = damageRow
                ? {
                    id: damageRow.id,
                    createdAt: damageRow.createdAt,
                    items: damageRow.damages.map((d) => ({
                        part: d.part,
                        description: d.description,
                        level: d.level,
                        partCost: d.partCost.toString(),
                        laborCost: d.laborCost.toString(),
                    })),
                }
                : null;
            const parts = partRows.length > 0
                ? partRows.map((p) => ({
                    part: p.part,
                    description: p.description,
                    priceMin: p.priceMin.toString(),
                    priceMax: p.priceMax.toString(),
                    priceAvg: p.priceAvg.toString(),
                    source: p.source,
                }))
                : null;
            const maxBid = maxBidRow
                ? {
                    maxBid: maxBidRow.maxBid.toString(),
                    analysis: maxBidRow.analysis,
                    createdAt: maxBidRow.createdAt,
                }
                : null;
            const byType = new Map(snapshots.map((s) => [s.type, s.data]));
            let carfax;
            if (!carfaxRow) {
                carfax = { hasReport: false, aiSummary: null, analysis: null };
            }
            else {
                let signedUrl;
                if (carfaxRow.s3Key) {
                    try {
                        signedUrl = await this.s3.getSignedUrl(carfaxRow.s3Key, CARFAX_SIGNED_URL_TTL);
                    }
                    catch {
                    }
                }
                carfax = {
                    hasReport: true,
                    aiSummary: carfaxRow.aiSummary,
                    analysis: carfaxRow.analysis,
                    signedUrl,
                    date: carfaxRow.date,
                };
            }
            return {
                damages,
                parts,
                maxBid,
                marketCheck: byType.get(client_1.AuctionAnalysisType.MARKET_CHECK) ?? null,
                comparables: byType.get(client_1.AuctionAnalysisType.COMPARABLES) ?? null,
                auctionHistory: byType.get(client_1.AuctionAnalysisType.AUCTION_HISTORY) ?? null,
                carfax,
            };
        }
        catch (err) {
            this.logger.error(`gatherForLot(${lotNumber}): query failed — ${err.message}`);
            return NULL_ANALYSIS;
        }
    }
};
exports.AuctionAnalysisService = AuctionAnalysisService;
exports.AuctionAnalysisService = AuctionAnalysisService = AuctionAnalysisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        common_2.S3Service])
], AuctionAnalysisService);
//# sourceMappingURL=auction-analysis.service.js.map
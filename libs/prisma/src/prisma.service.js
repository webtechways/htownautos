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
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
let PrismaService = class PrismaService {
    prisma;
    pool;
    constructor() {
        this.pool = new pg_1.Pool({
            connectionString: process.env.DATABASE_URL,
        });
        const adapter = new adapter_pg_1.PrismaPg(this.pool);
        this.prisma = new client_1.PrismaClient({ adapter });
    }
    get vehicleYear() {
        return this.prisma.vehicleYear;
    }
    get vehicleMake() {
        return this.prisma.vehicleMake;
    }
    get vehicleModel() {
        return this.prisma.vehicleModel;
    }
    get vehicleTrim() {
        return this.prisma.vehicleTrim;
    }
    get vehicle() {
        return this.prisma.vehicle;
    }
    get vehicleEngine() {
        return this.prisma.vehicleEngine;
    }
    get vehicleStatus() {
        return this.prisma.vehicleStatus;
    }
    get mileageUnit() {
        return this.prisma.mileageUnit;
    }
    get meta() {
        return this.prisma.meta;
    }
    get user() {
        return this.prisma.user;
    }
    get tenant() {
        return this.prisma.tenant;
    }
    get tenantUser() {
        return this.prisma.tenantUser;
    }
    get tenantInvitation() {
        return this.prisma.tenantInvitation;
    }
    get role() {
        return this.prisma.role;
    }
    get permission() {
        return this.prisma.permission;
    }
    get rolePermission() {
        return this.prisma.rolePermission;
    }
    get auditLog() {
        return this.prisma.auditLog;
    }
    get dealStatus() {
        return this.prisma.dealStatus;
    }
    get financeType() {
        return this.prisma.financeType;
    }
    get deal() {
        return this.prisma.deal;
    }
    get buyer() {
        return this.prisma.buyer;
    }
    get extraExpense() {
        return this.prisma.extraExpense;
    }
    get media() {
        return this.prisma.media;
    }
    get title() {
        return this.prisma.title;
    }
    get part() {
        return this.prisma.part;
    }
    get partCondition() {
        return this.prisma.partCondition;
    }
    get partStatus() {
        return this.prisma.partStatus;
    }
    get partCategory() {
        return this.prisma.partCategory;
    }
    get vehiclePart() {
        return this.prisma.vehiclePart;
    }
    get uploadSession() {
        return this.prisma.uploadSession;
    }
    get auctionListing() {
        return this.prisma.auctionListing;
    }
    get auctionTitleTypeMapping() {
        return this.prisma.auctionTitleTypeMapping;
    }
    get auctionFavorite() {
        return this.prisma.auctionFavorite;
    }
    get buyerFavorite() {
        return this.prisma.buyerFavorite;
    }
    get task() {
        return this.prisma.task;
    }
    get note() {
        return this.prisma.note;
    }
    get phoneCall() {
        return this.prisma.phoneCall;
    }
    get smsMessage() {
        return this.prisma.smsMessage;
    }
    get emailMessage() {
        return this.prisma.emailMessage;
    }
    get unmatchedInboundEmail() {
        return this.prisma.unmatchedInboundEmail;
    }
    get twilioPhoneNumber() {
        return this.prisma.twilioPhoneNumber;
    }
    get callFlow() {
        return this.prisma.callFlow;
    }
    get ttsCache() {
        return this.prisma.ttsCache;
    }
    get damageAi() {
        return this.prisma.damageAi;
    }
    get auctionVehicleAnalysis() {
        return this.prisma.auctionVehicleAnalysis;
    }
    get auctionPartsPrice() {
        return this.prisma.auctionPartsPrice;
    }
    get similarAuctionCar() {
        return this.prisma.similarAuctionCar;
    }
    get vehicleMarketPart() {
        return this.prisma.vehicleMarketPart;
    }
    get carfaxReport() {
        return this.prisma.carfaxReport;
    }
    get maxBidRecommendation() {
        return this.prisma.maxBidRecommendation;
    }
    get auctionAnalysisSnapshot() {
        return this.prisma.auctionAnalysisSnapshot;
    }
    get shortUrl() {
        return this.prisma.shortUrl;
    }
    get proxy() {
        return this.prisma.proxy;
    }
    get auctionListingGroup() {
        return this.prisma.auctionListingGroup;
    }
    get auctionListingGroupItem() {
        return this.prisma.auctionListingGroupItem;
    }
    get auctionListingReview() {
        return this.prisma.auctionListingReview;
    }
    get buyerAuctionBid() {
        return this.prisma.buyerAuctionBid;
    }
    get buyerVehiclePreference() {
        return this.prisma.buyerVehiclePreference;
    }
    get buyerMatchExclusion() {
        return this.prisma.buyerMatchExclusion;
    }
    get syncRun() {
        return this.prisma.syncRun;
    }
    get rebuildItem() {
        return this.prisma.rebuildItem;
    }
    get vehicleInspection() {
        return this.prisma.vehicleInspection;
    }
    get yard() {
        return this.prisma.yard;
    }
    get inspectionShareLink() {
        return this.prisma.inspectionShareLink;
    }
    get buyerFavoritesShareLink() {
        return this.prisma.buyerFavoritesShareLink;
    }
    get inspectionChecklistItem() {
        return this.prisma.inspectionChecklistItem;
    }
    get inspectionRequestItem() {
        return this.prisma.inspectionRequestItem;
    }
    get inspectionErrorCode() {
        return this.prisma.inspectionErrorCode;
    }
    get inventoryAsset() {
        return this.prisma.inventoryAsset;
    }
    get investment() {
        return this.prisma.investment;
    }
    get socialAccount() {
        return this.prisma.socialAccount;
    }
    get socialGroup() {
        return this.prisma.socialGroup;
    }
    get socialGroupAccount() {
        return this.prisma.socialGroupAccount;
    }
    get partOrder() {
        return this.prisma.partOrder;
    }
    get partOrderItem() {
        return this.prisma.partOrderItem;
    }
    get partShipment() {
        return this.prisma.partShipment;
    }
    get parcelTemplate() {
        return this.prisma.parcelTemplate;
    }
    get apiKey() {
        return this.prisma.apiKey;
    }
    get customerLedgerEntry() {
        return this.prisma.customerLedgerEntry;
    }
    get portalOrder() {
        return this.prisma.portalOrder;
    }
    get depositReleaseRequest() {
        return this.prisma.depositReleaseRequest;
    }
    get notification() {
        return this.prisma.notification;
    }
    get contactMessage() {
        return this.prisma.contactMessage;
    }
    get $transaction() {
        return this.prisma.$transaction.bind(this.prisma);
    }
    get $queryRaw() {
        return this.prisma.$queryRaw.bind(this.prisma);
    }
    get $queryRawUnsafe() {
        return this.prisma.$queryRawUnsafe.bind(this.prisma);
    }
    getModel(modelName) {
        return this.prisma[modelName];
    }
    async onModuleInit() {
        await this.prisma.$connect();
    }
    async onModuleDestroy() {
        await this.prisma.$disconnect();
        await this.pool.end();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map
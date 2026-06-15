import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;
  private pool: Pool;

  constructor() {
    // Create PostgreSQL connection pool
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Create the adapter
    const adapter = new PrismaPg(this.pool);

    // Initialize PrismaClient with adapter
    this.prisma = new PrismaClient({ adapter });
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

  // Parts inventory
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

  get inspectionChecklistItem() {
    return this.prisma.inspectionChecklistItem;
  }

  get inspectionRequestItem() {
    return this.prisma.inspectionRequestItem;
  }

  get inventoryAsset() {
    return this.prisma.inventoryAsset;
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

  get $transaction() {
    return this.prisma.$transaction.bind(this.prisma);
  }

  get $queryRaw() {
    return this.prisma.$queryRaw.bind(this.prisma);
  }

  get $queryRawUnsafe() {
    return this.prisma.$queryRawUnsafe.bind(this.prisma);
  }

  // Allow dynamic access to Prisma models
  getModel(modelName: string) {
    return this.prisma[modelName];
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
    await this.pool.end();
  }
}

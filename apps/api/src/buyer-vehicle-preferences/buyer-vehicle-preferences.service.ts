import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import { preferenceToWhere } from '@htownautos/auction-matching';
import { CreateBuyerVehiclePreferenceDto } from './dto/create-buyer-vehicle-preference.dto';
import { UpdateBuyerVehiclePreferenceDto } from './dto/update-buyer-vehicle-preference.dto';
import { isFutureSale } from './sale-time.util';
import { SellerClassificationService } from '../seller-classification/seller-classification.service';
import { AuctionAliasService } from '../auction-alias/auction-alias.service';

function serialize(pref: any) {
  return {
    ...pref,
    maxCost: pref.maxCost?.toString() ?? null,
  };
}

/**
 * Fields the frontend needs to render a "matching auction listing" card.
 * Mirrors the shape already used by buyer-for-bids-api.ts for consistency.
 */
const MATCH_LISTING_SELECT = {
  lotNumber: true,
  year: true,
  make: true,
  modelGroup: true,
  modelDetail: true,
  trim: true,
  vin: true,
  bodyStyle: true,
  color: true,
  odometer: true,
  damageDescription: true,
  secondaryDamage: true,
  saleTitleType: true,
  hasKeys: true,
  runsDrives: true,
  locationCity: true,
  locationState: true,
  saleDate: true,
  dayOfWeek: true,
  saleStatus: true,
  highBid: true,
  buyItNowPrice: true,
  estRetailValue: true,
  repairCost: true,
  images: true,
  itemNumber: true,
  sellerName: true,
} as const;

function serializeListing(l: any) {
  return {
    ...l,
    lotNumber: l.lotNumber?.toString() ?? null,
    odometer: l.odometer != null ? Number(l.odometer) : null,
    highBid: l.highBid?.toString() ?? null,
    buyItNowPrice: l.buyItNowPrice?.toString() ?? null,
    estRetailValue: l.estRetailValue?.toString() ?? null,
    repairCost: l.repairCost?.toString() ?? null,
    saleDate: l.saleDate != null ? String(l.saleDate) : null,
  };
}

@Injectable()
export class BuyerVehiclePreferencesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sellerClassification: SellerClassificationService,
    private readonly aliases: AuctionAliasService,
  ) {}

  private async ensureBuyer(buyerId: string, tenantId: string): Promise<void> {
    const exists = await this.prisma.buyer.findFirst({
      where: { id: buyerId, tenantId: tenantId || undefined },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Buyer ${buyerId} not found`);
    }
  }

  async list(buyerId: string, tenantId: string) {
    await this.ensureBuyer(buyerId, tenantId);
    const rows = await this.prisma.buyerVehiclePreference.findMany({
      where: { buyerId, tenantId: tenantId || undefined },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(serialize);
  }

  async create(
    buyerId: string,
    tenantId: string,
    userId: string | null,
    dto: CreateBuyerVehiclePreferenceDto,
  ) {
    await this.ensureBuyer(buyerId, tenantId);

    const created = await this.prisma.buyerVehiclePreference.create({
      data: {
        buyerId,
        tenantId: tenantId || null,
        createdBy: userId,
        make: dto.make,
        yearFrom: dto.yearFrom ?? null,
        yearTo: dto.yearTo ?? null,
        models: dto.models ?? [],
        trims: dto.trims ?? [],
        maxMileage: dto.maxMileage ?? null,
        titleTypes: dto.titleTypes ?? [],
        colors: dto.colors ?? [],
        // `!= null` catches both undefined and null — the frontend explicitly
        // sends `null` when the user leaves Max Cost empty.
        maxCost:
          dto.maxCost != null ? new Prisma.Decimal(dto.maxCost) : null,
        notes: dto.notes ?? null,
      },
    });
    return serialize(created);
  }

  async update(
    id: string,
    buyerId: string,
    tenantId: string,
    dto: UpdateBuyerVehiclePreferenceDto,
  ) {
    const existing = await this.prisma.buyerVehiclePreference.findFirst({
      where: { id, buyerId, tenantId: tenantId || undefined },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(`Preference ${id} not found`);
    }

    const data: Prisma.BuyerVehiclePreferenceUpdateInput = {};
    if (dto.make !== undefined) data.make = dto.make;
    if (dto.yearFrom !== undefined) data.yearFrom = dto.yearFrom;
    if (dto.yearTo !== undefined) data.yearTo = dto.yearTo;
    if (dto.models !== undefined) data.models = dto.models;
    if (dto.trims !== undefined) data.trims = dto.trims;
    if (dto.maxMileage !== undefined) data.maxMileage = dto.maxMileage;
    if (dto.titleTypes !== undefined) data.titleTypes = dto.titleTypes;
    if (dto.colors !== undefined) data.colors = dto.colors;
    if (dto.maxCost !== undefined) {
      data.maxCost =
        dto.maxCost === null ? null : new Prisma.Decimal(dto.maxCost);
    }
    if (dto.notes !== undefined) data.notes = dto.notes;

    const updated = await this.prisma.buyerVehiclePreference.update({
      where: { id },
      data,
    });
    return serialize(updated);
  }

  /**
   * Return every active auction listing that matches at least one of the
   * buyer's wanted-vehicle preferences. Excludes lots where highBid
   * already exceeds the preference's maxCost (budget cap).
   *
   * @param inspectableOnly When true, restricts results to listings whose
   *   yard has physicalInspectionAvailable = true.
   */
  async matches(
    buyerId: string,
    tenantId: string,
    inspectableOnly = false,
    trustedSeller = false,
  ) {
    await this.ensureBuyer(buyerId, tenantId);

    const prefs = await this.prisma.buyerVehiclePreference.findMany({
      where: { buyerId, tenantId: tenantId || undefined },
    });
    if (prefs.length === 0) return [];

    const aliasMaps = await this.aliases.getAllMaps();
    const orClauses = prefs.map((p) => preferenceToWhere(p, aliasMaps));

    // Cheap SQL pre-filter: drop anything whose saleDate is clearly in the
    // past (yesterday or earlier). Keeps the fine-grained tz-aware filter
    // below from having to scan the whole archive.
    const today = new Date();
    const todayInt =
      today.getUTCFullYear() * 10000 +
      (today.getUTCMonth() + 1) * 100 +
      today.getUTCDate();

    const andClauses: Prisma.AuctionListingWhereInput[] = [
      { OR: orClauses },
      {
        OR: [
          { saleDate: null },
          { saleDate: { gte: todayInt - 1 } }, // 1-day margin for TZ wraparound
        ],
      },
    ];

    if (inspectableOnly) {
      andClauses.push({ yard: { is: { physicalInspectionAvailable: true } } });
    }

    // Trusted-seller filter: only lots from sellers staff have marked trusted in
    // Settings → Sellers (AuctionSellerClassification). Replaces the old fixed
    // Insurance/Rental/Repo heuristic. An empty trusted list yields 0 matches,
    // same as before when nothing qualified.
    if (trustedSeller) {
      const trustedNames =
        await this.sellerClassification.getTrustedSellerNames();
      andClauses.push({ sellerName: { in: trustedNames } });
    }

    // Load dismissed lots for this buyer and exclude them from results.
    const exclusionRows = await this.prisma.buyerMatchExclusion.findMany({
      where: { buyerId },
      select: { lotNumber: true },
    });
    if (exclusionRows.length > 0) {
      andClauses.push({
        lotNumber: { notIn: exclusionRows.map((r) => r.lotNumber) },
      });
    }

    const listings = await this.prisma.auctionListing.findMany({
      where: { AND: andClauses },
      take: 1000,
      orderBy: [
        { saleDate: { sort: 'asc', nulls: 'last' } },
        { itemNumber: { sort: 'asc', nulls: 'last' } },
        { lotNumber: 'asc' },
      ],
      select: {
        ...MATCH_LISTING_SELECT,
        saleTime: true,
        timeZone: true,
      },
    });

    // Precise filter: drop lots whose sale moment (saleDate+saleTime in
    // the lot's timeZone) already passed. saleDate=null lots always pass
    // and render as "Future Sale" in the UI.
    const now = new Date();
    const future = listings.filter((l) =>
      isFutureSale(l.saleDate, l.saleTime, l.timeZone, now),
    );
    return future.slice(0, 500).map(serializeListing);
  }

  async remove(id: string, buyerId: string, tenantId: string) {
    const existing = await this.prisma.buyerVehiclePreference.findFirst({
      where: { id, buyerId, tenantId: tenantId || undefined },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(`Preference ${id} not found`);
    }
    await this.prisma.buyerVehiclePreference.delete({ where: { id } });
    return { deleted: true };
  }

  // ---------------------------------------------------------------------------
  // Match exclusions (dismiss / un-dismiss / reset)
  // ---------------------------------------------------------------------------

  async addExclusion(
    buyerId: string,
    tenantId: string,
    lotNumberStr: string,
    createdById: string | null,
  ) {
    await this.ensureBuyer(buyerId, tenantId);
    const lotNumber = BigInt(lotNumberStr);
    const row = await this.prisma.buyerMatchExclusion.upsert({
      where: { buyerId_lotNumber: { buyerId, lotNumber } },
      create: {
        buyerId,
        tenantId: tenantId || null,
        lotNumber,
        createdById: createdById || null,
      },
      update: {},
    });
    return { ...row, lotNumber: row.lotNumber.toString() };
  }

  async removeExclusion(
    buyerId: string,
    tenantId: string,
    lotNumberStr: string,
  ) {
    await this.ensureBuyer(buyerId, tenantId);
    const lotNumber = BigInt(lotNumberStr);
    await this.prisma.buyerMatchExclusion.deleteMany({
      where: { buyerId, lotNumber },
    });
    return { ok: true };
  }

  async resetExclusions(buyerId: string, tenantId: string) {
    await this.ensureBuyer(buyerId, tenantId);
    const result = await this.prisma.buyerMatchExclusion.deleteMany({
      where: { buyerId },
    });
    return { removed: result.count };
  }

  async listExclusions(buyerId: string, tenantId: string) {
    await this.ensureBuyer(buyerId, tenantId);
    const rows = await this.prisma.buyerMatchExclusion.findMany({
      where: { buyerId },
      orderBy: { createdAt: 'asc' },
      select: { lotNumber: true, createdAt: true },
    });
    return { lotNumbers: rows.map((r) => r.lotNumber.toString()) };
  }
}

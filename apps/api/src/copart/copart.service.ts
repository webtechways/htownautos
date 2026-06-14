import { Injectable } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
import { QueryCopartDto } from './dto/query-copart.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CopartService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryCopartDto) {
    const {
      page = 1,
      limit = 20,
      search,
      make,
      model,
      year,
      damageDescription,
      saleStatus,
      locationState,
      minPrice,
      maxPrice,
      minOdometer,
      maxOdometer,
      hasKeys,
      runsDrives,
      saleTitleType,
      saleDateFrom,
      saleDateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ids,
      inspectableOnly,
    } = query;

    const skip = (page - 1) * limit;

    // Parse IDs filter (comma-separated string)
    const idList = ids ? ids.split(',').filter((id) => id.trim()) : null;

    // Build where clause
    const where: Prisma.AuctionListingWhereInput = {
      AND: [
        // IDs filter (for favorites)
        idList && idList.length > 0 ? { lotNumber: { in: idList.map((id) => BigInt(id.trim())) } } : {},
        // Search across VIN, make, model
        search
          ? {
              OR: [
                { vin: { contains: search, mode: 'insensitive' } },
                { make: { contains: search, mode: 'insensitive' } },
                { modelGroup: { contains: search, mode: 'insensitive' } },
                { modelDetail: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},

        // Make filter
        make ? { make: { equals: make, mode: 'insensitive' } } : {},

        // Model filter (matches modelGroup or modelDetail)
        model
          ? {
              OR: [
                { modelGroup: { contains: model, mode: 'insensitive' } },
                { modelDetail: { contains: model, mode: 'insensitive' } },
              ],
            }
          : {},

        // Year filter
        year ? { year } : {},

        // Damage filter
        damageDescription
          ? { damageDescription: { contains: damageDescription, mode: 'insensitive' } }
          : {},

        // Sale status filter
        saleStatus
          ? { saleStatus: { contains: saleStatus, mode: 'insensitive' } }
          : {},

        // Location state filter
        locationState
          ? { locationState: { equals: locationState, mode: 'insensitive' } }
          : {},

        // Price range (using estRetailValue)
        minPrice || maxPrice
          ? {
              estRetailValue: {
                ...(minPrice && { gte: minPrice }),
                ...(maxPrice && { lte: maxPrice }),
              },
            }
          : {},

        // Odometer range
        minOdometer || maxOdometer
          ? {
              odometer: {
                ...(minOdometer && { gte: minOdometer }),
                ...(maxOdometer && { lte: maxOdometer }),
              },
            }
          : {},

        // Has keys filter
        hasKeys ? { hasKeys } : {},

        // Runs/Drives filter
        runsDrives
          ? { runsDrives: { contains: runsDrives, mode: 'insensitive' } }
          : {},

        // Title type filter
        saleTitleType
          ? { saleTitleType: { equals: saleTitleType, mode: 'insensitive' } }
          : {},

        // Sale date range filter (saleDate is stored as YYYYMMDD integer)
        saleDateFrom || saleDateTo
          ? {
              saleDate: {
                ...(saleDateFrom && { gte: saleDateFrom }),
                ...(saleDateTo && { lte: saleDateTo }),
              },
            }
          : {},

        // Inspectable filter — only listings whose yard offers on-site inspection
        inspectableOnly === true
          ? { yard: { is: { physicalInspectionAvailable: true } } }
          : {},
      ],
    };

    // Build orderBy
    const orderBy: Prisma.AuctionListingOrderByWithRelationInput = {};
    const validSortFields = [
      'createdAt',
      'year',
      'make',
      'estRetailValue',
      'odometer',
      'saleDate',
      'highBid',
    ];
    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.createdAt = 'desc';
    }

    // Execute queries in parallel
    const [listings, total] = await Promise.all([
      this.prisma.auctionListing.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          yard: { select: { physicalInspectionAvailable: true } },
        },
      }),
      this.prisma.auctionListing.count({ where }),
    ]);

    // Convert BigInt to string for JSON serialization and surface a flat
    // `inspectable` flag derived from the yard's on-site inspection availability.
    const serializedListings = listings.map(({ yard, ...listing }) => ({
      ...listing,
      lotNumber: listing.lotNumber.toString(),
      inspectable: yard?.physicalInspectionAvailable ?? false,
    }));

    return {
      data: serializedListings,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const listing = await this.prisma.auctionListing.findUnique({
      where: { lotNumber: BigInt(id) },
      include: { yard: { select: { physicalInspectionAvailable: true } } },
    });

    if (!listing) {
      return null;
    }

    const { yard, ...rest } = listing;
    return {
      ...rest,
      lotNumber: listing.lotNumber.toString(),
      inspectable: yard?.physicalInspectionAvailable ?? false,
    };
  }

  async findByLotNumber(lotNumber: string) {
    const listing = await this.prisma.auctionListing.findUnique({
      where: { lotNumber: BigInt(lotNumber) },
      include: { yard: { select: { physicalInspectionAvailable: true } } },
    });

    if (!listing) {
      return null;
    }

    const { yard, ...rest } = listing;
    return {
      ...rest,
      lotNumber: listing.lotNumber.toString(),
      inspectable: yard?.physicalInspectionAvailable ?? false,
    };
  }

  async getFilterOptions() {
    // Get distinct values for filters
    const [makes, damageTypes, saleStatuses, states, years, titleTypes] = await Promise.all([
      this.prisma.$queryRaw<{ make: string }[]>`
        SELECT DISTINCT make FROM auction_listings WHERE make IS NOT NULL ORDER BY make
      `,
      this.prisma.$queryRaw<{ damageDescription: string }[]>`
        SELECT DISTINCT "damageDescription" FROM auction_listings WHERE "damageDescription" IS NOT NULL ORDER BY "damageDescription"
      `,
      this.prisma.$queryRaw<{ saleStatus: string }[]>`
        SELECT DISTINCT "saleStatus" FROM auction_listings WHERE "saleStatus" IS NOT NULL ORDER BY "saleStatus"
      `,
      this.prisma.$queryRaw<{ locationState: string }[]>`
        SELECT DISTINCT "locationState" FROM auction_listings WHERE "locationState" IS NOT NULL ORDER BY "locationState"
      `,
      this.prisma.$queryRaw<{ year: number }[]>`
        SELECT DISTINCT year FROM auction_listings WHERE year IS NOT NULL ORDER BY year DESC
      `,
      this.prisma.$queryRaw<{ saleTitleType: string }[]>`
        SELECT DISTINCT "saleTitleType" FROM auction_listings WHERE "saleTitleType" IS NOT NULL ORDER BY "saleTitleType"
      `,
    ]);

    return {
      makes: makes.map((m) => m.make),
      damageTypes: damageTypes.map((d) => d.damageDescription),
      saleStatuses: saleStatuses.map((s) => s.saleStatus),
      states: states.map((s) => s.locationState),
      years: years.map((y) => y.year),
      titleTypes: titleTypes.map((t) => t.saleTitleType),
    };
  }

  async getStats() {
    const [total, byDamage, byState] = await Promise.all([
      this.prisma.auctionListing.count(),
      this.prisma.auctionListing.groupBy({
        by: ['damageDescription'],
        _count: true,
        orderBy: { _count: { damageDescription: 'desc' } },
        take: 10,
      }),
      this.prisma.auctionListing.groupBy({
        by: ['locationState'],
        _count: true,
        orderBy: { _count: { locationState: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      total,
      byDamage,
      byState,
    };
  }
}

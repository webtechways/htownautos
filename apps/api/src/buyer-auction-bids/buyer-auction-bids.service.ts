import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import { BidItemDto } from './dto/create-buyer-auction-bid.dto';
import { UpdateBuyerAuctionBidDto } from './dto/update-buyer-auction-bid.dto';

const LISTING_SELECT = {
  lotNumber: true,
  year: true,
  make: true,
  modelGroup: true,
  modelDetail: true,
  vin: true,
  bodyStyle: true,
  odometer: true,
  damageDescription: true,
  secondaryDamage: true,
  saleTitleType: true,
  hasKeys: true,
  runsDrives: true,
  locationCity: true,
  locationState: true,
  saleDate: true,
  saleStatus: true,
  highBid: true,
  buyItNowPrice: true,
  estRetailValue: true,
  repairCost: true,
  images: true,
  itemNumber: true,
} as const;

function serializeBid(bid: any) {
  return {
    ...bid,
    lotNumber: bid.lotNumber?.toString(),
    maxBid: bid.maxBid?.toString(),
    finalAmount: bid.finalAmount?.toString() ?? null,
    auctionListing: bid.auctionListing
      ? {
          ...bid.auctionListing,
          lotNumber: bid.auctionListing.lotNumber?.toString(),
          highBid: bid.auctionListing.highBid?.toString() ?? null,
          buyItNowPrice:
            bid.auctionListing.buyItNowPrice?.toString() ?? null,
          estRetailValue:
            bid.auctionListing.estRetailValue?.toString() ?? null,
          repairCost: bid.auctionListing.repairCost?.toString() ?? null,
        }
      : null,
  };
}

@Injectable()
export class BuyerAuctionBidsService {
  constructor(private readonly prisma: PrismaService) {}

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
    const rows = await this.prisma.buyerAuctionBid.findMany({
      where: { buyerId, tenantId: tenantId || undefined },
      orderBy: [
        { auctionListing: { saleDate: { sort: 'asc', nulls: 'last' } } },
        { auctionListing: { itemNumber: { sort: 'asc', nulls: 'last' } } },
        { lotNumber: 'asc' },
      ],
      include: { auctionListing: { select: LISTING_SELECT } },
    });
    return rows.map(serializeBid);
  }

  async createMany(
    buyerId: string,
    tenantId: string,
    userId: string | null,
    items: BidItemDto[],
  ) {
    await this.ensureBuyer(buyerId, tenantId);

    const lotNumbers = items.map((i) => {
      try {
        return BigInt(i.lotNumber);
      } catch {
        throw new BadRequestException(`Invalid lotNumber: ${i.lotNumber}`);
      }
    });

    const existingListings = await this.prisma.auctionListing.findMany({
      where: { lotNumber: { in: lotNumbers } },
      select: { lotNumber: true },
    });
    const existingSet = new Set(
      existingListings.map((l) => l.lotNumber.toString()),
    );
    const missing = items
      .filter((i) => !existingSet.has(i.lotNumber.toString()))
      .map((i) => i.lotNumber);
    if (missing.length > 0) {
      throw new NotFoundException(
        `Auction listings not found: ${missing.join(', ')}`,
      );
    }

    const results = await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.buyerAuctionBid.upsert({
          where: {
            buyerId_lotNumber: {
              buyerId,
              lotNumber: BigInt(item.lotNumber),
            },
          },
          create: {
            buyerId,
            lotNumber: BigInt(item.lotNumber),
            maxBid: new Prisma.Decimal(item.maxBid),
            notes: item.notes ?? null,
            tenantId: tenantId || null,
            createdBy: userId,
          },
          update: {
            maxBid: new Prisma.Decimal(item.maxBid),
            ...(item.notes !== undefined && { notes: item.notes }),
          },
          include: { auctionListing: { select: LISTING_SELECT } },
        }),
      ),
    );

    return results.map(serializeBid);
  }

  async update(
    id: string,
    buyerId: string,
    tenantId: string,
    dto: UpdateBuyerAuctionBidDto,
  ) {
    const existing = await this.prisma.buyerAuctionBid.findFirst({
      where: { id, buyerId, tenantId: tenantId || undefined },
    });
    if (!existing) {
      throw new NotFoundException(`Bid ${id} not found`);
    }

    const data: Prisma.BuyerAuctionBidUpdateInput = {};
    if (dto.maxBid !== undefined) data.maxBid = new Prisma.Decimal(dto.maxBid);
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.finalAmount !== undefined) {
      data.finalAmount =
        dto.finalAmount === null ? null : new Prisma.Decimal(dto.finalAmount);
    }
    if (dto.notes !== undefined) data.notes = dto.notes;

    const updated = await this.prisma.buyerAuctionBid.update({
      where: { id },
      data,
      include: { auctionListing: { select: LISTING_SELECT } },
    });
    return serializeBid(updated);
  }

  async remove(id: string, buyerId: string, tenantId: string) {
    const existing = await this.prisma.buyerAuctionBid.findFirst({
      where: { id, buyerId, tenantId: tenantId || undefined },
      select: { id: true, status: true },
    });
    if (!existing) {
      throw new NotFoundException(`Bid ${id} not found`);
    }
    if (existing.status !== 'pending') {
      throw new BadRequestException(
        'Only pending bids can be removed. Change status to pending first.',
      );
    }
    await this.prisma.buyerAuctionBid.delete({ where: { id } });
    return { deleted: true };
  }
}

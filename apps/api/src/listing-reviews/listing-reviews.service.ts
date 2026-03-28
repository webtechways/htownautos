import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';

@Injectable()
export class ListingReviewsService {
  private readonly logger = new Logger(ListingReviewsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getByLotNumber(tenantId: string, lotNumber: bigint) {
    return this.prisma.auctionListingReview.findUnique({
      where: { tenantId_lotNumber: { tenantId, lotNumber } },
    });
  }

  async upsert(
    tenantId: string,
    userId: string,
    lotNumber: bigint,
    data: { notes?: string; checked?: boolean; damageLevel?: string | null },
  ) {
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
    } catch (error) {
      this.logger.error(`[upsert] Failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { AuctionAnalysisType } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DamageItem {
  part: string;
  description: string | null;
  level: number;
  partCost: string;
  laborCost: string;
}

export interface DamagesBlock {
  id: string;
  createdAt: Date;
  items: DamageItem[];
}

export interface PartsPricingItem {
  part: string;
  description: string | null;
  priceMin: string;
  priceMax: string;
  priceAvg: string;
  source: string;
}

export interface MaxBidBlock {
  maxBid: string;
  analysis: string;
  createdAt: Date;
}

export interface CarfaxBlock {
  hasReport: boolean;
  aiSummary: string | null;
  analysis: string | null;
  signedUrl?: string;
  date?: Date | null;
}

export interface InspectionAuctionAnalysis {
  damages: DamagesBlock | null;
  parts: PartsPricingItem[] | null;
  maxBid: MaxBidBlock | null;
  marketCheck: unknown | null;
  comparables: unknown | null;
  auctionHistory: unknown | null;
  carfax: CarfaxBlock;
}

const NULL_ANALYSIS: InspectionAuctionAnalysis = {
  damages: null,
  parts: null,
  maxBid: null,
  marketCheck: null,
  comparables: null,
  auctionHistory: null,
  carfax: { hasReport: false, aiSummary: null, analysis: null },
};

// ── Service ───────────────────────────────────────────────────────────────────

const CARFAX_SIGNED_URL_TTL = 60 * 60 * 6; // 6 hours

@Injectable()
export class AuctionAnalysisService {
  private readonly logger = new Logger(AuctionAnalysisService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  /**
   * Gather all auction-analysis data for a given lot number. Queries run in
   * parallel for performance. Returns a stable shape with nulls for any block
   * that hasn't been generated yet — callers should treat null as "Pending".
   *
   * Never throws: any DB error is logged and the full null shape is returned so
   * the inspection payload is never blocked by an analysis query failure.
   */
  async gatherForLot(lotNumber: string | null): Promise<InspectionAuctionAnalysis> {
    if (!lotNumber) return NULL_ANALYSIS;

    let listingId: bigint;
    try {
      listingId = BigInt(lotNumber);
    } catch {
      // Non-numeric lot — no auction listing record possible.
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

      // ── damages ──────────────────────────────────────────────────────────
      const damages: DamagesBlock | null = damageRow
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

      // ── parts pricing ─────────────────────────────────────────────────────
      const parts: PartsPricingItem[] | null =
        partRows.length > 0
          ? partRows.map((p) => ({
              part: p.part,
              description: p.description,
              priceMin: p.priceMin.toString(),
              priceMax: p.priceMax.toString(),
              priceAvg: p.priceAvg.toString(),
              source: p.source,
            }))
          : null;

      // ── max bid ───────────────────────────────────────────────────────────
      const maxBid: MaxBidBlock | null = maxBidRow
        ? {
            maxBid: maxBidRow.maxBid.toString(),
            analysis: maxBidRow.analysis,
            createdAt: maxBidRow.createdAt,
          }
        : null;

      // ── snapshots (indexed by type) ───────────────────────────────────────
      const byType = new Map(snapshots.map((s) => [s.type, s.data]));

      // ── carfax ────────────────────────────────────────────────────────────
      let carfax: CarfaxBlock;
      if (!carfaxRow) {
        carfax = { hasReport: false, aiSummary: null, analysis: null };
      } else {
        let signedUrl: string | undefined;
        if (carfaxRow.s3Key) {
          try {
            signedUrl = await this.s3.getSignedUrl(carfaxRow.s3Key, CARFAX_SIGNED_URL_TTL);
          } catch {
            /* swallow — signed URL generation is best-effort */
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
        marketCheck: byType.get(AuctionAnalysisType.MARKET_CHECK) ?? null,
        comparables: byType.get(AuctionAnalysisType.COMPARABLES) ?? null,
        auctionHistory: byType.get(AuctionAnalysisType.AUCTION_HISTORY) ?? null,
        carfax,
      };
    } catch (err) {
      this.logger.error(
        `gatherForLot(${lotNumber}): query failed — ${(err as Error).message}`,
      );
      return NULL_ANALYSIS;
    }
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';
import { CreateShareLinkDto } from './dto/create-share-link.dto';
import { ShortUrlService } from '../short-url/short-url.service';
import { AuctionAnalysisService } from '../auction-analysis/auction-analysis.service';

const MEDIA_SIGNED_URL_TTL = 60 * 60 * 6; // 6 hours

@Injectable()
export class InspectionShareLinksService {
  private readonly logger = new Logger(InspectionShareLinksService.name);
  private readonly appBaseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
    private readonly shortUrl: ShortUrlService,
    private readonly auctionAnalysis: AuctionAnalysisService,
  ) {
    this.appBaseUrl = (
      process.env.APP_BASE_URL || 'https://app.htownautos.com'
    ).replace(/\/+$/, '');
  }

  /** Construct the full long URL that the share token resolves to. */
  private buildLongUrl(vin: string, token: string): string {
    const qs = new URLSearchParams({ vin, token });
    return `${this.appBaseUrl}/dashboard/inspection/shared?${qs.toString()}`;
  }

  // ─── admin (authenticated) ─────────────────────────────────────────

  async create(
    inspectionId: string,
    tenantId: string,
    userId: string | null,
    dto: CreateShareLinkDto,
  ) {
    // ensureInspection also gives us back the VIN we need for the long URL.
    const inspection = await this.prisma.vehicleInspection.findFirst({
      where: { id: inspectionId, tenantId: tenantId || undefined },
      select: { id: true, vin: true },
    });
    if (!inspection) {
      throw new NotFoundException(`Inspection ${inspectionId} not found`);
    }

    const expiresAt = dto.expiresInHours
      ? new Date(Date.now() + dto.expiresInHours * 60 * 60 * 1000)
      : null;

    // 32 URL-safe random bytes → 43 chars (base64url, no padding).
    // 256 bits of entropy — overkill but cheap.
    const token = randomBytes(32).toString('base64url');

    const link = await this.prisma.inspectionShareLink.create({
      data: {
        token,
        inspectionId,
        expiresAt,
        createdBy: userId,
      },
    });

    // Generate the companion short URL. Best-effort: if the shortener
    // throws (e.g. no tenant, DB issue) the share link still works via
    // its long URL — we just don't populate shortUrlCode.
    let shortUrlCode: string | null = null;
    if (tenantId) {
      try {
        const longUrl = this.buildLongUrl(inspection.vin, token);
        const res = await this.shortUrl.create(
          longUrl,
          tenantId,
          userId ?? undefined,
          expiresAt ?? undefined,
        );
        shortUrlCode = res.code;
        await this.prisma.inspectionShareLink.update({
          where: { id: link.id },
          data: { shortUrlCode },
        });
      } catch (err) {
        this.logger.warn(
          `Short URL creation failed for share link ${link.id}: ${(err as Error).message}`,
        );
      }
    }

    return {
      ...link,
      shortUrlCode,
      shortUrl: shortUrlCode
        ? this.shortUrl.buildShortUrl(shortUrlCode)
        : null,
    };
  }

  async listForInspection(inspectionId: string, tenantId: string) {
    await this.ensureInspection(inspectionId, tenantId);
    const rows = await this.prisma.inspectionShareLink.findMany({
      where: { inspectionId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => ({
      ...r,
      shortUrl: r.shortUrlCode
        ? this.shortUrl.buildShortUrl(r.shortUrlCode)
        : null,
    }));
  }

  async revoke(linkId: string, tenantId: string) {
    const link = await this.prisma.inspectionShareLink.findUnique({
      where: { id: linkId },
      include: {
        inspection: { select: { tenantId: true } },
      },
    });
    if (!link) throw new NotFoundException('Share link not found');
    if (tenantId && link.inspection.tenantId !== tenantId) {
      throw new ForbiddenException('Cannot revoke another tenant share link');
    }
    return this.prisma.inspectionShareLink.update({
      where: { id: linkId },
      data: { revoked: true },
    });
  }

  /** Hard-delete the row from the table (used to clean up old revoked/expired entries). */
  async remove(linkId: string, tenantId: string) {
    const link = await this.prisma.inspectionShareLink.findUnique({
      where: { id: linkId },
      include: { inspection: { select: { tenantId: true } } },
    });
    if (!link) throw new NotFoundException('Share link not found');
    if (tenantId && link.inspection.tenantId !== tenantId) {
      throw new ForbiddenException('Cannot delete another tenant share link');
    }
    await this.prisma.inspectionShareLink.delete({ where: { id: linkId } });
    return { deleted: true };
  }

  // ─── public (no auth) ──────────────────────────────────────────────

  /**
   * Resolve a token to a fully-rendered, read-only inspection payload.
   * Throws NotFound for any failure mode (expired / revoked / wrong vin
   * / token unknown) — the response never tells an attacker WHY the
   * lookup failed.
   */
  async resolvePublic(token: string, vin: string) {
    if (!token || !vin) throw new NotFoundException('Inspection not found');

    const link = await this.prisma.inspectionShareLink.findUnique({
      where: { token },
      include: {
        inspection: {
          include: {
            checklist: {
              orderBy: [
                { sortOrder: 'asc' as const },
                { createdAt: 'asc' as const },
              ] satisfies Prisma.InspectionChecklistItemOrderByWithRelationInput[],
              include: {
                media: { orderBy: { createdAt: 'asc' as const } },
              },
            },
            requestItems: {
              orderBy: [
                { sortOrder: 'asc' as const },
                { createdAt: 'asc' as const },
              ] satisfies Prisma.InspectionRequestItemOrderByWithRelationInput[],
              include: {
                media: { orderBy: { createdAt: 'asc' as const } },
              },
            },
            errorCodes: {
              orderBy: [
                { sortOrder: 'asc' as const },
                { createdAt: 'asc' as const },
              ] satisfies Prisma.InspectionErrorCodeOrderByWithRelationInput[],
              include: {
                media: { orderBy: { createdAt: 'asc' as const } },
              },
            },
            media: { orderBy: { createdAt: 'asc' as const } },
          },
        },
      },
    });

    if (!link || link.revoked) throw new NotFoundException('Inspection not found');
    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new NotFoundException('Inspection not found');
    }
    if (
      link.inspection.vin.toUpperCase().trim() !== vin.toUpperCase().trim()
    ) {
      throw new NotFoundException('Inspection not found');
    }

    // Best-effort access log; doesn't block the response.
    this.prisma.inspectionShareLink
      .update({
        where: { id: link.id },
        data: { lastAccessedAt: new Date() },
      })
      .catch(() => undefined);

    // Pre-sign every media URL so the public client never needs to
    // touch the authenticated signed-url endpoint. 6h TTL — generous
    // enough to keep the page usable, short enough that a leaked URL
    // expires reasonably fast.
    const inspection = link.inspection;
    const allMedia: { storageKey: string | null; signedUrl?: string }[] = [
      ...inspection.media,
      ...inspection.checklist.flatMap((c) => c.media),
      ...inspection.requestItems.flatMap((r) => r.media),
      ...(inspection as any).errorCodes.flatMap((e: any) => e.media),
    ];
    await Promise.all(
      allMedia.map(async (m) => {
        if (!m.storageKey) return;
        try {
          // Mutate the Media row's `url` so the client can use it directly.
          (m as any).url = await this.s3.getSignedUrl(
            m.storageKey,
            MEDIA_SIGNED_URL_TTL,
          );
        } catch {
          /* swallow — broken keys just don't display */
        }
      }),
    );

    // Pull Carfax in the same shape the inspection's CarfaxBlock expects.
    const carfax = await this.fetchCarfaxForVehicle(
      inspection.vin,
      inspection.lotNumber,
    );

    // Attach all auction-analysis blocks. Best-effort: null means "Pending".
    const analysis = await this.auctionAnalysis.gatherForLot(
      inspection.lotNumber ?? null,
    );

    return {
      // Identity / header (intentionally lean — no createdBy, no tenant id,
      // no shared-with list).
      id: inspection.id,
      vin: inspection.vin,
      lotNumber: inspection.lotNumber,
      yardName: inspection.yardName,
      yardNumber: inspection.yardNumber,
      status: inspection.status,
      requestedAt: inspection.requestedAt,
      inspectedAt: inspection.inspectedAt,
      completedAt: inspection.completedAt,
      overallRating: inspection.overallRating,
      notes: inspection.notes,
      // Full content (read-only on the client).
      media: inspection.media,
      checklist: inspection.checklist,
      requestItems: inspection.requestItems,
      errorCodes: (inspection as any).errorCodes,
      carfax,
      analysis,
      // Link metadata for the page footer.
      shareLink: {
        expiresAt: link.expiresAt,
      },
    };
  }

  // ─── helpers ───────────────────────────────────────────────────────

  private async ensureInspection(id: string, tenantId: string): Promise<void> {
    const exists = await this.prisma.vehicleInspection.findFirst({
      where: { id, tenantId: tenantId || undefined },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException(`Inspection ${id} not found`);
  }

  private async fetchCarfaxForVehicle(
    vin: string,
    lotNumber: string | null,
  ) {
    const orClauses: Prisma.CarfaxReportWhereInput[] = [{ vin }];
    if (lotNumber) {
      try {
        orClauses.push({ auctionListingId: BigInt(lotNumber) });
      } catch {
        /* non-numeric lot */
      }
    }
    const reports = await this.prisma.carfaxReport.findMany({
      where: { OR: orClauses },
      orderBy: { createdAt: 'desc' },
    });
    // Pre-sign the PDFs too — same rationale as media.
    await Promise.all(
      reports.map(async (r) => {
        if (!r.s3Key) return;
        try {
          (r as any).signedUrl = await this.s3.getSignedUrl(
            r.s3Key,
            MEDIA_SIGNED_URL_TTL,
          );
        } catch {
          /* swallow */
        }
      }),
    );
    return reports;
  }
}

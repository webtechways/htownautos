import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';
import { CreateShareLinkDto } from './dto/create-share-link.dto';

const MEDIA_SIGNED_URL_TTL = 60 * 60 * 6; // 6 hours

@Injectable()
export class InspectionShareLinksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  // ─── admin (authenticated) ─────────────────────────────────────────

  async create(
    inspectionId: string,
    tenantId: string,
    userId: string | null,
    dto: CreateShareLinkDto,
  ) {
    await this.ensureInspection(inspectionId, tenantId);
    const expiresAt = dto.expiresInHours
      ? new Date(Date.now() + dto.expiresInHours * 60 * 60 * 1000)
      : null;
    return this.prisma.inspectionShareLink.create({
      data: {
        // 32 URL-safe random bytes → 43 chars (base64url, no padding).
        // 256 bits of entropy — overkill but cheap.
        token: randomBytes(32).toString('base64url'),
        inspectionId,
        expiresAt,
        createdBy: userId,
      },
    });
  }

  async listForInspection(inspectionId: string, tenantId: string) {
    await this.ensureInspection(inspectionId, tenantId);
    return this.prisma.inspectionShareLink.findMany({
      where: { inspectionId },
      orderBy: { createdAt: 'desc' },
    });
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
      carfax,
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

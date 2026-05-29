import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import { CreateVehicleInspectionDto } from './dto/create-vehicle-inspection.dto';
import { UpdateVehicleInspectionDto } from './dto/update-vehicle-inspection.dto';
import { ListVehicleInspectionsDto } from './dto/list-vehicle-inspections.dto';
import { CreateChecklistItemDto } from './dto/create-checklist-item.dto';
import { UpdateChecklistItemDto } from './dto/update-checklist-item.dto';

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const MIN_LEAD_HOURS = 48;

// Parse Copart-style saleDate (YYYYMMDD as int) + saleTime ("HH:mm")
// into a UTC Date. Returns null when the date can't be parsed.
function parseAuctionDateTime(
  saleDate: number | null | undefined,
  saleTime: string | null | undefined,
): Date | null {
  if (!saleDate || saleDate === 0) return null;
  const str = saleDate.toString();
  if (str.length !== 8) return null;
  const year = Number(str.slice(0, 4));
  const month = Number(str.slice(4, 6)) - 1;
  const day = Number(str.slice(6, 8));
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }
  let hours = 0;
  let minutes = 0;
  if (saleTime) {
    const m = saleTime.match(/^(\d{1,2}):(\d{2})/);
    if (m) {
      hours = Number(m[1]);
      minutes = Number(m[2]);
    }
  }
  return new Date(Date.UTC(year, month, day, hours, minutes));
}

// Pulled in by every "get inspection" call. Includes the checklist (ordered)
// with each item's media, plus the inspection-level media (top-level videos).
const INSPECTION_INCLUDE = {
  media: { orderBy: { createdAt: 'asc' as const } },
  checklist: {
    orderBy: [
      { sortOrder: 'asc' as const },
      { createdAt: 'asc' as const },
    ] satisfies Prisma.InspectionChecklistItemOrderByWithRelationInput[],
    include: {
      media: { orderBy: { createdAt: 'asc' as const } },
    },
  },
} satisfies Prisma.VehicleInspectionInclude;

function serialize(row: any) {
  return {
    ...row,
    marketPrice: row.marketPrice?.toString() ?? null,
  };
}

@Injectable()
export class VehicleInspectionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── inspections ──────────────────────────────────────────────────

  async list(tenantId: string, query: ListVehicleInspectionsDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    const where: Prisma.VehicleInspectionWhereInput = {
      tenantId: tenantId || undefined,
      ...(query.status && { status: query.status }),
      ...(query.buyerId && { buyerId: query.buyerId }),
      ...(query.vehicleId && { vehicleId: query.vehicleId }),
      ...(query.vin && { vin: query.vin }),
      ...(query.lotNumber && { lotNumber: query.lotNumber }),
    };

    const [rows, total] = await Promise.all([
      this.prisma.vehicleInspection.findMany({
        where,
        orderBy: { requestedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.vehicleInspection.count({ where }),
    ]);

    return {
      data: rows.map(serialize),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async get(id: string, tenantId: string) {
    const row = await this.prisma.vehicleInspection.findFirst({
      where: { id, tenantId: tenantId || undefined },
      include: INSPECTION_INCLUDE,
    });
    if (!row) throw new NotFoundException(`Inspection ${id} not found`);
    return serialize(row);
  }

  async create(
    tenantId: string,
    userId: string | null,
    dto: CreateVehicleInspectionDto,
  ) {
    await this.validateRequestedWindow(dto);

    const row = await this.prisma.vehicleInspection.create({
      data: {
        tenantId: tenantId || null,
        createdBy: userId,
        vin: dto.vin,
        lotNumber: dto.lotNumber,
        yardName: dto.yardName,
        yardNumber: dto.yardNumber,
        vehicleId: dto.vehicleId,
        buyerId: dto.buyerId,
        status: dto.status ?? 'REQUESTED',
        specificRequest: dto.specificRequest,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : null,
        inspectedAt: dto.inspectedAt ? new Date(dto.inspectedAt) : null,
        inspectorId: dto.inspectorId,
        overallRating: dto.overallRating,
        marketPrice:
          dto.marketPrice != null ? new Prisma.Decimal(dto.marketPrice) : null,
        notes: dto.notes,
      },
      include: INSPECTION_INCLUDE,
    });
    return serialize(row);
  }

  async update(id: string, tenantId: string, dto: UpdateVehicleInspectionDto) {
    await this.ensureInspection(id, tenantId);

    const data: Prisma.VehicleInspectionUpdateInput = {};
    if (dto.vin !== undefined) data.vin = dto.vin;
    if (dto.lotNumber !== undefined) data.lotNumber = dto.lotNumber;
    if (dto.yardName !== undefined) data.yardName = dto.yardName;
    if (dto.yardNumber !== undefined) data.yardNumber = dto.yardNumber;
    if (dto.vehicleId !== undefined)
      data.vehicle = dto.vehicleId
        ? { connect: { id: dto.vehicleId } }
        : { disconnect: true };
    if (dto.buyerId !== undefined)
      data.buyer = dto.buyerId
        ? { connect: { id: dto.buyerId } }
        : { disconnect: true };
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.specificRequest !== undefined)
      data.specificRequest = dto.specificRequest;
    if (dto.dueAt !== undefined)
      data.dueAt = dto.dueAt ? new Date(dto.dueAt) : null;
    if (dto.inspectedAt !== undefined)
      data.inspectedAt = dto.inspectedAt ? new Date(dto.inspectedAt) : null;
    if (dto.completedAt !== undefined)
      data.completedAt = dto.completedAt ? new Date(dto.completedAt) : null;
    if (dto.inspectorId !== undefined) data.inspectorId = dto.inspectorId;
    if (dto.overallRating !== undefined) data.overallRating = dto.overallRating;
    if (dto.marketPrice !== undefined)
      data.marketPrice =
        dto.marketPrice === null ? null : new Prisma.Decimal(dto.marketPrice);
    if (dto.notes !== undefined) data.notes = dto.notes;

    // Auto-stamp completedAt when moving to DONE for the first time.
    if (dto.status === 'DONE' && !data.completedAt) {
      data.completedAt = new Date();
    }

    const row = await this.prisma.vehicleInspection.update({
      where: { id },
      data,
      include: INSPECTION_INCLUDE,
    });
    return serialize(row);
  }

  async remove(id: string, tenantId: string) {
    await this.ensureInspection(id, tenantId);
    await this.prisma.vehicleInspection.delete({ where: { id } });
    return { deleted: true };
  }

  // ─── checklist items ──────────────────────────────────────────────

  async addChecklistItem(
    inspectionId: string,
    tenantId: string,
    dto: CreateChecklistItemDto,
  ) {
    await this.ensureInspection(inspectionId, tenantId);
    return this.prisma.inspectionChecklistItem.create({
      data: {
        inspectionId,
        category: dto.category,
        part: dto.part,
        quality: dto.quality,
        notes: dto.notes,
        voiceNoteTranscription: dto.voiceNoteTranscription,
        sortOrder: dto.sortOrder ?? 0,
      },
      include: { media: true },
    });
  }

  async updateChecklistItem(
    itemId: string,
    inspectionId: string,
    tenantId: string,
    dto: UpdateChecklistItemDto,
  ) {
    await this.ensureChecklistItem(itemId, inspectionId, tenantId);

    const data: Prisma.InspectionChecklistItemUpdateInput = {};
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.part !== undefined) data.part = dto.part;
    if (dto.quality !== undefined) data.quality = dto.quality;
    if (dto.notes !== undefined) data.notes = dto.notes;
    if (dto.voiceNoteTranscription !== undefined)
      data.voiceNoteTranscription = dto.voiceNoteTranscription;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;

    return this.prisma.inspectionChecklistItem.update({
      where: { id: itemId },
      data,
      include: { media: true },
    });
  }

  async removeChecklistItem(
    itemId: string,
    inspectionId: string,
    tenantId: string,
  ) {
    await this.ensureChecklistItem(itemId, inspectionId, tenantId);
    await this.prisma.inspectionChecklistItem.delete({ where: { id: itemId } });
    return { deleted: true };
  }

  // ─── helpers ──────────────────────────────────────────────────────

  // Enforce: dueAt must be (a) at least 48h from now, and (b) strictly before
  // the scheduled auction datetime when the listing has one. Future-sale lots
  // (no saleDate) have no upper bound.
  private async validateRequestedWindow(
    dto: CreateVehicleInspectionDto,
  ): Promise<void> {
    if (!dto.dueAt) return;
    const due = new Date(dto.dueAt);
    if (Number.isNaN(due.getTime())) {
      throw new BadRequestException('dueAt is not a valid date');
    }

    const now = new Date();
    const earliest = new Date(now.getTime() + MIN_LEAD_HOURS * 60 * 60 * 1000);
    if (due < earliest) {
      throw new BadRequestException(
        `Requested date must be at least ${MIN_LEAD_HOURS}h from now`,
      );
    }

    if (!dto.lotNumber) return;
    let lotKey: bigint;
    try {
      lotKey = BigInt(dto.lotNumber);
    } catch {
      return;
    }
    const listing = await this.prisma.auctionListing.findUnique({
      where: { lotNumber: lotKey },
      select: { saleDate: true, saleTime: true },
    });
    if (!listing) return;
    const auctionAt = parseAuctionDateTime(listing.saleDate, listing.saleTime);
    if (auctionAt && due >= auctionAt) {
      throw new BadRequestException(
        'Requested date must be before the scheduled auction date',
      );
    }
  }

  private async ensureInspection(id: string, tenantId: string): Promise<void> {
    const exists = await this.prisma.vehicleInspection.findFirst({
      where: { id, tenantId: tenantId || undefined },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException(`Inspection ${id} not found`);
  }

  private async ensureChecklistItem(
    itemId: string,
    inspectionId: string,
    tenantId: string,
  ): Promise<void> {
    const exists = await this.prisma.inspectionChecklistItem.findFirst({
      where: {
        id: itemId,
        inspectionId,
        inspection: { tenantId: tenantId || undefined },
      },
      select: { id: true },
    });
    if (!exists)
      throw new NotFoundException(`Checklist item ${itemId} not found`);
  }
}

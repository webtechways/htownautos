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
import { CreateRequestItemDto } from './dto/create-request-item.dto';
import { UpdateRequestItemDto } from './dto/update-request-item.dto';
import { DEFAULT_CHECKLIST } from './checklist-template';

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

// Shape of a User returned alongside an inspection (sharedWith list).
// Kept narrow on purpose — UI just needs name/email for the chips.
const SHARED_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  firstName: true,
  lastName: true,
  avatar: true,
} satisfies Prisma.UserSelect;

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
  requestItems: {
    orderBy: [
      { sortOrder: 'asc' as const },
      { createdAt: 'asc' as const },
    ] satisfies Prisma.InspectionRequestItemOrderByWithRelationInput[],
    include: {
      media: { orderBy: { createdAt: 'asc' as const } },
    },
  },
  sharedWith: { select: SHARED_USER_SELECT },
} satisfies Prisma.VehicleInspectionInclude;

// Treat Sat/Sun as if they didn't exist when measuring lead time. Adding
// `hours` of "business" time means: every hour landing on a weekend is
// skipped and the same hour is consumed on the next Monday at the same
// time-of-day. Same result as iterating one hour at a time, but O(1).
function addBusinessHours(start: Date, hours: number): Date {
  let cur = new Date(start);
  // Snap a weekend start to next Monday (same time-of-day).
  const startDay = cur.getUTCDay();
  if (startDay === 6) cur = new Date(cur.getTime() + 2 * 86_400_000);
  else if (startDay === 0) cur = new Date(cur.getTime() + 1 * 86_400_000);

  let remainingMs = hours * 3_600_000;
  while (remainingMs > 0) {
    // ms left in the current weekday (until 24:00 UTC).
    const dayEnd = new Date(cur);
    dayEnd.setUTCHours(24, 0, 0, 0);
    const slice = dayEnd.getTime() - cur.getTime();
    if (slice > remainingMs) {
      cur = new Date(cur.getTime() + remainingMs);
      remainingMs = 0;
    } else {
      remainingMs -= slice;
      cur = dayEnd;
      // Skip Sat/Sun entirely.
      const d = cur.getUTCDay();
      if (d === 6) cur = new Date(cur.getTime() + 2 * 86_400_000);
      else if (d === 0) cur = new Date(cur.getTime() + 1 * 86_400_000);
    }
  }
  return cur;
}

function isWeekend(d: Date): boolean {
  const day = d.getUTCDay();
  return day === 0 || day === 6;
}

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

  async list(
    tenantId: string,
    userId: string | null,
    query: ListVehicleInspectionsDto,
  ) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    // Visibility: either the inspection belongs to the user's tenant, OR
    // the user has been explicitly added to its sharedWith list. The latter
    // is how clients (possibly from other tenants) get access.
    const visibility: Prisma.VehicleInspectionWhereInput[] = [];
    if (tenantId) visibility.push({ tenantId });
    if (userId) visibility.push({ sharedWith: { some: { id: userId } } });
    const where: Prisma.VehicleInspectionWhereInput = {
      ...(visibility.length === 1 ? visibility[0] : { OR: visibility }),
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

  async get(id: string, tenantId: string, userId: string | null) {
    const visibility: Prisma.VehicleInspectionWhereInput[] = [];
    if (tenantId) visibility.push({ tenantId });
    if (userId) visibility.push({ sharedWith: { some: { id: userId } } });
    const row = await this.prisma.vehicleInspection.findFirst({
      where: {
        id,
        ...(visibility.length === 1 ? visibility[0] : { OR: visibility }),
      },
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
        sharedWith: dto.sharedWithIds?.length
          ? { connect: dto.sharedWithIds.map((id) => ({ id })) }
          : undefined,
        // Auto-seed the default checklist so every inspector starts from the
        // same baseline. Items remain editable / deletable per inspection.
        checklist: {
          create: DEFAULT_CHECKLIST.map((it, idx) => ({
            category: it.category,
            part: it.part,
            sortOrder: idx,
          })),
        },
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
    if (dto.sharedWithIds !== undefined)
      data.sharedWith = { set: dto.sharedWithIds.map((id) => ({ id })) };

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

  // ─── client request items ─────────────────────────────────────────

  async addRequestItem(
    inspectionId: string,
    tenantId: string,
    dto: CreateRequestItemDto,
  ) {
    await this.ensureInspection(inspectionId, tenantId);
    return this.prisma.inspectionRequestItem.create({
      data: {
        inspectionId,
        note: dto.note,
        sortOrder: dto.sortOrder ?? 0,
      },
      include: { media: true },
    });
  }

  async updateRequestItem(
    itemId: string,
    inspectionId: string,
    tenantId: string,
    dto: UpdateRequestItemDto,
  ) {
    await this.ensureRequestItem(itemId, inspectionId, tenantId);
    const data: Prisma.InspectionRequestItemUpdateInput = {};
    if (dto.note !== undefined) data.note = dto.note;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    return this.prisma.inspectionRequestItem.update({
      where: { id: itemId },
      data,
      include: { media: true },
    });
  }

  async removeRequestItem(
    itemId: string,
    inspectionId: string,
    tenantId: string,
  ) {
    await this.ensureRequestItem(itemId, inspectionId, tenantId);
    await this.prisma.inspectionRequestItem.delete({ where: { id: itemId } });
    return { deleted: true };
  }

  // ─── helpers ──────────────────────────────────────────────────────

  // Enforce: dueAt must (a) fall on a weekday — Copart closed Sat/Sun —
  // (b) be at least 48 *business* hours from now (weekend hours don't count),
  // and (c) be strictly before the scheduled auction datetime when the
  // listing has one. Future-sale lots (no saleDate) have no upper bound.
  private async validateRequestedWindow(
    dto: CreateVehicleInspectionDto,
  ): Promise<void> {
    if (!dto.dueAt) return;
    const due = new Date(dto.dueAt);
    if (Number.isNaN(due.getTime())) {
      throw new BadRequestException('dueAt is not a valid date');
    }

    if (isWeekend(due)) {
      throw new BadRequestException(
        'Deadline must be a weekday — Copart is closed Sat/Sun',
      );
    }

    const now = new Date();
    const earliest = addBusinessHours(now, MIN_LEAD_HOURS);
    if (due < earliest) {
      throw new BadRequestException(
        `Requested date must be at least ${MIN_LEAD_HOURS} business hours from now (weekends excluded)`,
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

  private async ensureRequestItem(
    itemId: string,
    inspectionId: string,
    tenantId: string,
  ): Promise<void> {
    const exists = await this.prisma.inspectionRequestItem.findFirst({
      where: {
        id: itemId,
        inspectionId,
        inspection: { tenantId: tenantId || undefined },
      },
      select: { id: true },
    });
    if (!exists)
      throw new NotFoundException(`Request item ${itemId} not found`);
  }
}

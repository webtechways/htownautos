"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var VehicleInspectionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleInspectionsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
const checklist_template_1 = require("./checklist-template");
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const MIN_LEAD_HOURS = 48;
function parseAuctionDateTime(saleDate, saleTime) {
    if (!saleDate || saleDate === 0)
        return null;
    const str = saleDate.toString();
    if (str.length !== 8)
        return null;
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
const SHARED_USER_SELECT = {
    id: true,
    email: true,
    name: true,
    firstName: true,
    lastName: true,
    avatar: true,
};
const BUYER_BRIEF_SELECT = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
};
const INSPECTION_INCLUDE = {
    media: { orderBy: { createdAt: 'asc' } },
    checklist: {
        orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'asc' },
        ],
        include: {
            media: { orderBy: { createdAt: 'asc' } },
        },
    },
    requestItems: {
        orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'asc' },
        ],
        include: {
            media: { orderBy: { createdAt: 'asc' } },
        },
    },
    errorCodes: {
        orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'asc' },
        ],
        include: {
            media: { orderBy: { createdAt: 'asc' } },
        },
    },
    sharedWith: { select: SHARED_USER_SELECT },
    buyer: { select: BUYER_BRIEF_SELECT },
};
function addBusinessHours(start, hours) {
    let cur = new Date(start);
    const startDay = cur.getUTCDay();
    if (startDay === 6)
        cur = new Date(cur.getTime() + 2 * 86_400_000);
    else if (startDay === 0)
        cur = new Date(cur.getTime() + 1 * 86_400_000);
    let remainingMs = hours * 3_600_000;
    while (remainingMs > 0) {
        const dayEnd = new Date(cur);
        dayEnd.setUTCHours(24, 0, 0, 0);
        const slice = dayEnd.getTime() - cur.getTime();
        if (slice > remainingMs) {
            cur = new Date(cur.getTime() + remainingMs);
            remainingMs = 0;
        }
        else {
            remainingMs -= slice;
            cur = dayEnd;
            const d = cur.getUTCDay();
            if (d === 6)
                cur = new Date(cur.getTime() + 2 * 86_400_000);
            else if (d === 0)
                cur = new Date(cur.getTime() + 1 * 86_400_000);
        }
    }
    return cur;
}
function isWeekend(d) {
    const day = d.getUTCDay();
    return day === 0 || day === 6;
}
function serialize(row) {
    return {
        ...row,
        marketPrice: row.marketPrice?.toString() ?? null,
    };
}
let VehicleInspectionsService = VehicleInspectionsService_1 = class VehicleInspectionsService {
    prisma;
    s3;
    logger = new common_1.Logger(VehicleInspectionsService_1.name);
    constructor(prisma, s3) {
        this.prisma = prisma;
        this.s3 = s3;
    }
    async list(tenantId, userId, query) {
        const page = query.page && query.page > 0 ? query.page : 1;
        const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
        const visibility = [];
        if (tenantId)
            visibility.push({ tenantId });
        if (userId)
            visibility.push({ sharedWith: { some: { id: userId } } });
        const where = {
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
                include: { buyer: { select: BUYER_BRIEF_SELECT } },
            }),
            this.prisma.vehicleInspection.count({ where }),
        ]);
        return {
            data: rows.map(serialize),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
        };
    }
    async get(id, tenantId, userId) {
        const visibility = [];
        if (tenantId)
            visibility.push({ tenantId });
        if (userId)
            visibility.push({ sharedWith: { some: { id: userId } } });
        const row = await this.prisma.vehicleInspection.findFirst({
            where: {
                id,
                ...(visibility.length === 1 ? visibility[0] : { OR: visibility }),
            },
            include: INSPECTION_INCLUDE,
        });
        if (!row)
            throw new common_1.NotFoundException(`Inspection ${id} not found`);
        return serialize(row);
    }
    async create(tenantId, userId, dto) {
        if (!dto.acknowledgeYardWarning) {
            await this.validateYardPhysicalInspection(dto);
        }
        if (dto.dueAt)
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
                marketPrice: dto.marketPrice != null ? new client_1.Prisma.Decimal(dto.marketPrice) : null,
                notes: dto.notes,
                sharedWith: dto.sharedWithIds?.length
                    ? { connect: dto.sharedWithIds.map((id) => ({ id })) }
                    : undefined,
                checklist: {
                    create: checklist_template_1.DEFAULT_CHECKLIST.map((it, idx) => ({
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
    async update(id, tenantId, dto) {
        await this.ensureInspection(id, tenantId);
        const data = {};
        if (dto.vin !== undefined)
            data.vin = dto.vin;
        if (dto.lotNumber !== undefined)
            data.lotNumber = dto.lotNumber;
        if (dto.yardName !== undefined)
            data.yardName = dto.yardName;
        if (dto.yardNumber !== undefined)
            data.yardNumber = dto.yardNumber;
        if (dto.vehicleId !== undefined)
            data.vehicle = dto.vehicleId
                ? { connect: { id: dto.vehicleId } }
                : { disconnect: true };
        if (dto.buyerId !== undefined)
            data.buyer = dto.buyerId
                ? { connect: { id: dto.buyerId } }
                : { disconnect: true };
        if (dto.status !== undefined)
            data.status = dto.status;
        if (dto.specificRequest !== undefined)
            data.specificRequest = dto.specificRequest;
        if (dto.dueAt !== undefined)
            data.dueAt = dto.dueAt ? new Date(dto.dueAt) : null;
        if (dto.inspectedAt !== undefined)
            data.inspectedAt = dto.inspectedAt ? new Date(dto.inspectedAt) : null;
        if (dto.completedAt !== undefined)
            data.completedAt = dto.completedAt ? new Date(dto.completedAt) : null;
        if (dto.inspectorId !== undefined)
            data.inspectorId = dto.inspectorId;
        if (dto.overallRating !== undefined)
            data.overallRating = dto.overallRating;
        if (dto.marketPrice !== undefined)
            data.marketPrice =
                dto.marketPrice === null ? null : new client_1.Prisma.Decimal(dto.marketPrice);
        if (dto.notes !== undefined)
            data.notes = dto.notes;
        if (dto.sharedWithIds !== undefined)
            data.sharedWith = { set: dto.sharedWithIds.map((id) => ({ id })) };
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
    async remove(id, tenantId) {
        await this.ensureInspection(id, tenantId);
        const keys = await this.collectInspectionStorageKeys([id]);
        await this.prisma.vehicleInspection.delete({ where: { id } });
        this.cleanupS3Keys(keys);
        return { deleted: true, mediaCleaned: keys.length };
    }
    async removeMany(ids, tenantId) {
        if (!ids.length)
            return { deleted: 0, mediaCleaned: 0 };
        const uniqueIds = Array.from(new Set(ids));
        const found = await this.prisma.vehicleInspection.findMany({
            where: { id: { in: uniqueIds }, tenantId: tenantId || undefined },
            select: { id: true },
        });
        if (found.length !== uniqueIds.length) {
            throw new common_1.NotFoundException('One or more inspections were not found for this tenant');
        }
        const keys = await this.collectInspectionStorageKeys(uniqueIds);
        const result = await this.prisma.vehicleInspection.deleteMany({
            where: { id: { in: uniqueIds }, tenantId: tenantId || undefined },
        });
        this.cleanupS3Keys(keys);
        return { deleted: result.count, mediaCleaned: keys.length };
    }
    async collectInspectionStorageKeys(inspectionIds) {
        const rows = await this.prisma.media.findMany({
            where: {
                OR: [
                    { inspectionId: { in: inspectionIds } },
                    { inspectionChecklistItem: { inspectionId: { in: inspectionIds } } },
                    { inspectionRequestItem: { inspectionId: { in: inspectionIds } } },
                    { inspectionErrorCode: { inspectionId: { in: inspectionIds } } },
                ],
            },
            select: { storageKey: true },
        });
        return rows
            .map((r) => r.storageKey)
            .filter((k) => !!k);
    }
    cleanupS3Keys(keys) {
        if (!keys.length)
            return;
        void Promise.allSettled(keys.map((key) => this.s3.deleteFile(key))).then((results) => {
            const failed = results.filter((r) => r.status === 'rejected').length;
            if (failed > 0) {
                this.logger.warn(`S3 cleanup: ${failed}/${keys.length} keys failed to delete`);
            }
        });
    }
    async addChecklistItem(inspectionId, tenantId, dto) {
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
    async updateChecklistItem(itemId, inspectionId, tenantId, dto) {
        await this.ensureChecklistItem(itemId, inspectionId, tenantId);
        const data = {};
        if (dto.category !== undefined)
            data.category = dto.category;
        if (dto.part !== undefined)
            data.part = dto.part;
        if (dto.quality !== undefined)
            data.quality = dto.quality;
        if (dto.notes !== undefined)
            data.notes = dto.notes;
        if (dto.voiceNoteTranscription !== undefined)
            data.voiceNoteTranscription = dto.voiceNoteTranscription;
        if (dto.sortOrder !== undefined)
            data.sortOrder = dto.sortOrder;
        return this.prisma.inspectionChecklistItem.update({
            where: { id: itemId },
            data,
            include: { media: true },
        });
    }
    async removeChecklistItem(itemId, inspectionId, tenantId) {
        await this.ensureChecklistItem(itemId, inspectionId, tenantId);
        await this.prisma.inspectionChecklistItem.delete({ where: { id: itemId } });
        return { deleted: true };
    }
    async addRequestItem(inspectionId, tenantId, dto) {
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
    async updateRequestItem(itemId, inspectionId, tenantId, dto) {
        await this.ensureRequestItem(itemId, inspectionId, tenantId);
        const data = {};
        if (dto.note !== undefined)
            data.note = dto.note;
        if (dto.sortOrder !== undefined)
            data.sortOrder = dto.sortOrder;
        return this.prisma.inspectionRequestItem.update({
            where: { id: itemId },
            data,
            include: { media: true },
        });
    }
    async removeRequestItem(itemId, inspectionId, tenantId) {
        await this.ensureRequestItem(itemId, inspectionId, tenantId);
        await this.prisma.inspectionRequestItem.delete({ where: { id: itemId } });
        return { deleted: true };
    }
    async addErrorCode(inspectionId, tenantId, dto) {
        await this.ensureInspection(inspectionId, tenantId);
        return this.prisma.inspectionErrorCode.create({
            data: {
                inspectionId,
                code: dto.code,
                description: dto.description,
                level: dto.level,
                note: dto.note,
                voiceNoteTranscription: dto.voiceNoteTranscription,
                sortOrder: dto.sortOrder ?? 0,
            },
            include: { media: { orderBy: { createdAt: 'asc' } } },
        });
    }
    async updateErrorCode(itemId, inspectionId, tenantId, dto) {
        await this.ensureErrorCode(itemId, inspectionId, tenantId);
        const data = {};
        if (dto.code !== undefined)
            data.code = dto.code;
        if (dto.description !== undefined)
            data.description = dto.description;
        if (dto.level !== undefined)
            data.level = dto.level;
        if (dto.note !== undefined)
            data.note = dto.note;
        if (dto.voiceNoteTranscription !== undefined)
            data.voiceNoteTranscription = dto.voiceNoteTranscription;
        if (dto.sortOrder !== undefined)
            data.sortOrder = dto.sortOrder;
        return this.prisma.inspectionErrorCode.update({
            where: { id: itemId },
            data,
            include: { media: { orderBy: { createdAt: 'asc' } } },
        });
    }
    async removeErrorCode(itemId, inspectionId, tenantId) {
        await this.ensureErrorCode(itemId, inspectionId, tenantId);
        await this.prisma.inspectionErrorCode.delete({ where: { id: itemId } });
        return { deleted: true };
    }
    async validateYardPhysicalInspection(dto) {
        let yard = null;
        if (dto.lotNumber) {
            let lotKey = null;
            try {
                lotKey = BigInt(dto.lotNumber);
            }
            catch {
                lotKey = null;
            }
            if (lotKey !== null) {
                const listing = await this.prisma.auctionListing.findUnique({
                    where: { lotNumber: lotKey },
                    select: {
                        yardNumber: true,
                        yard: {
                            select: { physicalInspectionAvailable: true, name: true },
                        },
                    },
                });
                if (listing?.yard) {
                    yard = listing.yard;
                }
                else if (listing?.yardNumber != null) {
                    yard = await this.prisma.yard.findUnique({
                        where: {
                            source_yardNumber: {
                                source: 'COPART',
                                yardNumber: listing.yardNumber,
                            },
                        },
                        select: { physicalInspectionAvailable: true, name: true },
                    });
                }
            }
        }
        if (!yard && dto.yardNumber) {
            const yardNumberInt = parseInt(dto.yardNumber, 10);
            if (Number.isFinite(yardNumberInt)) {
                yard = await this.prisma.yard.findUnique({
                    where: {
                        source_yardNumber: { source: 'COPART', yardNumber: yardNumberInt },
                    },
                    select: { physicalInspectionAvailable: true, name: true },
                });
            }
        }
        if (!yard && !dto.lotNumber && !dto.yardNumber)
            return;
        if (!yard) {
            throw new common_1.BadRequestException("This vehicle's yard is not in our system. Add the yard from Settings → Yards (with the physical-inspection flag) before creating an inspection.");
        }
        if (!yard.physicalInspectionAvailable) {
            throw new common_1.BadRequestException(`Inspection cannot be created: ${yard.name} does not offer on-site inspection. Mark the yard as physical-inspection-available from Settings → Yards if this is wrong.`);
        }
    }
    async validateRequestedWindow(dto) {
        if (!dto.dueAt)
            return;
        const due = new Date(dto.dueAt);
        if (Number.isNaN(due.getTime())) {
            throw new common_1.BadRequestException('dueAt is not a valid date');
        }
        if (isWeekend(due)) {
            throw new common_1.BadRequestException('Deadline must be a weekday — Copart is closed Sat/Sun');
        }
        const now = new Date();
        const earliest = addBusinessHours(now, MIN_LEAD_HOURS);
        if (due < earliest) {
            throw new common_1.BadRequestException(`Requested date must be at least ${MIN_LEAD_HOURS} business hours from now (weekends excluded)`);
        }
        if (!dto.lotNumber)
            return;
        let lotKey;
        try {
            lotKey = BigInt(dto.lotNumber);
        }
        catch {
            return;
        }
        const listing = await this.prisma.auctionListing.findUnique({
            where: { lotNumber: lotKey },
            select: { saleDate: true, saleTime: true },
        });
        if (!listing)
            return;
        const auctionAt = parseAuctionDateTime(listing.saleDate, listing.saleTime);
        if (auctionAt && due >= auctionAt) {
            throw new common_1.BadRequestException('Requested date must be before the scheduled auction date');
        }
    }
    async ensureInspection(id, tenantId) {
        const exists = await this.prisma.vehicleInspection.findFirst({
            where: { id, tenantId: tenantId || undefined },
            select: { id: true },
        });
        if (!exists)
            throw new common_1.NotFoundException(`Inspection ${id} not found`);
    }
    async ensureChecklistItem(itemId, inspectionId, tenantId) {
        const exists = await this.prisma.inspectionChecklistItem.findFirst({
            where: {
                id: itemId,
                inspectionId,
                inspection: { tenantId: tenantId || undefined },
            },
            select: { id: true },
        });
        if (!exists)
            throw new common_1.NotFoundException(`Checklist item ${itemId} not found`);
    }
    async ensureRequestItem(itemId, inspectionId, tenantId) {
        const exists = await this.prisma.inspectionRequestItem.findFirst({
            where: {
                id: itemId,
                inspectionId,
                inspection: { tenantId: tenantId || undefined },
            },
            select: { id: true },
        });
        if (!exists)
            throw new common_1.NotFoundException(`Request item ${itemId} not found`);
    }
    async ensureErrorCode(itemId, inspectionId, tenantId) {
        const exists = await this.prisma.inspectionErrorCode.findFirst({
            where: {
                id: itemId,
                inspectionId,
                inspection: { tenantId: tenantId || undefined },
            },
            select: { id: true },
        });
        if (!exists)
            throw new common_1.NotFoundException(`Error code ${itemId} not found`);
    }
};
exports.VehicleInspectionsService = VehicleInspectionsService;
exports.VehicleInspectionsService = VehicleInspectionsService = VehicleInspectionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        common_2.S3Service])
], VehicleInspectionsService);
//# sourceMappingURL=vehicle-inspections.service.js.map
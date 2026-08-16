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
Object.defineProperty(exports, "__esModule", { value: true });
exports.YardsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;
let YardsService = class YardsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(query) {
        const page = query.page && query.page > 0 ? query.page : 1;
        const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
        const where = {
            ...(query.source && { source: query.source }),
            ...(query.state && { state: query.state }),
            ...(query.yardNumber !== undefined && { yardNumber: query.yardNumber }),
            ...(query.physicalInspectionAvailable !== undefined && {
                physicalInspectionAvailable: query.physicalInspectionAvailable,
            }),
            ...(query.isActive !== undefined && { isActive: query.isActive }),
            ...(query.search && {
                OR: [
                    { name: { contains: query.search, mode: 'insensitive' } },
                    { city: { contains: query.search, mode: 'insensitive' } },
                ],
            }),
        };
        const [rows, total, counts] = await Promise.all([
            this.prisma.yard.findMany({
                where,
                orderBy: [{ source: 'asc' }, { name: 'asc' }],
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    _count: {
                        select: { auctionListings: true, inspections: true },
                    },
                },
            }),
            this.prisma.yard.count({ where }),
            this.prisma.yard.groupBy({
                by: ['physicalInspectionAvailable'],
                _count: { _all: true },
            }),
        ]);
        const totalsByFlag = {
            withPhysical: counts.find((c) => c.physicalInspectionAvailable === true)?._count._all ?? 0,
            withoutPhysical: counts.find((c) => c.physicalInspectionAvailable === false)?._count._all ?? 0,
        };
        return {
            data: rows,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 1,
                totalsByFlag,
            },
        };
    }
    async get(id) {
        const row = await this.prisma.yard.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { auctionListings: true, inspections: true },
                },
            },
        });
        if (!row)
            throw new common_1.NotFoundException(`Yard ${id} not found`);
        return row;
    }
    async create(dto) {
        try {
            return await this.prisma.yard.create({
                data: {
                    source: dto.source,
                    yardNumber: dto.yardNumber,
                    name: dto.name,
                    address: dto.address,
                    city: dto.city,
                    state: dto.state,
                    zip: dto.zip,
                    country: dto.country ?? 'US',
                    latitude: dto.latitude,
                    longitude: dto.longitude,
                    phone: dto.phone,
                    email: dto.email,
                    contactName: dto.contactName,
                    physicalInspectionAvailable: dto.physicalInspectionAvailable ?? false,
                    hours: dto.hours ?? undefined,
                    notes: dto.notes,
                    travelFeeCents: dto.travelFeeCents ?? 5000,
                    minCars: dto.minCars ?? 1,
                    isActive: dto.isActive ?? true,
                },
            });
        }
        catch (err) {
            if (err?.code === 'P2002') {
                throw new common_1.ConflictException(`A yard with source ${dto.source} and number ${dto.yardNumber} already exists`);
            }
            throw err;
        }
    }
    async update(id, dto) {
        await this.ensureYard(id);
        try {
            return await this.prisma.yard.update({
                where: { id },
                data: {
                    ...(dto.source !== undefined && { source: dto.source }),
                    ...(dto.yardNumber !== undefined && { yardNumber: dto.yardNumber }),
                    ...(dto.name !== undefined && { name: dto.name }),
                    ...(dto.address !== undefined && { address: dto.address }),
                    ...(dto.city !== undefined && { city: dto.city }),
                    ...(dto.state !== undefined && { state: dto.state }),
                    ...(dto.zip !== undefined && { zip: dto.zip }),
                    ...(dto.country !== undefined && { country: dto.country }),
                    ...(dto.latitude !== undefined && { latitude: dto.latitude }),
                    ...(dto.longitude !== undefined && { longitude: dto.longitude }),
                    ...(dto.phone !== undefined && { phone: dto.phone }),
                    ...(dto.email !== undefined && { email: dto.email }),
                    ...(dto.contactName !== undefined && { contactName: dto.contactName }),
                    ...(dto.physicalInspectionAvailable !== undefined && {
                        physicalInspectionAvailable: dto.physicalInspectionAvailable,
                    }),
                    ...(dto.hours !== undefined && {
                        hours: dto.hours,
                    }),
                    ...(dto.notes !== undefined && { notes: dto.notes }),
                    ...(dto.travelFeeCents !== undefined && { travelFeeCents: dto.travelFeeCents }),
                    ...(dto.minCars !== undefined && { minCars: dto.minCars }),
                    ...(dto.isActive !== undefined && { isActive: dto.isActive }),
                },
            });
        }
        catch (err) {
            if (err?.code === 'P2002') {
                throw new common_1.ConflictException('Another yard already has this (source, yardNumber) pair');
            }
            throw err;
        }
    }
    async remove(id) {
        await this.ensureYard(id);
        await this.prisma.yard.delete({ where: { id } });
        return { deleted: true };
    }
    async findBySourceAndNumber(source, yardNumber) {
        return this.prisma.yard.findUnique({
            where: { source_yardNumber: { source: source, yardNumber } },
        });
    }
    async ensureYard(id) {
        const exists = await this.prisma.yard.findUnique({
            where: { id },
            select: { id: true },
        });
        if (!exists)
            throw new common_1.NotFoundException(`Yard ${id} not found`);
    }
};
exports.YardsService = YardsService;
exports.YardsService = YardsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], YardsService);
//# sourceMappingURL=yards.service.js.map
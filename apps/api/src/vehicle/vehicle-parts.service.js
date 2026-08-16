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
exports.VehiclePartsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
let VehiclePartsService = class VehiclePartsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByVehicle(vehicleId, tenantId) {
        const vehicle = await this.prisma.vehicle.findFirst({
            where: { id: vehicleId, tenantId },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException(`Vehicle with ID ${vehicleId} not found`);
        }
        const vehicleParts = await this.prisma.vehiclePart.findMany({
            where: { vehicleId },
            include: {
                part: {
                    include: {
                        category: { select: { id: true, slug: true, title: true } },
                        condition: { select: { id: true, slug: true, title: true } },
                        status: { select: { id: true, slug: true, title: true } },
                        mainImage: { select: { id: true, url: true, filename: true } },
                    },
                },
            },
            orderBy: { installedAt: 'desc' },
        });
        const total = vehicleParts.reduce((sum, vp) => sum + Number(vp.priceAtTime) * vp.quantity, 0);
        return {
            data: vehicleParts,
            total,
            count: vehicleParts.length,
        };
    }
    async associatePart(vehicleId, dto, tenantId) {
        const vehicle = await this.prisma.vehicle.findFirst({
            where: { id: vehicleId, tenantId },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException(`Vehicle with ID ${vehicleId} not found`);
        }
        const part = await this.prisma.part.findFirst({
            where: {
                id: dto.partId,
                tenantId,
            },
        });
        if (!part) {
            throw new common_1.NotFoundException(`Part with ID ${dto.partId} not found`);
        }
        const quantityToUse = dto.quantity || 1;
        if (part.quantity < quantityToUse) {
            throw new common_1.BadRequestException(`Not enough stock. Available: ${part.quantity}, Requested: ${quantityToUse}`);
        }
        const result = await this.prisma.$transaction(async (tx) => {
            await tx.part.update({
                where: { id: dto.partId },
                data: { quantity: part.quantity - quantityToUse },
            });
            const vehiclePart = await tx.vehiclePart.create({
                data: {
                    vehicleId,
                    partId: dto.partId,
                    quantity: quantityToUse,
                    priceAtTime: dto.priceAtTime ?? part.price,
                    notes: dto.notes,
                },
                include: {
                    part: {
                        include: {
                            category: { select: { id: true, slug: true, title: true } },
                            condition: { select: { id: true, slug: true, title: true } },
                            status: { select: { id: true, slug: true, title: true } },
                        },
                    },
                },
            });
            return vehiclePart;
        });
        return result;
    }
    async createAndAssociate(vehicleId, dto, tenantId) {
        const vehicle = await this.prisma.vehicle.findFirst({
            where: { id: vehicleId, tenantId },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException(`Vehicle with ID ${vehicleId} not found`);
        }
        const condition = await this.prisma.partCondition.findFirst({
            where: {
                id: dto.conditionId,
                OR: [{ tenantId }, { tenantId: null }],
            },
        });
        if (!condition) {
            throw new common_1.NotFoundException(`Part condition with ID ${dto.conditionId} not found`);
        }
        const status = await this.prisma.partStatus.findFirst({
            where: {
                id: dto.statusId,
                OR: [{ tenantId }, { tenantId: null }],
            },
        });
        if (!status) {
            throw new common_1.NotFoundException(`Part status with ID ${dto.statusId} not found`);
        }
        const quantityToUse = dto.quantityToUse || 1;
        const totalQuantity = dto.quantity || quantityToUse;
        if (quantityToUse > totalQuantity) {
            throw new common_1.BadRequestException(`Cannot use more than the total quantity. Total: ${totalQuantity}, To use: ${quantityToUse}`);
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const part = await tx.part.create({
                data: {
                    tenantId,
                    name: dto.name,
                    partNumber: dto.partNumber,
                    sku: dto.sku,
                    description: dto.description,
                    conditionId: dto.conditionId,
                    statusId: dto.statusId,
                    categoryId: dto.categoryId,
                    cost: dto.cost,
                    price: dto.price,
                    quantity: totalQuantity - quantityToUse,
                },
            });
            const vehiclePart = await tx.vehiclePart.create({
                data: {
                    vehicleId,
                    partId: part.id,
                    quantity: quantityToUse,
                    priceAtTime: dto.price,
                    notes: dto.notes,
                },
                include: {
                    part: {
                        include: {
                            category: { select: { id: true, slug: true, title: true } },
                            condition: { select: { id: true, slug: true, title: true } },
                            status: { select: { id: true, slug: true, title: true } },
                        },
                    },
                },
            });
            return vehiclePart;
        });
        return result;
    }
    async removeAssociation(vehicleId, vehiclePartId, tenantId, restoreStock = false) {
        const vehicle = await this.prisma.vehicle.findFirst({
            where: { id: vehicleId, tenantId },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException(`Vehicle with ID ${vehicleId} not found`);
        }
        const vehiclePart = await this.prisma.vehiclePart.findFirst({
            where: { id: vehiclePartId, vehicleId },
            include: { part: true },
        });
        if (!vehiclePart) {
            throw new common_1.NotFoundException(`Vehicle part association with ID ${vehiclePartId} not found`);
        }
        await this.prisma.$transaction(async (tx) => {
            if (restoreStock) {
                await tx.part.update({
                    where: { id: vehiclePart.partId },
                    data: {
                        quantity: vehiclePart.part.quantity + vehiclePart.quantity,
                    },
                });
            }
            await tx.vehiclePart.delete({
                where: { id: vehiclePartId },
            });
        });
        return {
            message: `Part association removed${restoreStock ? ' and stock restored' : ''}`,
        };
    }
    async updateAssociation(vehicleId, vehiclePartId, dto, tenantId) {
        const vehicle = await this.prisma.vehicle.findFirst({
            where: { id: vehicleId, tenantId },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException(`Vehicle with ID ${vehicleId} not found`);
        }
        const existing = await this.prisma.vehiclePart.findFirst({
            where: { id: vehiclePartId, vehicleId },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Vehicle part association with ID ${vehiclePartId} not found`);
        }
        const data = {};
        if (dto.quantity !== undefined)
            data.quantity = dto.quantity;
        if (dto.priceAtTime !== undefined)
            data.priceAtTime = dto.priceAtTime;
        if (dto.notes !== undefined)
            data.notes = dto.notes;
        return this.prisma.vehiclePart.update({
            where: { id: vehiclePartId },
            data,
            include: { part: true },
        });
    }
    async getAvailableParts(tenantId, search) {
        const where = {
            tenantId,
            quantity: { gt: 0 },
        };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { partNumber: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }
        const parts = await this.prisma.part.findMany({
            where,
            include: {
                category: { select: { id: true, slug: true, title: true } },
                condition: { select: { id: true, slug: true, title: true } },
                status: { select: { id: true, slug: true, title: true } },
                mainImage: { select: { id: true, url: true, filename: true } },
            },
            orderBy: { name: 'asc' },
            take: 50,
        });
        return parts;
    }
};
exports.VehiclePartsService = VehiclePartsService;
exports.VehiclePartsService = VehiclePartsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], VehiclePartsService);
//# sourceMappingURL=vehicle-parts.service.js.map
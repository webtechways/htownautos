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
exports.VehicleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const meta_service_1 = require("../meta/meta.service");
const create_meta_dto_1 = require("../meta/dto/create-meta.dto");
let VehicleService = class VehicleService {
    prisma;
    metaService;
    constructor(prisma, metaService) {
        this.prisma = prisma;
        this.metaService = metaService;
    }
    async getDefaultStatusId() {
        const pendingStatus = await this.prisma.vehicleStatus.findFirst({
            where: { slug: 'pending', tenantId: null },
        });
        return pendingStatus?.id;
    }
    async getDefaultMileageUnitId() {
        const milesUnit = await this.prisma.mileageUnit.findFirst({
            where: { slug: 'miles' },
        });
        return milesUnit?.id;
    }
    async generateStockNumber() {
        const prefix = 'HTW';
        const lastVehicle = await this.prisma.vehicle.findFirst({
            where: {
                stockNumber: {
                    startsWith: prefix,
                },
            },
            orderBy: {
                stockNumber: 'desc',
            },
            select: {
                stockNumber: true,
            },
        });
        let nextNumber = 1;
        if (lastVehicle?.stockNumber) {
            const numPart = lastVehicle.stockNumber.replace(prefix, '');
            const parsed = parseInt(numPart, 10);
            if (!isNaN(parsed)) {
                nextNumber = parsed + 1;
            }
        }
        return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
    }
    async create(createVehicleDto, tenantId, createdById) {
        const existingVin = await this.prisma.vehicle.findFirst({
            where: { vin: createVehicleDto.vin, tenantId },
        });
        if (existingVin) {
            throw new common_1.ConflictException(`Vehicle with VIN ${createVehicleDto.vin} already exists`);
        }
        let stockNumber = createVehicleDto.stockNumber?.trim() || null;
        if (stockNumber) {
            if (!stockNumber.startsWith('HTW')) {
                stockNumber = `HTW${stockNumber}`;
            }
            const existingStock = await this.prisma.vehicle.findFirst({
                where: { stockNumber, tenantId },
            });
            if (existingStock) {
                throw new common_1.ConflictException(`Vehicle with stock number ${stockNumber} already exists`);
            }
        }
        else {
            stockNumber = await this.generateStockNumber();
        }
        await this.validateRelatedEntities(createVehicleDto);
        let vehicleStatusId = createVehicleDto.vehicleStatusId;
        if (!vehicleStatusId) {
            vehicleStatusId = await this.getDefaultStatusId();
        }
        let mileageUnitId = createVehicleDto.mileageUnitId;
        if (!mileageUnitId) {
            mileageUnitId = await this.getDefaultMileageUnitId();
        }
        const { metas, stockNumber: _, ...vehicleData } = createVehicleDto;
        const data = { ...vehicleData, stockNumber, vehicleStatusId, mileageUnitId, tenantId, createdById };
        if (typeof data.metaValue === 'string') {
            try {
                data.metaValue = JSON.parse(data.metaValue);
            }
            catch (error) {
                throw new common_1.BadRequestException('Invalid JSON in metaValue');
            }
        }
        this.syncPricingFields(data);
        const vehicle = await this.prisma.vehicle.create({
            data,
            include: this.getIncludeRelations(),
        });
        if (metas && metas.length > 0) {
            const metaDtos = metas.map((meta) => ({
                entityType: create_meta_dto_1.MetaEntityType.VEHICLE,
                entityId: vehicle.id,
                key: meta.key,
                value: meta.value,
                valueType: meta.valueType || create_meta_dto_1.MetaValueType.STRING,
                description: meta.description,
                isPublic: meta.isPublic || false,
            }));
            await this.metaService.bulkCreate(metaDtos);
        }
        return vehicle;
    }
    async findAll(query, tenantId) {
        const { page = 1, limit = 10, search, hasCarfax, ...filters } = query;
        const skip = (page - 1) * limit;
        if (filters.minMileage && filters.maxMileage && filters.minMileage > filters.maxMileage) {
            [filters.minMileage, filters.maxMileage] = [filters.maxMileage, filters.minMileage];
        }
        if (filters.minPrice && filters.maxPrice && filters.minPrice > filters.maxPrice) {
            [filters.minPrice, filters.maxPrice] = [filters.maxPrice, filters.minPrice];
        }
        const where = {
            AND: [
                { tenantId },
                filters.vin
                    ? { vin: { contains: filters.vin, mode: 'insensitive' } }
                    : {},
                filters.stockNumber
                    ? {
                        stockNumber: {
                            contains: filters.stockNumber,
                            mode: 'insensitive',
                        },
                    }
                    : {},
                filters.yearId ? { yearId: filters.yearId } : {},
                filters.makeId ? { makeId: filters.makeId } : {},
                filters.modelId ? { modelId: filters.modelId } : {},
                filters.trimId ? { trimId: filters.trimId } : {},
                filters.vehicleTypeId ? { vehicleTypeId: filters.vehicleTypeId } : {},
                filters.bodyTypeId ? { bodyTypeId: filters.bodyTypeId } : {},
                filters.fuelTypeId ? { fuelTypeId: filters.fuelTypeId } : {},
                filters.driveTypeId ? { driveTypeId: filters.driveTypeId } : {},
                filters.transmissionTypeId
                    ? { transmissionTypeId: filters.transmissionTypeId }
                    : {},
                filters.vehicleConditionId
                    ? { vehicleConditionId: filters.vehicleConditionId }
                    : {},
                filters.vehicleStatusId
                    ? { vehicleStatusId: filters.vehicleStatusId }
                    : {},
                filters.sourceId ? { sourceId: filters.sourceId } : {},
                filters.titleBrandId ? { titleBrandId: filters.titleBrandId } : {},
                filters.minMileage || filters.maxMileage
                    ? {
                        mileage: {
                            ...(filters.minMileage && { gte: filters.minMileage }),
                            ...(filters.maxMileage && { lte: filters.maxMileage }),
                        },
                    }
                    : {},
                filters.minPrice || filters.maxPrice
                    ? {
                        OR: [
                            {
                                askingPrice: {
                                    ...(filters.minPrice && { gte: filters.minPrice }),
                                    ...(filters.maxPrice && { lte: filters.maxPrice }),
                                },
                            },
                            {
                                askingPrice: null,
                                salePrice: {
                                    ...(filters.minPrice && { gte: filters.minPrice }),
                                    ...(filters.maxPrice && { lte: filters.maxPrice }),
                                },
                            },
                        ],
                    }
                    : {},
                hasCarfax
                    ? {
                        gallery: {
                            some: {
                                mimeType: 'application/pdf',
                                category: 'document',
                                OR: [
                                    { filename: { contains: 'carfax', mode: 'insensitive' } },
                                    { title: { contains: 'carfax', mode: 'insensitive' } },
                                ],
                            },
                        },
                    }
                    : {},
                search
                    ? {
                        OR: [
                            { vin: { contains: search, mode: 'insensitive' } },
                            {
                                stockNumber: { contains: search, mode: 'insensitive' },
                            },
                            { description: { contains: search, mode: 'insensitive' } },
                            { features: { contains: search, mode: 'insensitive' } },
                        ],
                    }
                    : {},
            ],
        };
        const [vehicles, total] = await Promise.all([
            this.prisma.vehicle.findMany({
                where,
                skip,
                take: limit,
                include: {
                    ...this.getIncludeRelations(),
                    _count: {
                        select: {
                            gallery: {
                                where: {
                                    mimeType: 'application/pdf',
                                    category: 'document',
                                    OR: [
                                        { filename: { contains: 'carfax', mode: 'insensitive' } },
                                        { title: { contains: 'carfax', mode: 'insensitive' } },
                                    ],
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.vehicle.count({ where }),
        ]);
        const vehiclesWithCarfax = vehicles.map((vehicle) => {
            const { _count, ...rest } = vehicle;
            return {
                ...rest,
                hasCarfaxPdf: (_count?.gallery ?? 0) > 0,
            };
        });
        return {
            data: vehiclesWithCarfax,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPreviousPage: page > 1,
            },
        };
    }
    async findOne(id, tenantId) {
        const vehicle = await this.prisma.vehicle.findFirst({
            where: { id, tenantId },
            include: this.getIncludeRelations(),
        });
        if (!vehicle) {
            throw new common_1.NotFoundException(`Vehicle with ID ${id} not found`);
        }
        return vehicle;
    }
    async findOneWithMetas(id, tenantId) {
        const vehicle = await this.findOne(id, tenantId);
        const metas = await this.metaService.findByEntity(create_meta_dto_1.MetaEntityType.VEHICLE, id);
        return {
            ...vehicle,
            metas,
        };
    }
    async findByVin(vin, tenantId) {
        const vehicle = await this.prisma.vehicle.findFirst({
            where: { vin, tenantId },
            include: this.getIncludeRelations(),
        });
        if (!vehicle) {
            throw new common_1.NotFoundException(`Vehicle with VIN ${vin} not found`);
        }
        return vehicle;
    }
    async findOnePublic(id) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id },
            include: {
                year: true,
                make: true,
                model: true,
                trim: true,
                vehicleType: true,
                bodyType: true,
                fuelType: true,
                driveType: true,
                transmissionType: true,
                vehicleCondition: true,
                vehicleStatus: true,
                mileageUnit: true,
                vehicleEngine: true,
                mainImage: {
                    select: {
                        id: true,
                        url: true,
                        filename: true,
                        mimeType: true,
                    },
                },
            },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException(`Vehicle not found`);
        }
        const gallery = await this.prisma.media.findMany({
            where: {
                vehicleId: id,
                category: { notIn: ['receipt', 'document', 'title'] },
            },
            select: {
                id: true,
                url: true,
                filename: true,
                mimeType: true,
            },
            orderBy: { createdAt: 'asc' },
        });
        const publicMetas = await this.metaService.findByEntity(create_meta_dto_1.MetaEntityType.VEHICLE, id).then(metas => metas.filter(m => m.isPublic));
        return {
            id: vehicle.id,
            vin: vehicle.vin,
            stockNumber: vehicle.stockNumber,
            year: vehicle.year,
            make: vehicle.make,
            model: vehicle.model,
            trim: vehicle.trim,
            vehicleType: vehicle.vehicleType,
            bodyType: vehicle.bodyType,
            fuelType: vehicle.fuelType,
            driveType: vehicle.driveType,
            transmissionType: vehicle.transmissionType,
            vehicleCondition: vehicle.vehicleCondition,
            vehicleStatus: vehicle.vehicleStatus,
            vehicleEngine: vehicle.vehicleEngine,
            mileage: vehicle.mileage,
            mileageUnit: vehicle.mileageUnit,
            exteriorColor: vehicle.exteriorColor,
            interiorColor: vehicle.interiorColor,
            engine: vehicle.engine,
            cylinders: vehicle.cylinders,
            doors: vehicle.doors,
            passengers: vehicle.passengers,
            askingPrice: vehicle.askingPrice,
            advertisingPrice: vehicle.advertisingPrice,
            specialPrice: vehicle.specialPrice,
            specialPriceStartDate: vehicle.specialPriceStartDate,
            specialPriceEndDate: vehicle.specialPriceEndDate,
            msrp: vehicle.msrp,
            description: vehicle.description,
            features: vehicle.features,
            mainImage: vehicle.mainImage,
            gallery,
            metas: publicMetas,
        };
    }
    async update(id, updateVehicleDto, tenantId) {
        await this.findOne(id, tenantId);
        if (updateVehicleDto.vin) {
            const existingVin = await this.prisma.vehicle.findFirst({
                where: { vin: updateVehicleDto.vin, tenantId },
            });
            if (existingVin && existingVin.id !== id) {
                throw new common_1.ConflictException(`Vehicle with VIN ${updateVehicleDto.vin} already exists`);
            }
        }
        const { stockNumber: _sn, yearId: _y, makeId: _mk, modelId: _md, engine: _e, cylinders: _c, doors: _d, passengers: _p, fuelTypeId: _ft, transmissionTypeId: _tt, driveTypeId: _dt, ...updateData } = updateVehicleDto;
        const data = { ...updateData };
        if (typeof data.metaValue === 'string') {
            try {
                data.metaValue = JSON.parse(data.metaValue);
            }
            catch (error) {
                throw new common_1.BadRequestException('Invalid JSON in metaValue');
            }
        }
        this.syncPricingFields(data);
        const record = await this.prisma.vehicle.update({
            where: { id },
            data,
            include: this.getIncludeRelations(),
        });
        return record;
    }
    async remove(id, tenantId) {
        await this.findOne(id, tenantId);
        await this.metaService.deleteByEntity(create_meta_dto_1.MetaEntityType.VEHICLE, id);
        await this.prisma.vehicle.delete({
            where: { id },
        });
        return {
            message: `Vehicle with ID ${id} and its associated metadata have been successfully deleted`,
        };
    }
    async removeBulk(ids, tenantId) {
        const vehicles = await this.prisma.vehicle.findMany({
            where: { id: { in: ids }, tenantId },
            select: { id: true },
        });
        const foundIds = vehicles.map((v) => v.id);
        const notFound = ids.filter((id) => !foundIds.includes(id));
        if (notFound.length > 0) {
            throw new common_1.NotFoundException(`Vehicles not found or not accessible: ${notFound.join(', ')}`);
        }
        await Promise.all(foundIds.map((id) => this.metaService.deleteByEntity(create_meta_dto_1.MetaEntityType.VEHICLE, id)));
        const result = await this.prisma.vehicle.deleteMany({
            where: { id: { in: foundIds }, tenantId },
        });
        return {
            message: `${result.count} vehicle(s) have been successfully deleted`,
            count: result.count,
        };
    }
    async getStats(tenantId) {
        const where = { tenantId };
        const [totalVehicles, totalValue, avgMileage, byStatus, byMake, recentVehicles,] = await Promise.all([
            this.prisma.vehicle.count({ where }),
            this.prisma.vehicle.aggregate({
                where,
                _sum: { askingPrice: true, salePrice: true },
            }),
            this.prisma.vehicle.aggregate({
                where,
                _avg: { mileage: true },
            }),
            this.prisma.vehicle.groupBy({
                by: ['vehicleStatusId'],
                where,
                _count: true,
            }),
            this.prisma.vehicle.groupBy({
                by: ['makeId'],
                where,
                _count: true,
                orderBy: { _count: { makeId: 'desc' } },
                take: 5,
            }),
            this.prisma.vehicle.findMany({
                where,
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { year: true, make: true, model: true },
            }),
        ]);
        return {
            totalVehicles,
            totalValue: totalValue._sum.askingPrice || totalValue._sum.salePrice || 0,
            avgMileage: avgMileage._avg.mileage || 0,
            byStatus,
            topMakes: byMake,
            recentVehicles,
        };
    }
    syncPricingFields(data) {
        if (data.vehicleCost !== undefined && data.costPrice === undefined) {
            data.costPrice = data.vehicleCost;
        }
        if (data.msrp !== undefined && data.listPrice === undefined) {
            data.listPrice = data.msrp;
        }
        if (data.askingPrice !== undefined && data.salePrice === undefined) {
            data.salePrice = data.askingPrice;
        }
        if (data.costPrice !== undefined && data.vehicleCost === undefined) {
            data.vehicleCost = data.costPrice;
        }
        if (data.listPrice !== undefined && data.msrp === undefined) {
            data.msrp = data.listPrice;
        }
        if (data.salePrice !== undefined && data.askingPrice === undefined) {
            data.askingPrice = data.salePrice;
        }
    }
    async validateRelatedEntities(dto) {
        const errors = [];
        if (dto.yearId) {
            const year = await this.prisma.vehicleYear.findUnique({
                where: { id: dto.yearId },
            });
            if (!year) {
                errors.push(`Year with ID ${dto.yearId} not found`);
            }
        }
        if (dto.makeId) {
            const make = await this.prisma.vehicleMake.findUnique({
                where: { id: dto.makeId },
            });
            if (!make) {
                errors.push(`Make with ID ${dto.makeId} not found`);
            }
        }
        if (dto.modelId) {
            const model = await this.prisma.vehicleModel.findUnique({
                where: { id: dto.modelId },
            });
            if (!model) {
                errors.push(`Model with ID ${dto.modelId} not found`);
            }
        }
        if (dto.trimId) {
            const trim = await this.prisma.vehicleTrim.findUnique({
                where: { id: dto.trimId },
            });
            if (!trim) {
                errors.push(`Trim with ID ${dto.trimId} not found`);
            }
        }
        if (errors.length > 0) {
            throw new common_1.BadRequestException(errors.join(', '));
        }
    }
    getIncludeRelations() {
        return {
            year: true,
            make: true,
            model: true,
            trim: true,
            vehicleType: true,
            bodyType: true,
            fuelType: true,
            driveType: true,
            transmissionType: true,
            vehicleCondition: true,
            vehicleStatus: true,
            source: true,
            titleBrand: true,
            mileageUnit: true,
            vehicleEngine: true,
            mainImage: true,
        };
    }
};
exports.VehicleService = VehicleService;
exports.VehicleService = VehicleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        meta_service_1.MetaService])
], VehicleService);
//# sourceMappingURL=vehicle.service.js.map
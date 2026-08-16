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
var VehicleModelService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleModelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const marketcheck_service_1 = require("../marketcheck/marketcheck.service");
const vehicle_model_entity_1 = require("./entities/vehicle-model.entity");
let VehicleModelService = VehicleModelService_1 = class VehicleModelService {
    prisma;
    marketCheckService;
    logger = new common_1.Logger(VehicleModelService_1.name);
    constructor(prisma, marketCheckService) {
        this.prisma = prisma;
        this.marketCheckService = marketCheckService;
    }
    slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
    }
    async create(createVehicleModelDto) {
        const { makeId, name, slug, isActive = true } = createVehicleModelDto;
        const makeExists = await this.prisma.vehicleMake.findUnique({
            where: { id: makeId },
            include: {
                year: {
                    select: {
                        year: true,
                    },
                },
            },
        });
        if (!makeExists) {
            throw new common_1.NotFoundException(`Vehicle make with ID ${makeId} not found`);
        }
        const finalSlug = slug || this.slugify(name);
        const existingModel = await this.prisma.vehicleModel.findUnique({
            where: {
                makeId_slug: {
                    makeId,
                    slug: finalSlug,
                },
            },
        });
        if (existingModel) {
            throw new common_1.ConflictException(`Model "${name}" already exists for make ${makeExists.name}`);
        }
        const vehicleModel = await this.prisma.vehicleModel.create({
            data: {
                makeId,
                name,
                slug: finalSlug,
                isActive,
            },
        });
        return new vehicle_model_entity_1.VehicleModelEntity(vehicleModel);
    }
    async findAll(query) {
        const { page = 1, limit = 10, makeId, year, isActive } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (makeId !== undefined) {
            const makeExists = await this.prisma.vehicleMake.findUnique({
                where: { id: makeId },
            });
            if (!makeExists) {
                throw new common_1.NotFoundException(`Vehicle make with ID ${makeId} not found`);
            }
            where.makeId = makeId;
        }
        if (year !== undefined) {
            const vehicleYear = await this.prisma.vehicleYear.findUnique({
                where: { year },
            });
            if (!vehicleYear) {
                throw new common_1.NotFoundException(`Vehicle year ${year} not found`);
            }
            where.make = {
                yearId: vehicleYear.id,
            };
        }
        let [data, total] = await Promise.all([
            this.prisma.vehicleModel.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    make: {
                        select: {
                            name: true,
                            year: {
                                select: {
                                    year: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.vehicleModel.count({ where }),
        ]);
        if (total === 0 && makeId !== undefined) {
            try {
                const make = await this.prisma.vehicleMake.findUnique({
                    where: { id: makeId },
                    include: { year: true },
                });
                if (make) {
                    const modelNames = await this.marketCheckService.getModels(make.year.year.toString(), make.name);
                    for (const name of modelNames) {
                        const slug = this.slugify(name);
                        try {
                            await this.prisma.vehicleModel.create({
                                data: { makeId, name, slug, isActive: true },
                            });
                        }
                        catch {
                        }
                    }
                    [data, total] = await Promise.all([
                        this.prisma.vehicleModel.findMany({
                            where,
                            skip,
                            take: limit,
                            orderBy: { name: 'asc' },
                            include: { make: { select: { name: true, year: { select: { year: true } } } } },
                        }),
                        this.prisma.vehicleModel.count({ where }),
                    ]);
                }
            }
            catch (error) {
                this.logger.error(`MarketCheck backfill failed for models (makeId=${makeId}): ${error}`);
            }
        }
        const totalPages = Math.ceil(total / limit);
        return {
            data: data.map((item) => new vehicle_model_entity_1.VehicleModelEntity(item)),
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    }
    async findOne(id) {
        const vehicleModel = await this.prisma.vehicleModel.findUnique({
            where: { id },
            include: {
                make: {
                    select: {
                        name: true,
                        year: {
                            select: {
                                year: true,
                            },
                        },
                    },
                },
            },
        });
        if (!vehicleModel) {
            throw new common_1.NotFoundException(`Vehicle model with ID ${id} not found`);
        }
        return new vehicle_model_entity_1.VehicleModelEntity(vehicleModel);
    }
    async update(id, updateVehicleModelDto) {
        const existingModel = await this.prisma.vehicleModel.findUnique({
            where: { id },
        });
        if (!existingModel) {
            throw new common_1.NotFoundException(`Vehicle model with ID ${id} not found`);
        }
        const { makeId, name, slug, isActive } = updateVehicleModelDto;
        if (makeId && makeId !== existingModel.makeId) {
            const makeExists = await this.prisma.vehicleMake.findUnique({
                where: { id: makeId },
            });
            if (!makeExists) {
                throw new common_1.NotFoundException(`Vehicle make with ID ${makeId} not found`);
            }
        }
        const finalSlug = slug || (name ? this.slugify(name) : existingModel.slug);
        const targetMakeId = makeId || existingModel.makeId;
        if (finalSlug !== existingModel.slug || targetMakeId !== existingModel.makeId) {
            const duplicateModel = await this.prisma.vehicleModel.findUnique({
                where: {
                    makeId_slug: {
                        makeId: targetMakeId,
                        slug: finalSlug,
                    },
                },
            });
            if (duplicateModel && duplicateModel.id !== id) {
                throw new common_1.ConflictException(`Model with slug "${finalSlug}" already exists for this make`);
            }
        }
        const updatedModel = await this.prisma.vehicleModel.update({
            where: { id },
            data: {
                ...(makeId && { makeId }),
                ...(name && { name }),
                slug: finalSlug,
                ...(isActive !== undefined && { isActive }),
            },
        });
        return new vehicle_model_entity_1.VehicleModelEntity(updatedModel);
    }
    async remove(id) {
        const existingModel = await this.prisma.vehicleModel.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        trims: true,
                    },
                },
            },
        });
        if (!existingModel) {
            throw new common_1.NotFoundException(`Vehicle model with ID ${id} not found`);
        }
        if (existingModel._count.trims > 0) {
            throw new common_1.BadRequestException(`Cannot delete model with ${existingModel._count.trims} related trims. Set isActive to false instead.`);
        }
        await this.prisma.vehicleModel.delete({
            where: { id },
        });
        return {
            message: `Vehicle model with ID ${id} has been successfully deleted`,
        };
    }
};
exports.VehicleModelService = VehicleModelService;
exports.VehicleModelService = VehicleModelService = VehicleModelService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        marketcheck_service_1.MarketCheckService])
], VehicleModelService);
//# sourceMappingURL=vehicle-model.service.js.map
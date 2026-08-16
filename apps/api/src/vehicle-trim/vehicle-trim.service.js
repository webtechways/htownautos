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
var VehicleTrimService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleTrimService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const marketcheck_service_1 = require("../marketcheck/marketcheck.service");
const vehicle_trim_entity_1 = require("./entities/vehicle-trim.entity");
let VehicleTrimService = VehicleTrimService_1 = class VehicleTrimService {
    prisma;
    marketCheckService;
    logger = new common_1.Logger(VehicleTrimService_1.name);
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
    async create(createVehicleTrimDto) {
        const { modelId, name, slug, isActive = true } = createVehicleTrimDto;
        const modelExists = await this.prisma.vehicleModel.findUnique({
            where: { id: modelId },
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
        if (!modelExists) {
            throw new common_1.NotFoundException(`Vehicle model with ID ${modelId} not found`);
        }
        const finalSlug = slug || this.slugify(name);
        const existingTrim = await this.prisma.vehicleTrim.findUnique({
            where: {
                modelId_slug: {
                    modelId,
                    slug: finalSlug,
                },
            },
        });
        if (existingTrim) {
            throw new common_1.ConflictException(`Trim "${name}" already exists for model ${modelExists.name}`);
        }
        const vehicleTrim = await this.prisma.vehicleTrim.create({
            data: {
                modelId,
                name,
                slug: finalSlug,
                isActive,
            },
        });
        return new vehicle_trim_entity_1.VehicleTrimEntity(vehicleTrim);
    }
    async findAll(query) {
        const { page = 1, limit = 10, modelId, makeId, year, isActive } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (modelId !== undefined) {
            const modelExists = await this.prisma.vehicleModel.findUnique({
                where: { id: modelId },
            });
            if (!modelExists) {
                throw new common_1.NotFoundException(`Vehicle model with ID ${modelId} not found`);
            }
            where.modelId = modelId;
        }
        if (makeId !== undefined) {
            const makeExists = await this.prisma.vehicleMake.findUnique({
                where: { id: makeId },
            });
            if (!makeExists) {
                throw new common_1.NotFoundException(`Vehicle make with ID ${makeId} not found`);
            }
            where.model = {
                makeId: makeId,
            };
        }
        if (year !== undefined) {
            const vehicleYear = await this.prisma.vehicleYear.findUnique({
                where: { year },
            });
            if (!vehicleYear) {
                throw new common_1.NotFoundException(`Vehicle year ${year} not found`);
            }
            where.model = {
                ...where.model,
                make: {
                    yearId: vehicleYear.id,
                },
            };
        }
        let [data, total] = await Promise.all([
            this.prisma.vehicleTrim.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    model: {
                        select: {
                            name: true,
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
                    },
                },
            }),
            this.prisma.vehicleTrim.count({ where }),
        ]);
        if (total === 0 && modelId !== undefined) {
            try {
                const model = await this.prisma.vehicleModel.findUnique({
                    where: { id: modelId },
                    include: { make: { include: { year: true } } },
                });
                if (model) {
                    const trimNames = await this.marketCheckService.getTrims(model.make.year.year.toString(), model.make.name, model.name);
                    for (const name of trimNames) {
                        const slug = this.slugify(name);
                        try {
                            await this.prisma.vehicleTrim.create({
                                data: { modelId, name, slug, isActive: true },
                            });
                        }
                        catch {
                        }
                    }
                    [data, total] = await Promise.all([
                        this.prisma.vehicleTrim.findMany({
                            where,
                            skip,
                            take: limit,
                            orderBy: { name: 'asc' },
                            include: {
                                model: {
                                    select: {
                                        name: true,
                                        make: { select: { name: true, year: { select: { year: true } } } },
                                    },
                                },
                            },
                        }),
                        this.prisma.vehicleTrim.count({ where }),
                    ]);
                }
            }
            catch (error) {
                this.logger.error(`MarketCheck backfill failed for trims (modelId=${modelId}): ${error}`);
            }
        }
        const totalPages = Math.ceil(total / limit);
        return {
            data: data.map((item) => new vehicle_trim_entity_1.VehicleTrimEntity(item)),
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
        const vehicleTrim = await this.prisma.vehicleTrim.findUnique({
            where: { id },
            include: {
                model: {
                    select: {
                        name: true,
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
                },
            },
        });
        if (!vehicleTrim) {
            throw new common_1.NotFoundException(`Vehicle trim with ID ${id} not found`);
        }
        return new vehicle_trim_entity_1.VehicleTrimEntity(vehicleTrim);
    }
    async update(id, updateVehicleTrimDto) {
        const existingTrim = await this.prisma.vehicleTrim.findUnique({
            where: { id },
        });
        if (!existingTrim) {
            throw new common_1.NotFoundException(`Vehicle trim with ID ${id} not found`);
        }
        const { modelId, name, slug, isActive } = updateVehicleTrimDto;
        if (modelId && modelId !== existingTrim.modelId) {
            const modelExists = await this.prisma.vehicleModel.findUnique({
                where: { id: modelId },
            });
            if (!modelExists) {
                throw new common_1.NotFoundException(`Vehicle model with ID ${modelId} not found`);
            }
        }
        const finalSlug = slug || (name ? this.slugify(name) : existingTrim.slug);
        const targetModelId = modelId || existingTrim.modelId;
        if (finalSlug !== existingTrim.slug || targetModelId !== existingTrim.modelId) {
            const duplicateTrim = await this.prisma.vehicleTrim.findUnique({
                where: {
                    modelId_slug: {
                        modelId: targetModelId,
                        slug: finalSlug,
                    },
                },
            });
            if (duplicateTrim && duplicateTrim.id !== id) {
                throw new common_1.ConflictException(`Trim with slug "${finalSlug}" already exists for this model`);
            }
        }
        const updatedTrim = await this.prisma.vehicleTrim.update({
            where: { id },
            data: {
                ...(modelId && { modelId }),
                ...(name && { name }),
                slug: finalSlug,
                ...(isActive !== undefined && { isActive }),
            },
        });
        return new vehicle_trim_entity_1.VehicleTrimEntity(updatedTrim);
    }
    async remove(id) {
        const existingTrim = await this.prisma.vehicleTrim.findUnique({
            where: { id },
        });
        if (!existingTrim) {
            throw new common_1.NotFoundException(`Vehicle trim with ID ${id} not found`);
        }
        await this.prisma.vehicleTrim.delete({
            where: { id },
        });
        return {
            message: `Vehicle trim with ID ${id} has been successfully deleted`,
        };
    }
};
exports.VehicleTrimService = VehicleTrimService;
exports.VehicleTrimService = VehicleTrimService = VehicleTrimService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        marketcheck_service_1.MarketCheckService])
], VehicleTrimService);
//# sourceMappingURL=vehicle-trim.service.js.map
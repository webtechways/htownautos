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
var VehicleMakeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleMakeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const marketcheck_service_1 = require("../marketcheck/marketcheck.service");
const vehicle_make_entity_1 = require("./entities/vehicle-make.entity");
let VehicleMakeService = VehicleMakeService_1 = class VehicleMakeService {
    prisma;
    marketCheckService;
    logger = new common_1.Logger(VehicleMakeService_1.name);
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
    async create(createVehicleMakeDto) {
        const { yearId, name, slug, isActive = true } = createVehicleMakeDto;
        const yearExists = await this.prisma.vehicleYear.findUnique({
            where: { id: yearId },
        });
        if (!yearExists) {
            throw new common_1.NotFoundException(`Vehicle year with ID ${yearId} not found`);
        }
        const finalSlug = slug || this.slugify(name);
        const existingMake = await this.prisma.vehicleMake.findUnique({
            where: {
                yearId_slug: {
                    yearId,
                    slug: finalSlug,
                },
            },
        });
        if (existingMake) {
            throw new common_1.ConflictException(`Make "${name}" already exists for year ${yearExists.year}`);
        }
        const vehicleMake = await this.prisma.vehicleMake.create({
            data: {
                yearId,
                name,
                slug: finalSlug,
                isActive,
            },
        });
        return new vehicle_make_entity_1.VehicleMakeEntity(vehicleMake);
    }
    async findAll(query) {
        const { page = 1, limit = 10, year, isActive } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (year !== undefined) {
            const vehicleYear = await this.prisma.vehicleYear.findUnique({
                where: { year },
            });
            if (!vehicleYear) {
                throw new common_1.NotFoundException(`Vehicle year ${year} not found`);
            }
            where.yearId = vehicleYear.id;
        }
        let [data, total] = await Promise.all([
            this.prisma.vehicleMake.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    year: {
                        select: {
                            year: true,
                        },
                    },
                },
            }),
            this.prisma.vehicleMake.count({ where }),
        ]);
        if (total === 0 && year !== undefined) {
            try {
                const makeNames = await this.marketCheckService.getMakes(year.toString());
                const vehicleYear = await this.prisma.vehicleYear.findUnique({ where: { year } });
                if (vehicleYear && makeNames.length > 0) {
                    for (const name of makeNames) {
                        const slug = this.slugify(name);
                        try {
                            await this.prisma.vehicleMake.create({
                                data: { yearId: vehicleYear.id, name, slug, isActive: true },
                            });
                        }
                        catch {
                        }
                    }
                    [data, total] = await Promise.all([
                        this.prisma.vehicleMake.findMany({
                            where,
                            skip,
                            take: limit,
                            orderBy: { name: 'asc' },
                            include: { year: { select: { year: true } } },
                        }),
                        this.prisma.vehicleMake.count({ where }),
                    ]);
                }
            }
            catch (error) {
                this.logger.error(`MarketCheck backfill failed for makes (year=${year}): ${error}`);
            }
        }
        const totalPages = Math.ceil(total / limit);
        return {
            data: data.map((item) => new vehicle_make_entity_1.VehicleMakeEntity(item)),
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
        const vehicleMake = await this.prisma.vehicleMake.findUnique({
            where: { id },
            include: {
                year: {
                    select: {
                        year: true,
                    },
                },
            },
        });
        if (!vehicleMake) {
            throw new common_1.NotFoundException(`Vehicle make with ID ${id} not found`);
        }
        return new vehicle_make_entity_1.VehicleMakeEntity(vehicleMake);
    }
    async update(id, updateVehicleMakeDto) {
        const existingMake = await this.prisma.vehicleMake.findUnique({
            where: { id },
        });
        if (!existingMake) {
            throw new common_1.NotFoundException(`Vehicle make with ID ${id} not found`);
        }
        const { yearId, name, slug, isActive } = updateVehicleMakeDto;
        if (yearId && yearId !== existingMake.yearId) {
            const yearExists = await this.prisma.vehicleYear.findUnique({
                where: { id: yearId },
            });
            if (!yearExists) {
                throw new common_1.NotFoundException(`Vehicle year with ID ${yearId} not found`);
            }
        }
        const finalSlug = slug || (name ? this.slugify(name) : existingMake.slug);
        const targetYearId = yearId || existingMake.yearId;
        if (finalSlug !== existingMake.slug || targetYearId !== existingMake.yearId) {
            const duplicateMake = await this.prisma.vehicleMake.findUnique({
                where: {
                    yearId_slug: {
                        yearId: targetYearId,
                        slug: finalSlug,
                    },
                },
            });
            if (duplicateMake && duplicateMake.id !== id) {
                throw new common_1.ConflictException(`Make with slug "${finalSlug}" already exists for this year`);
            }
        }
        const updatedMake = await this.prisma.vehicleMake.update({
            where: { id },
            data: {
                ...(yearId && { yearId }),
                ...(name && { name }),
                slug: finalSlug,
                ...(isActive !== undefined && { isActive }),
            },
        });
        return new vehicle_make_entity_1.VehicleMakeEntity(updatedMake);
    }
    async remove(id) {
        const existingMake = await this.prisma.vehicleMake.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        models: true,
                    },
                },
            },
        });
        if (!existingMake) {
            throw new common_1.NotFoundException(`Vehicle make with ID ${id} not found`);
        }
        if (existingMake._count.models > 0) {
            throw new common_1.BadRequestException(`Cannot delete make with ${existingMake._count.models} related models. Set isActive to false instead.`);
        }
        await this.prisma.vehicleMake.delete({
            where: { id },
        });
        return {
            message: `Vehicle make with ID ${id} has been successfully deleted`,
        };
    }
};
exports.VehicleMakeService = VehicleMakeService;
exports.VehicleMakeService = VehicleMakeService = VehicleMakeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        marketcheck_service_1.MarketCheckService])
], VehicleMakeService);
//# sourceMappingURL=vehicle-make.service.js.map
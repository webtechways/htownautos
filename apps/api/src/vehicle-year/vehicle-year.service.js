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
var VehicleYearService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleYearService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_1 = require("@htownautos/prisma");
const query_vehicle_year_dto_1 = require("./dto/query-vehicle-year.dto");
const common_2 = require("@htownautos/common");
const vehicle_year_entity_1 = require("./entities/vehicle-year.entity");
let VehicleYearService = VehicleYearService_1 = class VehicleYearService {
    prisma;
    logger = new common_1.Logger(VehicleYearService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async handleNewYearCron() {
        const nextYear = new Date().getFullYear() + 1;
        this.logger.log(`[Cron] Ensuring year ${nextYear} exists in DB`);
        await this.ensureYearExists(nextYear);
    }
    async ensureYearExists(year) {
        try {
            await this.prisma.vehicleYear.create({
                data: { year, isActive: true },
            });
            this.logger.log(`Year ${year} added to DB`);
        }
        catch {
        }
    }
    async create(createVehicleYearDto) {
        const existing = await this.prisma.vehicleYear.findUnique({
            where: { year: createVehicleYearDto.year },
        });
        if (existing) {
            throw new common_1.ConflictException(`Year ${createVehicleYearDto.year} already exists`);
        }
        const vehicleYear = await this.prisma.vehicleYear.create({
            data: createVehicleYearDto,
        });
        return new vehicle_year_entity_1.VehicleYearEntity(vehicleYear);
    }
    async findAll(query) {
        const { page = 1, limit = 10, year, operator, isActive } = query;
        const where = {};
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (year !== undefined) {
            switch (operator) {
                case query_vehicle_year_dto_1.YearFilterOperator.EQUAL:
                    where.year = year;
                    break;
                case query_vehicle_year_dto_1.YearFilterOperator.GREATER_THAN:
                    where.year = { gt: year };
                    break;
                case query_vehicle_year_dto_1.YearFilterOperator.LESS_THAN:
                    where.year = { lt: year };
                    break;
                case query_vehicle_year_dto_1.YearFilterOperator.GREATER_THAN_OR_EQUAL:
                    where.year = { gte: year };
                    break;
                case query_vehicle_year_dto_1.YearFilterOperator.LESS_THAN_OR_EQUAL:
                    where.year = { lte: year };
                    break;
            }
        }
        const skip = (page - 1) * limit;
        const nextYear = new Date().getFullYear() + 1;
        await this.ensureYearExists(nextYear);
        const [data, total] = await Promise.all([
            this.prisma.vehicleYear.findMany({
                where,
                skip,
                take: limit,
                orderBy: { year: 'desc' },
            }),
            this.prisma.vehicleYear.count({ where }),
        ]);
        const entities = data.map((item) => new vehicle_year_entity_1.VehicleYearEntity(item));
        return new common_2.PaginatedResponseDto(entities, total, page, limit);
    }
    async findOne(id) {
        const vehicleYear = await this.prisma.vehicleYear.findUnique({
            where: { id },
        });
        if (!vehicleYear) {
            throw new common_1.NotFoundException(`Vehicle year with ID ${id} not found`);
        }
        return new vehicle_year_entity_1.VehicleYearEntity(vehicleYear);
    }
    async update(id, updateVehicleYearDto) {
        await this.findOne(id);
        if (updateVehicleYearDto.year !== undefined) {
            const existing = await this.prisma.vehicleYear.findUnique({
                where: { year: updateVehicleYearDto.year },
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException(`Year ${updateVehicleYearDto.year} already exists`);
            }
        }
        const vehicleYear = await this.prisma.vehicleYear.update({
            where: { id },
            data: updateVehicleYearDto,
        });
        return new vehicle_year_entity_1.VehicleYearEntity(vehicleYear);
    }
    async remove(id) {
        await this.findOne(id);
        const makesCount = await this.prisma.vehicleMake.count({
            where: { yearId: id },
        });
        if (makesCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete year with ${makesCount} related makes. Delete makes first or set isActive to false instead.`);
        }
        await this.prisma.vehicleYear.delete({
            where: { id },
        });
        return {
            message: `Vehicle year with ID ${id} has been successfully deleted`,
        };
    }
};
exports.VehicleYearService = VehicleYearService;
__decorate([
    (0, schedule_1.Cron)('5 0 1 1 *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VehicleYearService.prototype, "handleNewYearCron", null);
exports.VehicleYearService = VehicleYearService = VehicleYearService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], VehicleYearService);
//# sourceMappingURL=vehicle-year.service.js.map
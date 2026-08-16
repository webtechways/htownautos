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
exports.NomenclatorsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const nomenclator_entity_1 = require("./entities/nomenclator.entity");
const NOMENCLATOR_MODELS = {
    'sale-types': 'saleType',
    'mileage-statuses': 'mileageStatus',
    'vehicle-statuses': 'vehicleStatus',
    'title-statuses': 'titleStatus',
    'vehicle-conditions': 'vehicleCondition',
    'brand-statuses': 'brandStatus',
    'vehicle-types': 'vehicleType',
    'body-types': 'bodyType',
    'fuel-types': 'fuelType',
    'drive-types': 'driveType',
    'transmission-types': 'transmissionType',
    'vehicle-sources': 'vehicleSource',
    'inspection-statuses': 'inspectionStatus',
    'activity-types': 'activityType',
    'activity-statuses': 'activityStatus',
    'lead-sources': 'leadSource',
    'inquiry-types': 'inquiryType',
    'preferred-languages': 'preferredLanguage',
    'contact-methods': 'contactMethod',
    'contact-times': 'contactTime',
    'genders': 'gender',
    'id-types': 'idType',
    'id-states': 'idState',
    'employment-statuses': 'employmentStatus',
    'occupations': 'occupation',
    'deal-statuses': 'dealStatus',
    'finance-types': 'financeType',
    'title-brands': 'titleBrand',
    'mileage-units': 'mileageUnit',
    'vehicle-engines': 'vehicleEngine',
};
let NomenclatorsService = class NomenclatorsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getModel(type) {
        const modelName = NOMENCLATOR_MODELS[type];
        if (!modelName) {
            throw new common_1.BadRequestException(`Invalid nomenclator type: ${type}. Valid types: ${Object.keys(NOMENCLATOR_MODELS).join(', ')}`);
        }
        return this.prisma.getModel(modelName);
    }
    async create(type, createNomenclatorDto) {
        const model = this.getModel(type);
        const { slug, title, isActive = true } = createNomenclatorDto;
        const existing = await model.findUnique({
            where: { slug },
        });
        if (existing) {
            throw new common_1.ConflictException(`${type} with slug "${slug}" already exists`);
        }
        const nomenclator = await model.create({
            data: {
                slug,
                title,
                isActive,
            },
        });
        return new nomenclator_entity_1.NomenclatorEntity(nomenclator);
    }
    async findAll(type, query) {
        const model = this.getModel(type);
        const { page = 1, limit = 10, isActive } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        const [data, total] = await Promise.all([
            model.findMany({
                where,
                skip,
                take: limit,
                orderBy: { title: 'asc' },
            }),
            model.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            data: data.map((item) => new nomenclator_entity_1.NomenclatorEntity(item)),
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
    async findOne(type, id) {
        const model = this.getModel(type);
        const nomenclator = await model.findUnique({
            where: { id },
        });
        if (!nomenclator) {
            throw new common_1.NotFoundException(`${type} with ID ${id} not found`);
        }
        return new nomenclator_entity_1.NomenclatorEntity(nomenclator);
    }
    async findBySlug(type, slug) {
        const model = this.getModel(type);
        const nomenclator = await model.findUnique({
            where: { slug },
        });
        if (!nomenclator) {
            throw new common_1.NotFoundException(`${type} with slug "${slug}" not found`);
        }
        return new nomenclator_entity_1.NomenclatorEntity(nomenclator);
    }
    async update(type, id, updateNomenclatorDto) {
        const model = this.getModel(type);
        const existing = await model.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`${type} with ID ${id} not found`);
        }
        const { slug, title, isActive } = updateNomenclatorDto;
        if (slug && slug !== existing.slug) {
            const duplicate = await model.findUnique({
                where: { slug },
            });
            if (duplicate) {
                throw new common_1.ConflictException(`${type} with slug "${slug}" already exists`);
            }
        }
        const updated = await model.update({
            where: { id },
            data: {
                ...(slug && { slug }),
                ...(title && { title }),
                ...(isActive !== undefined && { isActive }),
            },
        });
        return new nomenclator_entity_1.NomenclatorEntity(updated);
    }
    async remove(type, id) {
        const model = this.getModel(type);
        const existing = await model.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`${type} with ID ${id} not found`);
        }
        await model.delete({
            where: { id },
        });
        return {
            message: `${type} with ID ${id} has been successfully deleted`,
        };
    }
    getAvailableTypes() {
        return Object.keys(NOMENCLATOR_MODELS);
    }
};
exports.NomenclatorsService = NomenclatorsService;
exports.NomenclatorsService = NomenclatorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], NomenclatorsService);
//# sourceMappingURL=nomenclators.service.js.map
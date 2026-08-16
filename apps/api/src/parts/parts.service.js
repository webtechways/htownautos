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
exports.PartsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
let PartsService = class PartsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generateSku(tenantId) {
        const prefix = 'HTW-P-';
        const lastPart = await this.prisma.part.findFirst({
            where: {
                tenantId,
                sku: {
                    startsWith: prefix,
                },
            },
            orderBy: {
                sku: 'desc',
            },
            select: {
                sku: true,
            },
        });
        let nextNumber = 1;
        if (lastPart?.sku) {
            const numPart = lastPart.sku.replace(prefix, '');
            const parsed = parseInt(numPart, 10);
            if (!isNaN(parsed)) {
                nextNumber = parsed + 1;
            }
        }
        return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
    }
    async create(tenantId, createPartDto) {
        const condition = await this.prisma.partCondition.findFirst({
            where: {
                id: createPartDto.conditionId,
                OR: [{ tenantId }, { tenantId: null }],
            },
        });
        if (!condition) {
            throw new common_1.NotFoundException(`Part condition with ID '${createPartDto.conditionId}' not found`);
        }
        const status = await this.prisma.partStatus.findFirst({
            where: {
                id: createPartDto.statusId,
                OR: [{ tenantId }, { tenantId: null }],
            },
        });
        if (!status) {
            throw new common_1.NotFoundException(`Part status with ID '${createPartDto.statusId}' not found`);
        }
        if (createPartDto.categoryId) {
            const category = await this.prisma.partCategory.findFirst({
                where: {
                    id: createPartDto.categoryId,
                    OR: [{ tenantId }, { tenantId: null }],
                },
            });
            if (!category) {
                throw new common_1.NotFoundException(`Part category with ID '${createPartDto.categoryId}' not found`);
            }
        }
        const sku = createPartDto.sku || (await this.generateSku(tenantId));
        const { sku: _sku, purchaseDate, ...restDto } = createPartDto;
        const record = await this.prisma.part.create({
            data: {
                tenantId,
                ...restDto,
                sku,
                purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
            },
            include: this.getPartIncludes(),
        });
        return record;
    }
    async findAll(tenantId, query) {
        const { search, categoryId, conditionId, statusId, yearId, makeId, modelId, trimId, isOem, isAftermarket, minPrice, maxPrice, lowStock, location, supplier, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const where = { tenantId };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { partNumber: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { sourceVin: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (conditionId) {
            where.conditionId = conditionId;
        }
        if (statusId) {
            where.statusId = statusId;
        }
        if (yearId) {
            where.yearId = yearId;
        }
        if (makeId) {
            where.makeId = makeId;
        }
        if (modelId) {
            where.modelId = modelId;
        }
        if (trimId) {
            where.trimId = trimId;
        }
        if (isOem !== undefined) {
            where.isOem = isOem;
        }
        if (isAftermarket !== undefined) {
            where.isAftermarket = isAftermarket;
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) {
                where.price.gte = minPrice;
            }
            if (maxPrice !== undefined) {
                where.price.lte = maxPrice;
            }
        }
        if (lowStock) {
            where.AND = [
                ...(Array.isArray(where.AND) ? where.AND : []),
                {
                    quantity: {
                        lte: this.prisma.part.fields.minQuantity,
                    },
                },
            ];
            delete where.AND;
            where.quantity = { lte: 0 };
        }
        if (location) {
            where.location = { contains: location, mode: 'insensitive' };
        }
        if (supplier) {
            where.supplier = { contains: supplier, mode: 'insensitive' };
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.part.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: this.getPartIncludes(),
            }),
            this.prisma.part.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(tenantId, id) {
        const part = await this.prisma.part.findFirst({
            where: { id, tenantId },
            include: this.getPartIncludes(),
        });
        if (!part) {
            throw new common_1.NotFoundException(`Part with ID '${id}' not found`);
        }
        return part;
    }
    async update(tenantId, id, updatePartDto) {
        await this.findOne(tenantId, id);
        if (updatePartDto.conditionId) {
            const condition = await this.prisma.partCondition.findFirst({
                where: {
                    id: updatePartDto.conditionId,
                    OR: [{ tenantId }, { tenantId: null }],
                },
            });
            if (!condition) {
                throw new common_1.NotFoundException(`Part condition with ID '${updatePartDto.conditionId}' not found`);
            }
        }
        if (updatePartDto.statusId) {
            const status = await this.prisma.partStatus.findFirst({
                where: {
                    id: updatePartDto.statusId,
                    OR: [{ tenantId }, { tenantId: null }],
                },
            });
            if (!status) {
                throw new common_1.NotFoundException(`Part status with ID '${updatePartDto.statusId}' not found`);
            }
        }
        const record = await this.prisma.part.update({
            where: { id },
            data: {
                ...updatePartDto,
                purchaseDate: updatePartDto.purchaseDate
                    ? new Date(updatePartDto.purchaseDate)
                    : undefined,
            },
            include: this.getPartIncludes(),
        });
        return record;
    }
    async remove(tenantId, id) {
        const part = await this.findOne(tenantId, id);
        await this.prisma.part.delete({ where: { id } });
        return {
            message: `Part '${part.name}' has been successfully deleted`,
        };
    }
    async removeBulk(tenantId, ids) {
        const parts = await this.prisma.part.findMany({
            where: { id: { in: ids }, tenantId },
            select: { id: true },
        });
        const foundIds = parts.map((p) => p.id);
        const notFound = ids.filter((id) => !foundIds.includes(id));
        if (notFound.length > 0) {
            throw new common_1.NotFoundException(`Parts not found or not accessible: ${notFound.join(', ')}`);
        }
        const result = await this.prisma.part.deleteMany({
            where: { id: { in: foundIds }, tenantId },
        });
        return {
            message: `${result.count} part(s) have been successfully deleted`,
            count: result.count,
        };
    }
    async updateQuantity(tenantId, id, adjustment, reason) {
        const part = await this.findOne(tenantId, id);
        const newQuantity = part.quantity + adjustment;
        if (newQuantity < 0) {
            throw new common_1.BadRequestException(`Cannot reduce quantity below 0. Current: ${part.quantity}, Adjustment: ${adjustment}`);
        }
        return this.prisma.part.update({
            where: { id },
            data: { quantity: newQuantity },
            include: this.getPartIncludes(),
        });
    }
    async markAsSold(tenantId, id, soldData) {
        const part = await this.findOne(tenantId, id);
        const soldStatus = await this.prisma.partStatus.findFirst({
            where: {
                slug: 'sold',
                OR: [{ tenantId }, { tenantId: null }],
            },
        });
        if (!soldStatus) {
            throw new common_1.NotFoundException('Sold status not found. Please create a status with slug "sold".');
        }
        return this.prisma.part.update({
            where: { id },
            data: {
                statusId: soldStatus.id,
                soldAt: new Date(),
                soldToId: soldData.soldToId,
                soldPrice: soldData.soldPrice,
                soldDealId: soldData.soldDealId,
                quantity: Math.max(0, part.quantity - 1),
            },
            include: this.getPartIncludes(),
        });
    }
    async getLowStockParts(tenantId) {
        const parts = await this.prisma.$queryRaw `
      SELECT p.*,
             pc.title as condition_title,
             ps.title as status_title
      FROM parts p
      LEFT JOIN part_conditions pc ON p."conditionId" = pc.id
      LEFT JOIN part_statuses ps ON p."statusId" = ps.id
      WHERE p."tenantId" = ${tenantId}
        AND p.quantity <= p."minQuantity"
      ORDER BY p.quantity ASC
    `;
        return parts;
    }
    async backfillMissingSKUs(tenantId) {
        const partsWithoutSku = await this.prisma.part.findMany({
            where: {
                tenantId,
                OR: [{ sku: null }, { sku: '' }],
            },
            select: { id: true },
            orderBy: { createdAt: 'asc' },
        });
        let updated = 0;
        for (const part of partsWithoutSku) {
            const sku = await this.generateSku(tenantId);
            await this.prisma.part.update({
                where: { id: part.id },
                data: { sku },
            });
            updated++;
        }
        return { updated };
    }
    getPartIncludes() {
        return {
            category: {
                select: { id: true, slug: true, title: true },
            },
            condition: {
                select: { id: true, slug: true, title: true },
            },
            status: {
                select: { id: true, slug: true, title: true },
            },
            year: {
                select: { id: true, year: true },
            },
            make: {
                select: { id: true, name: true, slug: true },
            },
            model: {
                select: { id: true, name: true, slug: true },
            },
            trim: {
                select: { id: true, name: true, slug: true },
            },
            sourceVehicle: {
                select: { id: true, vin: true, stockNumber: true },
            },
            mainImage: {
                select: { id: true, url: true, filename: true },
            },
        };
    }
    async createCondition(tenantId, dto) {
        const existing = await this.prisma.partCondition.findFirst({
            where: { tenantId, slug: dto.slug },
        });
        if (existing) {
            throw new common_1.ConflictException(`Part condition with slug '${dto.slug}' already exists`);
        }
        const record = await this.prisma.partCondition.create({
            data: { ...dto, tenantId },
        });
        return record;
    }
    async findAllConditions(tenantId) {
        return this.prisma.partCondition.findMany({
            where: {
                OR: [{ tenantId }, { tenantId: null }],
                isActive: true,
            },
            orderBy: { title: 'asc' },
        });
    }
    async updateCondition(tenantId, id, dto) {
        const condition = await this.prisma.partCondition.findFirst({
            where: { id, OR: [{ tenantId }, { tenantId: null }] },
        });
        if (!condition) {
            throw new common_1.NotFoundException(`Part condition with ID '${id}' not found`);
        }
        if (dto.slug && dto.slug !== condition.slug) {
            const existing = await this.prisma.partCondition.findFirst({
                where: { tenantId: condition.tenantId, slug: dto.slug },
            });
            if (existing) {
                throw new common_1.ConflictException(`Part condition with slug '${dto.slug}' already exists`);
            }
        }
        const record = await this.prisma.partCondition.update({
            where: { id },
            data: dto,
        });
        return record;
    }
    async removeCondition(tenantId, id) {
        const condition = await this.prisma.partCondition.findFirst({
            where: { id, OR: [{ tenantId }, { tenantId: null }] },
        });
        if (!condition) {
            throw new common_1.NotFoundException(`Part condition with ID '${id}' not found`);
        }
        const usageCount = await this.prisma.part.count({
            where: { conditionId: id },
        });
        if (usageCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete condition '${condition.title}' because it is used by ${usageCount} parts`);
        }
        await this.prisma.partCondition.delete({ where: { id } });
        return { message: `Part condition '${condition.title}' has been deleted` };
    }
    async createStatus(tenantId, dto) {
        const existing = await this.prisma.partStatus.findFirst({
            where: { tenantId, slug: dto.slug },
        });
        if (existing) {
            throw new common_1.ConflictException(`Part status with slug '${dto.slug}' already exists`);
        }
        const record = await this.prisma.partStatus.create({
            data: { ...dto, tenantId },
        });
        return record;
    }
    async findAllStatuses(tenantId) {
        return this.prisma.partStatus.findMany({
            where: {
                OR: [{ tenantId }, { tenantId: null }],
                isActive: true,
            },
            orderBy: { title: 'asc' },
        });
    }
    async updateStatus(tenantId, id, dto) {
        const status = await this.prisma.partStatus.findFirst({
            where: { id, OR: [{ tenantId }, { tenantId: null }] },
        });
        if (!status) {
            throw new common_1.NotFoundException(`Part status with ID '${id}' not found`);
        }
        if (dto.slug && dto.slug !== status.slug) {
            const existing = await this.prisma.partStatus.findFirst({
                where: { tenantId: status.tenantId, slug: dto.slug },
            });
            if (existing) {
                throw new common_1.ConflictException(`Part status with slug '${dto.slug}' already exists`);
            }
        }
        const record = await this.prisma.partStatus.update({
            where: { id },
            data: dto,
        });
        return record;
    }
    async removeStatus(tenantId, id) {
        const status = await this.prisma.partStatus.findFirst({
            where: { id, OR: [{ tenantId }, { tenantId: null }] },
        });
        if (!status) {
            throw new common_1.NotFoundException(`Part status with ID '${id}' not found`);
        }
        const usageCount = await this.prisma.part.count({
            where: { statusId: id },
        });
        if (usageCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete status '${status.title}' because it is used by ${usageCount} parts`);
        }
        await this.prisma.partStatus.delete({ where: { id } });
        return { message: `Part status '${status.title}' has been deleted` };
    }
    async createCategory(tenantId, dto) {
        const existing = await this.prisma.partCategory.findFirst({
            where: { tenantId, slug: dto.slug },
        });
        if (existing) {
            throw new common_1.ConflictException(`Part category with slug '${dto.slug}' already exists`);
        }
        if (dto.parentId) {
            const parent = await this.prisma.partCategory.findFirst({
                where: { id: dto.parentId, OR: [{ tenantId }, { tenantId: null }] },
            });
            if (!parent) {
                throw new common_1.NotFoundException(`Parent category with ID '${dto.parentId}' not found`);
            }
        }
        const record = await this.prisma.partCategory.create({
            data: { ...dto, tenantId },
            include: {
                parent: { select: { id: true, slug: true, title: true } },
                children: { select: { id: true, slug: true, title: true } },
            },
        });
        return record;
    }
    async findAllCategories(tenantId, includeChildren = true) {
        const categories = await this.prisma.partCategory.findMany({
            where: {
                OR: [{ tenantId }, { tenantId: null }],
                isActive: true,
                parentId: null,
            },
            include: includeChildren
                ? {
                    children: {
                        where: { isActive: true },
                        include: {
                            children: {
                                where: { isActive: true },
                            },
                        },
                    },
                }
                : undefined,
            orderBy: { title: 'asc' },
        });
        return categories;
    }
    async updateCategory(tenantId, id, dto) {
        const category = await this.prisma.partCategory.findFirst({
            where: { id, OR: [{ tenantId }, { tenantId: null }] },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Part category with ID '${id}' not found`);
        }
        if (dto.slug && dto.slug !== category.slug) {
            const existing = await this.prisma.partCategory.findFirst({
                where: { tenantId: category.tenantId, slug: dto.slug },
            });
            if (existing) {
                throw new common_1.ConflictException(`Part category with slug '${dto.slug}' already exists`);
            }
        }
        if (dto.parentId === id) {
            throw new common_1.BadRequestException('A category cannot be its own parent');
        }
        const record = await this.prisma.partCategory.update({
            where: { id },
            data: dto,
            include: {
                parent: { select: { id: true, slug: true, title: true } },
                children: { select: { id: true, slug: true, title: true } },
            },
        });
        return record;
    }
    async removeCategory(tenantId, id) {
        const category = await this.prisma.partCategory.findFirst({
            where: { id, OR: [{ tenantId }, { tenantId: null }] },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Part category with ID '${id}' not found`);
        }
        const childCount = await this.prisma.partCategory.count({
            where: { parentId: id },
        });
        if (childCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete category '${category.title}' because it has ${childCount} subcategories`);
        }
        const usageCount = await this.prisma.part.count({
            where: { categoryId: id },
        });
        if (usageCount > 0) {
            throw new common_1.BadRequestException(`Cannot delete category '${category.title}' because it is used by ${usageCount} parts`);
        }
        await this.prisma.partCategory.delete({ where: { id } });
        return { message: `Part category '${category.title}' has been deleted` };
    }
};
exports.PartsService = PartsService;
exports.PartsService = PartsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], PartsService);
//# sourceMappingURL=parts.service.js.map
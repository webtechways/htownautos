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
exports.MetaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
let MetaService = class MetaService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createMetaDto) {
        const existing = await this.prisma.meta.findUnique({
            where: {
                entityType_entityId_key: {
                    entityType: createMetaDto.entityType,
                    entityId: createMetaDto.entityId,
                    key: createMetaDto.key,
                },
            },
        });
        if (existing) {
            throw new common_1.ConflictException(`Meta with key "${createMetaDto.key}" already exists for ${createMetaDto.entityType}:${createMetaDto.entityId}`);
        }
        return this.prisma.meta.create({
            data: createMetaDto,
        });
    }
    async findAll(queryDto) {
        const { page = 1, limit = 20, search, ...filters } = queryDto;
        const skip = (page - 1) * limit;
        const where = {
            ...filters,
            isDeleted: false,
        };
        if (search) {
            where.OR = [
                { key: { contains: search, mode: 'insensitive' } },
                { value: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.meta.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.meta.count({ where }),
        ]);
        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const meta = await this.prisma.meta.findUnique({
            where: { id },
        });
        if (!meta || meta.isDeleted) {
            throw new common_1.NotFoundException(`Meta with ID ${id} not found`);
        }
        return meta;
    }
    async findByEntity(entityType, entityId) {
        return this.prisma.meta.findMany({
            where: {
                entityType,
                entityId,
                isDeleted: false,
                isActive: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByEntityAndKey(entityType, entityId, key) {
        const meta = await this.prisma.meta.findUnique({
            where: {
                entityType_entityId_key: {
                    entityType,
                    entityId,
                    key,
                },
            },
        });
        if (!meta || meta.isDeleted) {
            throw new common_1.NotFoundException(`Meta with key "${key}" not found for ${entityType}:${entityId}`);
        }
        return meta;
    }
    async update(id, updateMetaDto) {
        const meta = await this.findOne(id);
        if (updateMetaDto.key) {
            const existing = await this.prisma.meta.findFirst({
                where: {
                    entityType: meta.entityType,
                    entityId: meta.entityId,
                    key: updateMetaDto.key,
                    id: { not: id },
                    isDeleted: false,
                },
            });
            if (existing) {
                throw new common_1.ConflictException(`Meta with key "${updateMetaDto.key}" already exists for this entity`);
            }
        }
        return this.prisma.meta.update({
            where: { id },
            data: updateMetaDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.meta.delete({
            where: { id },
        });
    }
    async hardDelete(id) {
        await this.findOne(id);
        return this.prisma.meta.delete({
            where: { id },
        });
    }
    async bulkCreate(metas) {
        const keys = new Set();
        for (const meta of metas) {
            const key = `${meta.entityType}:${meta.entityId}:${meta.key}`;
            if (keys.has(key)) {
                throw new common_1.BadRequestException(`Duplicate meta key "${meta.key}" in bulk create request`);
            }
            keys.add(key);
        }
        return this.prisma.$transaction(metas.map((meta) => this.prisma.meta.create({
            data: meta,
        })));
    }
    async deleteByEntity(entityType, entityId) {
        return this.prisma.meta.updateMany({
            where: {
                entityType,
                entityId,
                isDeleted: false,
            },
            data: {
                isDeleted: true,
                isActive: false,
            },
        });
    }
};
exports.MetaService = MetaService;
exports.MetaService = MetaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], MetaService);
//# sourceMappingURL=meta.service.js.map
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
exports.NotesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
let NotesService = class NotesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, createNoteDto, createdById) {
        const record = await this.prisma.note.create({
            data: {
                tenantId,
                content: createNoteDto.content,
                createdById,
                buyerId: createNoteDto.buyerId,
                vehicleId: createNoteDto.vehicleId,
                dealId: createNoteDto.dealId,
            },
            include: {
                createdBy: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                    },
                },
                buyer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        return record;
    }
    async findAll(tenantId, query) {
        const { buyerId, vehicleId, dealId, page = 1, limit = 20 } = query;
        const where = {
            tenantId,
        };
        if (buyerId)
            where.buyerId = buyerId;
        if (vehicleId)
            where.vehicleId = vehicleId;
        if (dealId)
            where.dealId = dealId;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.note.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    createdBy: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    email: true,
                                    firstName: true,
                                    lastName: true,
                                    avatar: true,
                                },
                            },
                        },
                    },
                    buyer: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                },
            }),
            this.prisma.note.count({ where }),
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
        const note = await this.prisma.note.findFirst({
            where: { id, tenantId },
            include: {
                createdBy: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                    },
                },
                buyer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        if (!note) {
            throw new common_1.NotFoundException('Note not found');
        }
        return note;
    }
    async update(tenantId, id, updateNoteDto) {
        await this.findOne(tenantId, id);
        const record = await this.prisma.note.update({
            where: { id },
            data: {
                content: updateNoteDto.content,
            },
            include: {
                createdBy: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            },
                        },
                    },
                },
                buyer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        return record;
    }
    async remove(tenantId, id) {
        await this.findOne(tenantId, id);
        await this.prisma.note.delete({ where: { id } });
        return { message: 'Note deleted successfully' };
    }
    async findByBuyer(tenantId, buyerId, query) {
        return this.findAll(tenantId, { ...query, buyerId });
    }
};
exports.NotesService = NotesService;
exports.NotesService = NotesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], NotesService);
//# sourceMappingURL=notes.service.js.map
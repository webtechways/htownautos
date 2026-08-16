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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const create_task_dto_1 = require("./dto/create-task.dto");
let TasksService = class TasksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, createTaskDto, createdById) {
        const assignedTo = await this.prisma.tenantUser.findFirst({
            where: {
                id: createTaskDto.assignedToId,
                tenantId,
                status: 'active',
            },
        });
        if (!assignedTo) {
            throw new common_1.NotFoundException('Assigned user not found in this tenant');
        }
        const record = await this.prisma.task.create({
            data: {
                tenantId,
                title: createTaskDto.title,
                description: createTaskDto.description,
                status: createTaskDto.status || create_task_dto_1.TaskStatus.PENDING,
                priority: createTaskDto.priority || 'normal',
                dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
                dueTime: createTaskDto.dueTime,
                assignedToId: createTaskDto.assignedToId,
                createdById,
                buyerId: createTaskDto.buyerId,
                vehicleId: createTaskDto.vehicleId,
                dealId: createTaskDto.dealId,
                notes: createTaskDto.notes,
            },
            include: {
                assignedTo: {
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
        const { status, priority, assignedToId, createdById, buyerId, vehicleId, dealId, search, page = 1, limit = 20, sortBy = 'dueDate', sortOrder = 'asc', } = query;
        const where = {
            tenantId,
        };
        if (status)
            where.status = status;
        if (priority)
            where.priority = priority;
        if (assignedToId)
            where.assignedToId = assignedToId;
        if (createdById)
            where.createdById = createdById;
        if (buyerId)
            where.buyerId = buyerId;
        if (vehicleId)
            where.vehicleId = vehicleId;
        if (dealId)
            where.dealId = dealId;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const skip = (page - 1) * limit;
        let orderBy;
        if (sortBy === 'dueDate') {
            orderBy = [
                { dueDate: { sort: sortOrder, nulls: 'last' } },
                { createdAt: 'desc' },
            ];
        }
        else {
            orderBy = { [sortBy]: sortOrder };
        }
        const [data, total] = await Promise.all([
            this.prisma.task.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    assignedTo: {
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
            this.prisma.task.count({ where }),
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
        const task = await this.prisma.task.findFirst({
            where: { id, tenantId },
            include: {
                assignedTo: {
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
                        phoneMain: true,
                    },
                },
            },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        return task;
    }
    async update(tenantId, id, updateTaskDto, requestingTenantUserId) {
        const task = await this.findOne(tenantId, id);
        if (updateTaskDto.assignedToId) {
            const assignedTo = await this.prisma.tenantUser.findFirst({
                where: {
                    id: updateTaskDto.assignedToId,
                    tenantId,
                    status: 'active',
                },
            });
            if (!assignedTo) {
                throw new common_1.NotFoundException('Assigned user not found in this tenant');
            }
        }
        const data = {};
        if (updateTaskDto.title !== undefined)
            data.title = updateTaskDto.title;
        if (updateTaskDto.description !== undefined)
            data.description = updateTaskDto.description;
        if (updateTaskDto.status !== undefined) {
            data.status = updateTaskDto.status;
            if (updateTaskDto.status === create_task_dto_1.TaskStatus.COMPLETED) {
                data.completedAt = new Date();
            }
            else if (task.status === 'completed') {
                data.completedAt = null;
            }
        }
        if (updateTaskDto.priority !== undefined)
            data.priority = updateTaskDto.priority;
        if (updateTaskDto.dueDate !== undefined) {
            data.dueDate = updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : null;
        }
        if (updateTaskDto.dueTime !== undefined)
            data.dueTime = updateTaskDto.dueTime;
        if (updateTaskDto.assignedToId !== undefined) {
            data.assignedTo = { connect: { id: updateTaskDto.assignedToId } };
        }
        if (updateTaskDto.notes !== undefined)
            data.notes = updateTaskDto.notes;
        const record = await this.prisma.task.update({
            where: { id },
            data,
            include: {
                assignedTo: {
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
        await this.prisma.task.delete({ where: { id } });
        return { message: 'Task deleted successfully' };
    }
    async findByBuyer(tenantId, buyerId, query) {
        return this.findAll(tenantId, { ...query, buyerId });
    }
    async findByVehicle(tenantId, vehicleId, query) {
        return this.findAll(tenantId, { ...query, vehicleId });
    }
    async getMyTasks(tenantId, tenantUserId, query) {
        return this.findAll(tenantId, { ...query, assignedToId: tenantUserId });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map
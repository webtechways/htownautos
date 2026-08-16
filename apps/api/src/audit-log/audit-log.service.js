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
exports.AuditLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
let AuditLogService = class AuditLogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(query) {
        const { page = 1, limit = 20, vehicleId, buyerId, dealId, resource, action, userId, search } = query;
        const skip = (page - 1) * limit;
        const conditions = [];
        if (vehicleId)
            conditions.push({ vehicleId });
        if (buyerId)
            conditions.push({ buyerId });
        if (dealId)
            conditions.push({ dealId });
        if (resource)
            conditions.push({ resource });
        if (action)
            conditions.push({ action });
        if (userId)
            conditions.push({ userId });
        if (search) {
            conditions.push({
                OR: [
                    { userEmail: { contains: search, mode: 'insensitive' } },
                    { resource: { contains: search, mode: 'insensitive' } },
                    { action: { contains: search, mode: 'insensitive' } },
                    { errorMessage: { contains: search, mode: 'insensitive' } },
                ],
            });
        }
        if (!action && (vehicleId || buyerId || dealId)) {
            conditions.push({ action: { notIn: ['read', 'list', 'list_by_entity'] } });
        }
        const where = conditions.length > 0 ? { AND: conditions } : {};
        const [data, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return {
            data,
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
    async findOne(id) {
        const log = await this.prisma.auditLog.findUnique({ where: { id } });
        if (!log) {
            throw new common_1.NotFoundException(`Audit log with ID ${id} not found`);
        }
        return log;
    }
    async create(data) {
        const record = await this.prisma.auditLog.create({
            data: {
                action: data.action,
                resource: data.resource,
                vehicleId: data.vehicleId,
                buyerId: data.buyerId,
                dealId: data.dealId,
                userId: data.userId,
                userEmail: data.userEmail || 'unknown',
                tenantId: data.tenantId,
                ipAddress: data.ipAddress || 'unknown',
                userAgent: data.userAgent,
                method: 'POST',
                url: `/audit-logs`,
                status: 'success',
                level: data.level || 'low',
                pii: data.piiAccessed || false,
                metadata: data.details,
            },
        });
        return record;
    }
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map
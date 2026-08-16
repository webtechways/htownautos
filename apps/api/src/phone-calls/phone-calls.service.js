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
var PhoneCallsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhoneCallsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const create_phone_call_dto_1 = require("./dto/create-phone-call.dto");
let PhoneCallsService = PhoneCallsService_1 = class PhoneCallsService {
    prisma;
    logger = new common_1.Logger(PhoneCallsService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canUserAccessRecordings(tenantId, userId) {
        const tenantUser = await this.prisma.tenantUser.findUnique({
            where: {
                tenantId_userId: { tenantId, userId },
            },
            include: {
                role: { select: { slug: true } },
            },
        });
        const roleSlug = tenantUser?.role?.slug;
        return roleSlug !== undefined && roleSlug !== 'salesperson';
    }
    filterSensitiveData(data, canAccessRecordings) {
        if (canAccessRecordings)
            return data;
        return data.map((call) => ({
            ...call,
            recordingUrl: null,
            transcription: null,
        }));
    }
    includeRelations = {
        caller: {
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
                phoneMobile: true,
            },
        },
        transferredTo: {
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
        transferredFrom: {
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
    };
    async create(tenantId, createPhoneCallDto, callerId) {
        const buyer = await this.prisma.buyer.findFirst({
            where: {
                id: createPhoneCallDto.buyerId,
                tenantId,
            },
        });
        if (!buyer) {
            throw new common_1.NotFoundException('Buyer not found in this tenant');
        }
        const record = await this.prisma.phoneCall.create({
            data: {
                tenantId,
                callerId,
                buyerId: createPhoneCallDto.buyerId,
                direction: createPhoneCallDto.direction,
                status: createPhoneCallDto.status || create_phone_call_dto_1.CallStatus.COMPLETED,
                fromNumber: createPhoneCallDto.fromNumber,
                toNumber: createPhoneCallDto.toNumber,
                startedAt: new Date(createPhoneCallDto.startedAt),
                endedAt: createPhoneCallDto.endedAt ? new Date(createPhoneCallDto.endedAt) : null,
                duration: createPhoneCallDto.duration,
                outcome: createPhoneCallDto.outcome,
                notes: createPhoneCallDto.notes,
                recordingUrl: createPhoneCallDto.recordingUrl,
                transcription: createPhoneCallDto.transcription,
                transcriptionStatus: createPhoneCallDto.transcriptionStatus,
                aiSummary: createPhoneCallDto.aiSummary,
                aiSentiment: createPhoneCallDto.aiSentiment,
                aiKeyPoints: createPhoneCallDto.aiKeyPoints,
                aiNextSteps: createPhoneCallDto.aiNextSteps,
            },
            include: this.includeRelations,
        });
        return record;
    }
    async findAll(tenantId, query, canAccessRecordings = true) {
        const { buyerId, callerId, direction, status, outcome, fromDate, toDate, page = 1, limit = 20, sortBy = 'startedAt', sortOrder = 'desc', } = query;
        const where = {
            tenantId,
        };
        if (buyerId)
            where.buyerId = buyerId;
        if (callerId)
            where.callerId = callerId;
        if (direction)
            where.direction = direction;
        if (status)
            where.status = status;
        if (outcome)
            where.outcome = outcome;
        if (fromDate || toDate) {
            where.startedAt = {};
            if (fromDate)
                where.startedAt.gte = new Date(fromDate);
            if (toDate)
                where.startedAt.lte = new Date(toDate);
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.phoneCall.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: this.includeRelations,
            }),
            this.prisma.phoneCall.count({ where }),
        ]);
        return {
            data: this.filterSensitiveData(data, canAccessRecordings),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            canAccessRecordings,
        };
    }
    async findOne(tenantId, id, canAccessRecordings = true) {
        const phoneCall = await this.prisma.phoneCall.findFirst({
            where: { id, tenantId },
            include: this.includeRelations,
        });
        if (!phoneCall) {
            throw new common_1.NotFoundException('Phone call not found');
        }
        if (!canAccessRecordings) {
            return { ...phoneCall, recordingUrl: null, transcription: null };
        }
        return phoneCall;
    }
    async update(tenantId, id, updatePhoneCallDto) {
        await this.findOne(tenantId, id);
        const data = {};
        if (updatePhoneCallDto.direction !== undefined)
            data.direction = updatePhoneCallDto.direction;
        if (updatePhoneCallDto.status !== undefined)
            data.status = updatePhoneCallDto.status;
        if (updatePhoneCallDto.fromNumber !== undefined)
            data.fromNumber = updatePhoneCallDto.fromNumber;
        if (updatePhoneCallDto.toNumber !== undefined)
            data.toNumber = updatePhoneCallDto.toNumber;
        if (updatePhoneCallDto.startedAt !== undefined)
            data.startedAt = new Date(updatePhoneCallDto.startedAt);
        if (updatePhoneCallDto.endedAt !== undefined) {
            data.endedAt = updatePhoneCallDto.endedAt ? new Date(updatePhoneCallDto.endedAt) : null;
        }
        if (updatePhoneCallDto.duration !== undefined)
            data.duration = updatePhoneCallDto.duration;
        if (updatePhoneCallDto.outcome !== undefined)
            data.outcome = updatePhoneCallDto.outcome;
        if (updatePhoneCallDto.notes !== undefined)
            data.notes = updatePhoneCallDto.notes;
        if (updatePhoneCallDto.recordingUrl !== undefined)
            data.recordingUrl = updatePhoneCallDto.recordingUrl;
        if (updatePhoneCallDto.transcription !== undefined)
            data.transcription = updatePhoneCallDto.transcription;
        if (updatePhoneCallDto.transcriptionStatus !== undefined)
            data.transcriptionStatus = updatePhoneCallDto.transcriptionStatus;
        if (updatePhoneCallDto.aiSummary !== undefined)
            data.aiSummary = updatePhoneCallDto.aiSummary;
        if (updatePhoneCallDto.aiSentiment !== undefined)
            data.aiSentiment = updatePhoneCallDto.aiSentiment;
        if (updatePhoneCallDto.aiKeyPoints !== undefined)
            data.aiKeyPoints = updatePhoneCallDto.aiKeyPoints;
        if (updatePhoneCallDto.aiNextSteps !== undefined)
            data.aiNextSteps = updatePhoneCallDto.aiNextSteps;
        const record = await this.prisma.phoneCall.update({
            where: { id },
            data,
            include: this.includeRelations,
        });
        return record;
    }
    async remove(tenantId, id) {
        const existing = await this.findOne(tenantId, id);
        await this.prisma.phoneCall.delete({ where: { id } });
        return { message: 'Phone call deleted successfully' };
    }
    async findByBuyer(tenantId, buyerId, query, canAccessRecordings = true) {
        return this.findAll(tenantId, { ...query, buyerId }, canAccessRecordings);
    }
    async findByPhoneNumbers(tenantId, phoneNumbers, query, canAccessRecordings = true) {
        const { page = 1, limit = 20, sortBy = 'startedAt', sortOrder = 'desc', direction, status, } = query;
        const normalizedNumbers = phoneNumbers
            .filter(Boolean)
            .map((phone) => {
            const digits = phone.replace(/\D/g, '');
            if (digits.length === 10) {
                return `+1${digits}`;
            }
            if (digits.length === 11 && digits.startsWith('1')) {
                return `+${digits}`;
            }
            return digits.startsWith('+') ? digits : `+${digits}`;
        });
        if (normalizedNumbers.length === 0) {
            return {
                data: [],
                total: 0,
                page,
                limit,
                totalPages: 0,
                canAccessRecordings,
            };
        }
        const where = {
            tenantId,
            OR: [
                { fromNumber: { in: normalizedNumbers } },
                { toNumber: { in: normalizedNumbers } },
            ],
        };
        if (direction)
            where.direction = direction;
        if (status)
            where.status = status;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.phoneCall.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: this.includeRelations,
            }),
            this.prisma.phoneCall.count({ where }),
        ]);
        return {
            data: this.filterSensitiveData(data, canAccessRecordings),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            canAccessRecordings,
        };
    }
    async getCallStats(tenantId, buyerId, callerId) {
        const where = { tenantId };
        if (buyerId)
            where.buyerId = buyerId;
        if (callerId)
            where.callerId = callerId;
        const [total, completed, missed, totalDuration] = await Promise.all([
            this.prisma.phoneCall.count({ where }),
            this.prisma.phoneCall.count({ where: { ...where, status: 'completed' } }),
            this.prisma.phoneCall.count({ where: { ...where, status: { in: ['missed', 'no_answer'] } } }),
            this.prisma.phoneCall.aggregate({
                where: { ...where, duration: { not: null } },
                _sum: { duration: true },
                _avg: { duration: true },
            }),
        ]);
        return {
            total,
            completed,
            missed,
            totalDuration: totalDuration._sum.duration || 0,
            averageDuration: Math.round(totalDuration._avg.duration || 0),
        };
    }
};
exports.PhoneCallsService = PhoneCallsService;
exports.PhoneCallsService = PhoneCallsService = PhoneCallsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], PhoneCallsService);
//# sourceMappingURL=phone-calls.service.js.map
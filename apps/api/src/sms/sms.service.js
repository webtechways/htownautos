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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const twilio_service_1 = require("../twilio/twilio.service");
const sms_events_service_1 = require("../presence/sms-events.service");
const create_sms_dto_1 = require("./dto/create-sms.dto");
const common_2 = require("@htownautos/common");
let SmsService = SmsService_1 = class SmsService {
    prisma;
    twilioService;
    smsEventsService;
    logger = new common_1.Logger(SmsService_1.name);
    constructor(prisma, twilioService, smsEventsService) {
        this.prisma = prisma;
        this.twilioService = twilioService;
        this.smsEventsService = smsEventsService;
    }
    includeRelations = {
        sender: {
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
    };
    toSmsEvent(sms) {
        return {
            id: sms.id,
            tenantId: sms.tenantId,
            direction: sms.direction,
            status: sms.status,
            fromNumber: sms.fromNumber,
            toNumber: sms.toNumber,
            body: sms.body,
            messageSid: sms.messageSid,
            errorCode: sms.errorCode,
            errorMessage: sms.errorMessage,
            mediaUrls: sms.mediaUrls,
            numMedia: sms.numMedia,
            isRead: sms.isRead,
            buyerId: sms.buyerId,
            senderId: sms.senderId,
            sentAt: sms.sentAt?.toISOString() || null,
            deliveredAt: sms.deliveredAt?.toISOString() || null,
            createdAt: sms.createdAt?.toISOString() || new Date().toISOString(),
            sender: sms.sender
                ? {
                    id: sms.sender.id,
                    user: {
                        id: sms.sender.user.id,
                        firstName: sms.sender.user.firstName,
                        lastName: sms.sender.user.lastName,
                        email: sms.sender.user.email,
                    },
                }
                : null,
            buyer: sms.buyer
                ? {
                    id: sms.buyer.id,
                    firstName: sms.buyer.firstName,
                    lastName: sms.buyer.lastName,
                    phoneMain: sms.buyer.phoneMain,
                    phoneMobile: sms.buyer.phoneMobile,
                }
                : null,
        };
    }
    async sendSms(tenantId, senderId, dto) {
        this.logger.log(`Sending SMS to buyer ${dto.buyerId} from tenant ${tenantId}`);
        const buyer = await this.prisma.buyer.findFirst({
            where: { id: dto.buyerId, tenantId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phoneMain: true,
                phoneMobile: true,
            },
        });
        if (!buyer) {
            throw new common_1.NotFoundException('Buyer not found in this tenant');
        }
        const toNumber = dto.toNumber
            ? (0, common_2.normalizePhoneNumber)(dto.toNumber)
            : (0, common_2.normalizePhoneNumber)(buyer.phoneMobile || buyer.phoneMain || '');
        if (!toNumber) {
            throw new common_1.BadRequestException('No phone number available for this buyer');
        }
        let fromPhoneNumber = null;
        if (dto.fromPhoneNumberId) {
            fromPhoneNumber = await this.prisma.twilioPhoneNumber.findFirst({
                where: { id: dto.fromPhoneNumberId, tenantId, canSms: true },
                select: { id: true, phoneNumber: true, twilioSid: true },
            });
        }
        if (!fromPhoneNumber) {
            fromPhoneNumber = await this.prisma.twilioPhoneNumber.findFirst({
                where: { tenantId, canSms: true },
                orderBy: { isPrimary: 'desc' },
                select: { id: true, phoneNumber: true, twilioSid: true },
            });
        }
        if (!fromPhoneNumber) {
            throw new common_1.BadRequestException('No SMS-enabled phone number available for this tenant');
        }
        const baseUrl = process.env.API_BASE_URL || 'https://api.htownautos.com';
        const statusCallback = `${baseUrl}/api/v1/twilio/sms/incoming/${tenantId}/${fromPhoneNumber.id}/status`;
        const smsMessage = await this.prisma.smsMessage.create({
            data: {
                tenantId,
                senderId,
                buyerId: dto.buyerId,
                direction: create_sms_dto_1.SmsDirection.OUTBOUND,
                status: create_sms_dto_1.SmsStatus.QUEUED,
                phoneNumber: toNumber,
                fromNumber: fromPhoneNumber.phoneNumber,
                toNumber,
                body: dto.body,
                sentAt: new Date(),
            },
            include: this.includeRelations,
        });
        this.smsEventsService.emitSmsCreated(this.toSmsEvent(smsMessage));
        try {
            const result = await this.twilioService.sendSms({
                to: toNumber,
                body: dto.body,
                from: fromPhoneNumber.phoneNumber,
                statusCallback,
            });
            const updatedSms = await this.prisma.smsMessage.update({
                where: { id: smsMessage.id },
                data: {
                    messageSid: result.sid,
                    status: result.status === 'queued' ? create_sms_dto_1.SmsStatus.QUEUED : create_sms_dto_1.SmsStatus.SENT,
                },
                include: this.includeRelations,
            });
            this.logger.log(`SMS sent successfully: ${result.sid}`);
            this.smsEventsService.emitSmsUpdated(this.toSmsEvent(updatedSms));
            return updatedSms;
        }
        catch (error) {
            const failedSms = await this.prisma.smsMessage.update({
                where: { id: smsMessage.id },
                data: {
                    status: create_sms_dto_1.SmsStatus.FAILED,
                    errorMessage: error.message,
                },
                include: this.includeRelations,
            });
            this.logger.error(`Failed to send SMS: ${error.message}`);
            this.smsEventsService.emitSmsUpdated(this.toSmsEvent(failedSms));
            throw new common_1.BadRequestException(`Failed to send SMS: ${error.message}`);
        }
    }
    async handleIncomingSms(tenantId, phoneNumberId, payload) {
        this.logger.log(`Handling incoming SMS for tenant ${tenantId}: ${payload.MessageSid}`);
        const fromNumber = (0, common_2.normalizePhoneNumber)(payload.From) || payload.From;
        const toNumber = (0, common_2.normalizePhoneNumber)(payload.To) || payload.To;
        const buyer = await this.findBuyerByPhone(tenantId, fromNumber);
        if (!buyer) {
            this.logger.warn(`No buyer found for phone ${fromNumber} in tenant ${tenantId}`);
            return null;
        }
        const smsMessage = await this.prisma.smsMessage.create({
            data: {
                tenantId,
                buyerId: buyer.id,
                direction: create_sms_dto_1.SmsDirection.INBOUND,
                status: create_sms_dto_1.SmsStatus.RECEIVED,
                phoneNumber: fromNumber,
                fromNumber,
                toNumber,
                body: payload.Body,
                messageSid: payload.MessageSid,
                numMedia: parseInt(payload.NumMedia || '0', 10),
                segmentCount: parseInt(payload.NumSegments || '1', 10),
                isRead: false,
            },
            include: this.includeRelations,
        });
        this.logger.log(`Incoming SMS stored: ${smsMessage.id}`);
        this.smsEventsService.emitSmsCreated(this.toSmsEvent(smsMessage));
        return smsMessage;
    }
    async handleSmsStatusUpdate(tenantId, payload) {
        this.logger.log(`SMS status update: ${payload.MessageSid} -> ${payload.MessageStatus}`);
        const smsMessage = await this.prisma.smsMessage.findFirst({
            where: { messageSid: payload.MessageSid, tenantId },
        });
        if (!smsMessage) {
            this.logger.warn(`SMS message not found for SID: ${payload.MessageSid}`);
            return null;
        }
        let status = smsMessage.status;
        switch (payload.MessageStatus) {
            case 'queued':
                status = create_sms_dto_1.SmsStatus.QUEUED;
                break;
            case 'sent':
                status = create_sms_dto_1.SmsStatus.SENT;
                break;
            case 'delivered':
                status = create_sms_dto_1.SmsStatus.DELIVERED;
                break;
            case 'failed':
            case 'undelivered':
                status = create_sms_dto_1.SmsStatus.FAILED;
                break;
        }
        const updated = await this.prisma.smsMessage.update({
            where: { id: smsMessage.id },
            data: {
                status,
                deliveredAt: payload.MessageStatus === 'delivered' ? new Date() : smsMessage.deliveredAt,
                errorCode: payload.ErrorCode || smsMessage.errorCode,
                errorMessage: payload.ErrorMessage || smsMessage.errorMessage,
            },
            include: this.includeRelations,
        });
        this.smsEventsService.emitSmsUpdated(this.toSmsEvent(updated));
        return updated;
    }
    async findBuyerByPhone(tenantId, phoneNumber) {
        const normalized = (0, common_2.normalizePhoneNumber)(phoneNumber) || phoneNumber;
        const digits = normalized.replace(/\D/g, '');
        let buyer = await this.prisma.buyer.findFirst({
            where: {
                tenantId,
                OR: [
                    { phoneMain: normalized },
                    { phoneMobile: normalized },
                    { phoneSecondary: normalized },
                ],
            },
        });
        if (!buyer && digits.length >= 10) {
            const lastTen = digits.slice(-10);
            buyer = await this.prisma.buyer.findFirst({
                where: {
                    tenantId,
                    OR: [
                        { phoneMain: { contains: lastTen } },
                        { phoneMobile: { contains: lastTen } },
                        { phoneSecondary: { contains: lastTen } },
                    ],
                },
            });
        }
        return buyer;
    }
    async create(tenantId, createSmsDto, senderId) {
        const buyer = await this.prisma.buyer.findFirst({
            where: { id: createSmsDto.buyerId, tenantId },
        });
        if (!buyer) {
            throw new common_1.NotFoundException('Buyer not found in this tenant');
        }
        const smsMessage = await this.prisma.smsMessage.create({
            data: {
                tenantId,
                senderId,
                buyerId: createSmsDto.buyerId,
                direction: createSmsDto.direction,
                status: createSmsDto.status || create_sms_dto_1.SmsStatus.SENT,
                phoneNumber: createSmsDto.phoneNumber,
                fromNumber: createSmsDto.fromNumber,
                toNumber: createSmsDto.toNumber,
                body: createSmsDto.body,
                messageSid: createSmsDto.messageSid,
                errorCode: createSmsDto.errorCode,
                errorMessage: createSmsDto.errorMessage,
                mediaUrls: createSmsDto.mediaUrls,
                numMedia: createSmsDto.numMedia || 0,
                price: createSmsDto.price,
                priceUnit: createSmsDto.priceUnit,
                segmentCount: createSmsDto.segmentCount || 1,
                isRead: createSmsDto.isRead || false,
                sentAt: createSmsDto.sentAt ? new Date(createSmsDto.sentAt) : null,
                deliveredAt: createSmsDto.deliveredAt ? new Date(createSmsDto.deliveredAt) : null,
            },
            include: this.includeRelations,
        });
        this.smsEventsService.emitSmsCreated(this.toSmsEvent(smsMessage));
        return smsMessage;
    }
    async findAll(tenantId, query) {
        const { buyerId, senderId, direction, status, isRead, fromDate, toDate, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const where = { tenantId };
        if (buyerId)
            where.buyerId = buyerId;
        if (senderId)
            where.senderId = senderId;
        if (direction)
            where.direction = direction;
        if (status)
            where.status = status;
        if (isRead !== undefined)
            where.isRead = isRead;
        if (fromDate || toDate) {
            where.createdAt = {};
            if (fromDate)
                where.createdAt.gte = new Date(fromDate);
            if (toDate)
                where.createdAt.lte = new Date(toDate);
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.smsMessage.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: this.includeRelations,
            }),
            this.prisma.smsMessage.count({ where }),
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
        const smsMessage = await this.prisma.smsMessage.findFirst({
            where: { id, tenantId },
            include: this.includeRelations,
        });
        if (!smsMessage) {
            throw new common_1.NotFoundException('SMS message not found');
        }
        return smsMessage;
    }
    async update(tenantId, id, updateSmsDto) {
        await this.findOne(tenantId, id);
        const data = {};
        if (updateSmsDto.direction !== undefined)
            data.direction = updateSmsDto.direction;
        if (updateSmsDto.status !== undefined)
            data.status = updateSmsDto.status;
        if (updateSmsDto.phoneNumber !== undefined)
            data.phoneNumber = updateSmsDto.phoneNumber;
        if (updateSmsDto.fromNumber !== undefined)
            data.fromNumber = updateSmsDto.fromNumber;
        if (updateSmsDto.toNumber !== undefined)
            data.toNumber = updateSmsDto.toNumber;
        if (updateSmsDto.body !== undefined)
            data.body = updateSmsDto.body;
        if (updateSmsDto.messageSid !== undefined)
            data.messageSid = updateSmsDto.messageSid;
        if (updateSmsDto.errorCode !== undefined)
            data.errorCode = updateSmsDto.errorCode;
        if (updateSmsDto.errorMessage !== undefined)
            data.errorMessage = updateSmsDto.errorMessage;
        if (updateSmsDto.mediaUrls !== undefined)
            data.mediaUrls = updateSmsDto.mediaUrls;
        if (updateSmsDto.numMedia !== undefined)
            data.numMedia = updateSmsDto.numMedia;
        if (updateSmsDto.price !== undefined)
            data.price = updateSmsDto.price;
        if (updateSmsDto.priceUnit !== undefined)
            data.priceUnit = updateSmsDto.priceUnit;
        if (updateSmsDto.segmentCount !== undefined)
            data.segmentCount = updateSmsDto.segmentCount;
        if (updateSmsDto.isRead !== undefined)
            data.isRead = updateSmsDto.isRead;
        if (updateSmsDto.sentAt !== undefined) {
            data.sentAt = updateSmsDto.sentAt ? new Date(updateSmsDto.sentAt) : null;
        }
        if (updateSmsDto.deliveredAt !== undefined) {
            data.deliveredAt = updateSmsDto.deliveredAt ? new Date(updateSmsDto.deliveredAt) : null;
        }
        const updated = await this.prisma.smsMessage.update({
            where: { id },
            data,
            include: this.includeRelations,
        });
        this.smsEventsService.emitSmsUpdated(this.toSmsEvent(updated));
        return updated;
    }
    async remove(tenantId, id) {
        const existing = await this.findOne(tenantId, id);
        await this.prisma.smsMessage.delete({ where: { id } });
        return { message: 'SMS message deleted successfully' };
    }
    async findByBuyer(tenantId, buyerId, query) {
        return this.findAll(tenantId, { ...query, buyerId });
    }
    async markAsRead(tenantId, id) {
        await this.findOne(tenantId, id);
        const updated = await this.prisma.smsMessage.update({
            where: { id },
            data: { isRead: true },
            include: this.includeRelations,
        });
        this.smsEventsService.emitSmsUpdated(this.toSmsEvent(updated));
        return updated;
    }
    async markAllAsRead(tenantId, buyerId) {
        const result = await this.prisma.smsMessage.updateMany({
            where: {
                tenantId,
                buyerId,
                isRead: false,
            },
            data: { isRead: true },
        });
        return { updated: result.count };
    }
    async getConversation(tenantId, buyerId, query) {
        return this.findAll(tenantId, {
            ...query,
            buyerId,
            sortBy: 'createdAt',
            sortOrder: 'asc',
        });
    }
    async getSmsStats(tenantId, buyerId, senderId) {
        const where = { tenantId };
        if (buyerId)
            where.buyerId = buyerId;
        if (senderId)
            where.senderId = senderId;
        const [total, sent, delivered, failed, unread] = await Promise.all([
            this.prisma.smsMessage.count({ where }),
            this.prisma.smsMessage.count({ where: { ...where, status: 'sent' } }),
            this.prisma.smsMessage.count({ where: { ...where, status: 'delivered' } }),
            this.prisma.smsMessage.count({ where: { ...where, status: { in: ['failed', 'undelivered'] } } }),
            this.prisma.smsMessage.count({ where: { ...where, isRead: false, direction: 'inbound' } }),
        ]);
        return { total, sent, delivered, failed, unread };
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => twilio_service_1.TwilioService))),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        twilio_service_1.TwilioService,
        sms_events_service_1.SmsEventsService])
], SmsService);
//# sourceMappingURL=sms.service.js.map
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
var PostmarkEventProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostmarkEventProcessor = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
const email_events_service_1 = require("../presence/email-events.service");
let PostmarkEventProcessor = PostmarkEventProcessor_1 = class PostmarkEventProcessor {
    prisma;
    emailEvents;
    s3;
    logger = new common_1.Logger(PostmarkEventProcessor_1.name);
    includeRelations = {
        sender: {
            include: {
                user: { select: { id: true, email: true, firstName: true, lastName: true, avatar: true } },
            },
        },
        buyer: {
            select: { id: true, firstName: true, lastName: true, email: true, phoneMain: true, phoneMobile: true },
        },
    };
    constructor(prisma, emailEvents, s3) {
        this.prisma = prisma;
        this.emailEvents = emailEvents;
        this.s3 = s3;
    }
    async process(event) {
        const messageId = event.MessageID;
        if (!messageId) {
            this.logger.warn(`Postmark event missing MessageID: ${JSON.stringify(event).slice(0, 200)}`);
            return;
        }
        const existing = await this.prisma.emailMessage.findFirst({
            where: { messageId },
            select: { id: true, tenantId: true, openCount: true, clickCount: true },
        });
        if (!existing) {
            this.logger.warn(`No EmailMessage found for messageId=${messageId} (${event.RecordType})`);
            return;
        }
        switch (event.RecordType) {
            case 'Bounce':
                await this.handleBounce(existing.id, event);
                break;
            case 'SpamComplaint':
                await this.handleComplaint(existing.id, event);
                break;
            case 'Delivery':
                await this.handleDelivery(existing.id, event);
                break;
            case 'Open':
                await this.handleOpen(existing.id, existing.openCount || 0, event);
                break;
            case 'Click':
                await this.handleClick(existing.id, existing.clickCount || 0, event);
                break;
            default:
                this.logger.debug(`Unhandled Postmark event type: ${event.RecordType}`);
        }
    }
    async handleBounce(id, event) {
        const bounceType = this.mapBounceType(event.Type);
        const updated = await this.prisma.emailMessage.update({
            where: { id },
            data: {
                status: 'bounced',
                sesStatus: event.Type,
                bounceType,
                bounceSubType: event.Name,
                bouncedAt: event.BouncedAt ? new Date(event.BouncedAt) : new Date(),
            },
            include: this.includeRelations,
        });
        await this.emitUpdated(updated);
    }
    async handleComplaint(id, event) {
        const updated = await this.prisma.emailMessage.update({
            where: { id },
            data: {
                status: 'bounced',
                complaintType: event.Type || 'spam',
                sesStatus: 'SpamComplaint',
            },
            include: this.includeRelations,
        });
        await this.emitUpdated(updated);
    }
    async handleDelivery(id, event) {
        const updated = await this.prisma.emailMessage.update({
            where: { id },
            data: {
                status: 'delivered',
                deliveredAt: event.DeliveredAt ? new Date(event.DeliveredAt) : new Date(),
            },
            include: this.includeRelations,
        });
        await this.emitUpdated(updated);
    }
    async handleOpen(id, currentCount, event) {
        const updated = await this.prisma.emailMessage.update({
            where: { id },
            data: {
                status: 'opened',
                openCount: currentCount + 1,
                lastOpenedAt: event.ReceivedAt ? new Date(event.ReceivedAt) : new Date(),
            },
            include: this.includeRelations,
        });
        if (currentCount === 0) {
            await this.emitUpdated(updated);
        }
    }
    async handleClick(id, currentCount, event) {
        const updated = await this.prisma.emailMessage.update({
            where: { id },
            data: {
                status: 'clicked',
                clickCount: currentCount + 1,
                lastClickedAt: event.ReceivedAt ? new Date(event.ReceivedAt) : new Date(),
            },
            include: this.includeRelations,
        });
        await this.emitUpdated(updated);
    }
    mapBounceType(postmarkType) {
        const t = (postmarkType || '').toLowerCase();
        if (t.includes('hard'))
            return 'hard';
        if (t.includes('transient'))
            return 'transient';
        if (t.includes('soft'))
            return 'soft';
        return 'soft';
    }
    async emitUpdated(record) {
        await this.s3.signAttachmentsOnRecords([record]);
        this.emailEvents.emitEmailUpdated({
            id: record.id,
            tenantId: record.tenantId,
            direction: record.direction,
            status: record.status,
            fromEmail: record.fromEmail,
            toEmail: record.toEmail,
            subject: record.subject,
            bodyHtml: record.bodyHtml,
            bodyText: record.bodyText,
            messageId: record.messageId,
            sesStatus: record.sesStatus,
            bounceType: record.bounceType,
            isRead: record.isRead,
            buyerId: record.buyerId,
            senderId: record.senderId,
            sentAt: record.sentAt?.toISOString() || null,
            deliveredAt: record.deliveredAt?.toISOString() || null,
            bouncedAt: record.bouncedAt?.toISOString() || null,
            createdAt: record.createdAt?.toISOString() || new Date().toISOString(),
            attachmentCount: record.attachmentCount || 0,
            attachments: record.attachments || null,
            sender: record.sender
                ? {
                    id: record.sender.id,
                    user: {
                        id: record.sender.user.id,
                        firstName: record.sender.user.firstName,
                        lastName: record.sender.user.lastName,
                        email: record.sender.user.email,
                    },
                }
                : null,
            buyer: record.buyer
                ? {
                    id: record.buyer.id,
                    firstName: record.buyer.firstName,
                    lastName: record.buyer.lastName,
                    email: record.buyer.email,
                }
                : null,
        });
    }
};
exports.PostmarkEventProcessor = PostmarkEventProcessor;
exports.PostmarkEventProcessor = PostmarkEventProcessor = PostmarkEventProcessor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        email_events_service_1.EmailEventsService,
        common_2.S3Service])
], PostmarkEventProcessor);
//# sourceMappingURL=postmark-event.processor.js.map
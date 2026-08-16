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
var EmailMessagesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailMessagesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const create_email_message_dto_1 = require("./dto/create-email-message.dto");
const postmark_service_1 = require("../postmark/postmark.service");
const tenant_email_domain_service_1 = require("../tenant/tenant-email-domain.service");
const email_events_service_1 = require("../presence/email-events.service");
const common_2 = require("@htownautos/common");
let EmailMessagesService = EmailMessagesService_1 = class EmailMessagesService {
    prisma;
    postmarkService;
    tenantEmailDomainService;
    emailEventsService;
    s3;
    logger = new common_1.Logger(EmailMessagesService_1.name);
    constructor(prisma, postmarkService, tenantEmailDomainService, emailEventsService, s3) {
        this.prisma = prisma;
        this.postmarkService = postmarkService;
        this.tenantEmailDomainService = tenantEmailDomainService;
        this.emailEventsService = emailEventsService;
        this.s3 = s3;
    }
    async getAttachmentDownloadUrl(tenantId, emailId, key, expiresInSeconds = 300) {
        const email = await this.prisma.emailMessage.findFirst({
            where: { id: emailId, tenantId },
            select: { attachments: true },
        });
        if (!email) {
            throw new common_1.NotFoundException('Email message not found');
        }
        const attachments = Array.isArray(email.attachments)
            ? email.attachments
            : [];
        const match = attachments.find((a) => a && typeof a === 'object' && a.key === key);
        if (!match || !match.key) {
            throw new common_1.NotFoundException('Attachment not found on this email');
        }
        const url = await this.s3.getSignedUrl(match.key, expiresInSeconds);
        return { url, name: match.name, mimeType: match.mimeType };
    }
    async uploadOutboundAttachments(tenantId, attachments) {
        if (!attachments?.length)
            return [];
        const stored = [];
        for (const att of attachments) {
            try {
                const base64 = att.content.includes('base64,')
                    ? att.content.slice(att.content.indexOf('base64,') + 'base64,'.length)
                    : att.content;
                const buffer = Buffer.from(base64, 'base64');
                const ext = (att.filename?.split('.').pop() || 'bin').toLowerCase();
                const result = await this.s3.uploadBuffer(buffer, `email-attachments/${tenantId}/outbound`, ext, att.contentType || 'application/octet-stream');
                stored.push({
                    name: att.filename,
                    mimeType: att.contentType,
                    size: att.size || buffer.length,
                    url: result.url,
                    key: result.key,
                });
            }
            catch (err) {
                this.logger.error(`Failed to upload outbound attachment "${att.filename}": ${err?.message}`);
                stored.push({
                    name: att.filename,
                    mimeType: att.contentType,
                    size: att.size || 0,
                    url: '',
                    key: '',
                });
            }
        }
        return stored;
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
    async emitCreated(record) {
        await this.s3.signAttachmentsOnRecords([record]);
        this.emailEventsService.emitEmailCreated(this.toEmailEvent(record));
    }
    async emitUpdated(record) {
        await this.s3.signAttachmentsOnRecords([record]);
        this.emailEventsService.emitEmailUpdated(this.toEmailEvent(record));
    }
    toEmailEvent(record) {
        return {
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
        };
    }
    async sendToBuyer(tenantId, senderId, buyerId, dto) {
        this.logger.log(`Sending email to buyer ${buyerId} from tenant ${tenantId}`);
        if (!dto.subject?.trim()) {
            throw new common_1.BadRequestException('Subject is required');
        }
        if (!dto.bodyHtml?.trim()) {
            throw new common_1.BadRequestException('Body is required');
        }
        const buyer = await this.prisma.buyer.findFirst({
            where: { id: buyerId, tenantId },
            select: { id: true, email: true, firstName: true, lastName: true },
        });
        if (!buyer) {
            throw new common_1.NotFoundException('Buyer not found in this tenant');
        }
        if (!buyer.email) {
            throw new common_1.BadRequestException('Buyer does not have an email address');
        }
        let tenantUser = await this.prisma.tenantUser.findFirst({
            where: { id: senderId, tenantId },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true } },
                tenant: { select: { id: true, name: true, subdomain: true } },
            },
        });
        if (!tenantUser) {
            throw new common_1.BadRequestException('Sender is not a member of this tenant');
        }
        if (!tenantUser.tenantEmail || !tenantUser.username) {
            if (!tenantUser.tenant?.subdomain) {
                throw new common_1.BadRequestException('Tenant has no subdomain configured; cannot derive sender email');
            }
            const identity = await (0, common_2.resolveTenantUserIdentity)(this.prisma, tenantId, {
                email: tenantUser.user.email,
                firstName: tenantUser.user.firstName,
                lastName: tenantUser.user.lastName,
            }, tenantUser.tenant.subdomain, tenantUser.id);
            const patched = await this.prisma.tenantUser.update({
                where: { id: tenantUser.id },
                data: {
                    username: tenantUser.username || identity.username,
                    tenantEmail: tenantUser.tenantEmail || identity.tenantEmail,
                },
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true } },
                    tenant: { select: { id: true, name: true, subdomain: true } },
                },
            });
            this.logger.log(`Self-healed TenantUser ${tenantUser.id}: ${patched.tenantEmail}`);
            tenantUser = patched;
        }
        if (!tenantUser.tenantEmail) {
            throw new common_1.BadRequestException('Sender does not have a tenantEmail configured; cannot send from this account');
        }
        const provisionedTenant = await this.tenantEmailDomainService.ensureProvisioned(tenantId);
        if (!provisionedTenant.postmarkServerToken) {
            throw new common_1.BadRequestException('Tenant is missing a Postmark server token; provisioning did not complete');
        }
        const fromName = [tenantUser.user.firstName, tenantUser.user.lastName]
            .filter(Boolean)
            .join(' ')
            .trim() || tenantUser.tenant?.name || undefined;
        const fromEmail = tenantUser.tenantEmail;
        const replyTo = tenantUser.tenantEmail;
        const subject = dto.subject.trim();
        const bodyText = dto.bodyText?.trim() || this.htmlToText(dto.bodyHtml);
        const uploadedAttachments = await this.uploadOutboundAttachments(tenantId, dto.attachments);
        const attachmentMetadata = uploadedAttachments;
        let record = await this.prisma.emailMessage.create({
            data: {
                tenantId,
                senderId,
                buyerId,
                direction: create_email_message_dto_1.EmailDirection.OUTBOUND,
                status: create_email_message_dto_1.EmailStatus.QUEUED,
                fromEmail,
                toEmail: buyer.email,
                replyTo,
                subject,
                bodyHtml: dto.bodyHtml,
                bodyText,
                attachments: attachmentMetadata,
                attachmentCount: dto.attachments?.length || 0,
            },
            include: this.includeRelations,
        });
        await this.emitCreated(record);
        const attachments = dto.attachments?.map((a) => ({
            filename: a.filename,
            contentType: a.contentType,
            content: a.content,
        }));
        const result = await this.postmarkService.sendEmailWithToken(provisionedTenant.postmarkServerToken, {
            from: this.formatSender(fromName, fromEmail),
            to: buyer.email,
            subject,
            htmlBody: dto.bodyHtml,
            textBody: bodyText,
            replyTo,
            attachments,
            tag: 'buyer-outbound',
            metadata: { tenantId, buyerId, senderId },
        });
        if (result.success) {
            record = await this.prisma.emailMessage.update({
                where: { id: record.id },
                data: {
                    status: create_email_message_dto_1.EmailStatus.SENT,
                    messageId: result.messageId,
                    sentAt: new Date(),
                },
                include: this.includeRelations,
            });
            await this.emitUpdated(record);
            return record;
        }
        record = await this.prisma.emailMessage.update({
            where: { id: record.id },
            data: {
                status: create_email_message_dto_1.EmailStatus.FAILED,
                sesStatus: result.errorMessage?.slice(0, 255) || null,
            },
            include: this.includeRelations,
        });
        await this.emitUpdated(record);
        throw new common_1.BadRequestException(`Failed to send email: ${result.errorMessage || 'Unknown error'}`);
    }
    formatSender(displayName, email) {
        if (!displayName)
            return email;
        const hasNonAscii = /[^\x20-\x7E]/.test(displayName);
        if (hasNonAscii) {
            const encoded = `=?UTF-8?B?${Buffer.from(displayName, 'utf8').toString('base64')}?=`;
            return `${encoded} <${email}>`;
        }
        const safe = displayName.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        return `"${safe}" <${email}>`;
    }
    htmlToText(html) {
        return (html || '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }
    async create(tenantId, createEmailMessageDto, senderId) {
        const buyer = await this.prisma.buyer.findFirst({
            where: {
                id: createEmailMessageDto.buyerId,
                tenantId,
            },
        });
        if (!buyer) {
            throw new common_1.NotFoundException('Buyer not found in this tenant');
        }
        const record = await this.prisma.emailMessage.create({
            data: {
                tenantId,
                senderId,
                buyerId: createEmailMessageDto.buyerId,
                direction: createEmailMessageDto.direction,
                status: createEmailMessageDto.status || create_email_message_dto_1.EmailStatus.SENT,
                fromEmail: createEmailMessageDto.fromEmail,
                toEmail: createEmailMessageDto.toEmail,
                replyTo: createEmailMessageDto.replyTo,
                ccEmails: createEmailMessageDto.ccEmails,
                bccEmails: createEmailMessageDto.bccEmails,
                subject: createEmailMessageDto.subject,
                bodyHtml: createEmailMessageDto.bodyHtml,
                bodyText: createEmailMessageDto.bodyText,
                threadId: createEmailMessageDto.threadId,
                inReplyTo: createEmailMessageDto.inReplyTo,
                references: createEmailMessageDto.references,
                attachments: createEmailMessageDto.attachments,
                attachmentCount: createEmailMessageDto.attachmentCount || 0,
                messageId: createEmailMessageDto.messageId,
                sesStatus: createEmailMessageDto.sesStatus,
                bounceType: createEmailMessageDto.bounceType,
                bounceSubType: createEmailMessageDto.bounceSubType,
                complaintType: createEmailMessageDto.complaintType,
                isRead: createEmailMessageDto.isRead || false,
                openCount: createEmailMessageDto.openCount || 0,
                clickCount: createEmailMessageDto.clickCount || 0,
                priority: createEmailMessageDto.priority,
                labels: createEmailMessageDto.labels,
                scheduledAt: createEmailMessageDto.scheduledAt ? new Date(createEmailMessageDto.scheduledAt) : null,
                sentAt: createEmailMessageDto.sentAt ? new Date(createEmailMessageDto.sentAt) : null,
                deliveredAt: createEmailMessageDto.deliveredAt ? new Date(createEmailMessageDto.deliveredAt) : null,
                bouncedAt: createEmailMessageDto.bouncedAt ? new Date(createEmailMessageDto.bouncedAt) : null,
            },
            include: this.includeRelations,
        });
        return record;
    }
    async findAll(tenantId, query) {
        const { buyerId, senderId, direction, status, priority, isRead, threadId, search, fromDate, toDate, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', } = query;
        const where = {
            tenantId,
        };
        if (buyerId)
            where.buyerId = buyerId;
        if (senderId)
            where.senderId = senderId;
        if (direction)
            where.direction = direction;
        if (status)
            where.status = status;
        if (priority)
            where.priority = priority;
        if (isRead !== undefined)
            where.isRead = isRead;
        if (threadId)
            where.threadId = threadId;
        if (search) {
            where.subject = { contains: search, mode: 'insensitive' };
        }
        if (fromDate || toDate) {
            where.createdAt = {};
            if (fromDate)
                where.createdAt.gte = new Date(fromDate);
            if (toDate)
                where.createdAt.lte = new Date(toDate);
        }
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.emailMessage.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: this.includeRelations,
            }),
            this.prisma.emailMessage.count({ where }),
        ]);
        await this.s3.signAttachmentsOnRecords(data);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(tenantId, id) {
        const emailMessage = await this.prisma.emailMessage.findFirst({
            where: { id, tenantId },
            include: this.includeRelations,
        });
        if (!emailMessage) {
            throw new common_1.NotFoundException('Email message not found');
        }
        await this.s3.signAttachmentsOnRecords([emailMessage]);
        return emailMessage;
    }
    async update(tenantId, id, updateEmailMessageDto) {
        await this.findOne(tenantId, id);
        const data = {};
        if (updateEmailMessageDto.direction !== undefined)
            data.direction = updateEmailMessageDto.direction;
        if (updateEmailMessageDto.status !== undefined)
            data.status = updateEmailMessageDto.status;
        if (updateEmailMessageDto.fromEmail !== undefined)
            data.fromEmail = updateEmailMessageDto.fromEmail;
        if (updateEmailMessageDto.toEmail !== undefined)
            data.toEmail = updateEmailMessageDto.toEmail;
        if (updateEmailMessageDto.replyTo !== undefined)
            data.replyTo = updateEmailMessageDto.replyTo;
        if (updateEmailMessageDto.ccEmails !== undefined)
            data.ccEmails = updateEmailMessageDto.ccEmails;
        if (updateEmailMessageDto.bccEmails !== undefined)
            data.bccEmails = updateEmailMessageDto.bccEmails;
        if (updateEmailMessageDto.subject !== undefined)
            data.subject = updateEmailMessageDto.subject;
        if (updateEmailMessageDto.bodyHtml !== undefined)
            data.bodyHtml = updateEmailMessageDto.bodyHtml;
        if (updateEmailMessageDto.bodyText !== undefined)
            data.bodyText = updateEmailMessageDto.bodyText;
        if (updateEmailMessageDto.threadId !== undefined)
            data.threadId = updateEmailMessageDto.threadId;
        if (updateEmailMessageDto.inReplyTo !== undefined)
            data.inReplyTo = updateEmailMessageDto.inReplyTo;
        if (updateEmailMessageDto.references !== undefined)
            data.references = updateEmailMessageDto.references;
        if (updateEmailMessageDto.attachments !== undefined)
            data.attachments = updateEmailMessageDto.attachments;
        if (updateEmailMessageDto.attachmentCount !== undefined)
            data.attachmentCount = updateEmailMessageDto.attachmentCount;
        if (updateEmailMessageDto.messageId !== undefined)
            data.messageId = updateEmailMessageDto.messageId;
        if (updateEmailMessageDto.sesStatus !== undefined)
            data.sesStatus = updateEmailMessageDto.sesStatus;
        if (updateEmailMessageDto.bounceType !== undefined)
            data.bounceType = updateEmailMessageDto.bounceType;
        if (updateEmailMessageDto.bounceSubType !== undefined)
            data.bounceSubType = updateEmailMessageDto.bounceSubType;
        if (updateEmailMessageDto.complaintType !== undefined)
            data.complaintType = updateEmailMessageDto.complaintType;
        if (updateEmailMessageDto.isRead !== undefined)
            data.isRead = updateEmailMessageDto.isRead;
        if (updateEmailMessageDto.openCount !== undefined)
            data.openCount = updateEmailMessageDto.openCount;
        if (updateEmailMessageDto.clickCount !== undefined)
            data.clickCount = updateEmailMessageDto.clickCount;
        if (updateEmailMessageDto.priority !== undefined)
            data.priority = updateEmailMessageDto.priority;
        if (updateEmailMessageDto.labels !== undefined)
            data.labels = updateEmailMessageDto.labels;
        if (updateEmailMessageDto.scheduledAt !== undefined) {
            data.scheduledAt = updateEmailMessageDto.scheduledAt ? new Date(updateEmailMessageDto.scheduledAt) : null;
        }
        if (updateEmailMessageDto.sentAt !== undefined) {
            data.sentAt = updateEmailMessageDto.sentAt ? new Date(updateEmailMessageDto.sentAt) : null;
        }
        if (updateEmailMessageDto.deliveredAt !== undefined) {
            data.deliveredAt = updateEmailMessageDto.deliveredAt ? new Date(updateEmailMessageDto.deliveredAt) : null;
        }
        if (updateEmailMessageDto.bouncedAt !== undefined) {
            data.bouncedAt = updateEmailMessageDto.bouncedAt ? new Date(updateEmailMessageDto.bouncedAt) : null;
        }
        const record = await this.prisma.emailMessage.update({
            where: { id },
            data,
            include: this.includeRelations,
        });
        return record;
    }
    async remove(tenantId, id) {
        const existing = await this.findOne(tenantId, id);
        await this.prisma.emailMessage.delete({ where: { id } });
        return { message: 'Email message deleted successfully' };
    }
    async findByBuyer(tenantId, buyerId, query) {
        return this.findAll(tenantId, { ...query, buyerId });
    }
    async markAsRead(tenantId, id) {
        await this.findOne(tenantId, id);
        return this.prisma.emailMessage.update({
            where: { id },
            data: { isRead: true, readAt: new Date() },
            include: this.includeRelations,
        });
    }
    async markAllAsRead(tenantId, buyerId) {
        const result = await this.prisma.emailMessage.updateMany({
            where: {
                tenantId,
                buyerId,
                isRead: false,
            },
            data: { isRead: true, readAt: new Date() },
        });
        return { updated: result.count };
    }
    async getThread(tenantId, threadId, query) {
        return this.findAll(tenantId, {
            ...query,
            threadId,
            sortBy: 'createdAt',
            sortOrder: 'asc',
        });
    }
    async trackOpen(tenantId, id) {
        const email = await this.findOne(tenantId, id);
        return this.prisma.emailMessage.update({
            where: { id },
            data: {
                openCount: email.openCount + 1,
                lastOpenedAt: new Date(),
                status: 'opened',
            },
            include: this.includeRelations,
        });
    }
    async trackClick(tenantId, id) {
        const email = await this.findOne(tenantId, id);
        return this.prisma.emailMessage.update({
            where: { id },
            data: {
                clickCount: email.clickCount + 1,
                lastClickedAt: new Date(),
                status: 'clicked',
            },
            include: this.includeRelations,
        });
    }
    async getEmailStats(tenantId, buyerId, senderId) {
        const where = { tenantId };
        if (buyerId)
            where.buyerId = buyerId;
        if (senderId)
            where.senderId = senderId;
        const [total, sent, delivered, opened, bounced, unread] = await Promise.all([
            this.prisma.emailMessage.count({ where }),
            this.prisma.emailMessage.count({ where: { ...where, status: 'sent' } }),
            this.prisma.emailMessage.count({ where: { ...where, status: 'delivered' } }),
            this.prisma.emailMessage.count({ where: { ...where, status: { in: ['opened', 'clicked'] } } }),
            this.prisma.emailMessage.count({ where: { ...where, status: 'bounced' } }),
            this.prisma.emailMessage.count({ where: { ...where, isRead: false, direction: 'inbound' } }),
        ]);
        return {
            total,
            sent,
            delivered,
            opened,
            bounced,
            unread,
            openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
        };
    }
};
exports.EmailMessagesService = EmailMessagesService;
exports.EmailMessagesService = EmailMessagesService = EmailMessagesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        postmark_service_1.PostmarkService,
        tenant_email_domain_service_1.TenantEmailDomainService,
        email_events_service_1.EmailEventsService,
        common_2.S3Service])
], EmailMessagesService);
//# sourceMappingURL=email-messages.service.js.map
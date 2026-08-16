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
var PostmarkInboundProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostmarkInboundProcessor = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
const email_events_service_1 = require("../presence/email-events.service");
let PostmarkInboundProcessor = PostmarkInboundProcessor_1 = class PostmarkInboundProcessor {
    prisma;
    emailEvents;
    s3;
    logger = new common_1.Logger(PostmarkInboundProcessor_1.name);
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
    async uploadAttachments(tenantId, attachments) {
        if (!attachments || attachments.length === 0)
            return [];
        const stored = [];
        for (const att of attachments) {
            try {
                const buffer = Buffer.from(att.Content, 'base64');
                const ext = (att.Name?.split('.').pop() || 'bin').toLowerCase();
                const result = await this.s3.uploadBuffer(buffer, `email-attachments/${tenantId}/inbound`, ext, att.ContentType || 'application/octet-stream');
                stored.push({
                    name: att.Name,
                    mimeType: att.ContentType,
                    size: att.ContentLength ?? buffer.length,
                    url: result.url,
                    key: result.key,
                    contentId: att.ContentID || null,
                });
            }
            catch (err) {
                this.logger.error(`Failed to upload inbound attachment "${att.Name}": ${err?.message}`);
                stored.push({
                    name: att.Name,
                    mimeType: att.ContentType,
                    size: att.ContentLength ?? 0,
                    url: '',
                    key: '',
                    contentId: att.ContentID || null,
                });
            }
        }
        return stored;
    }
    async process(payload) {
        const toAddress = payload.ToFull?.[0]?.Email || payload.OriginalRecipient || payload.To;
        const recipient = this.parseEmail(toAddress);
        if (!recipient) {
            this.logger.warn(`Inbound email missing recipient address; dropping. Subject="${payload.Subject}"`);
            return;
        }
        const subdomain = this.extractTenantSubdomain(recipient);
        if (!subdomain) {
            this.logger.warn(`Could not extract tenant subdomain from ${recipient}; dropping`);
            return;
        }
        const tenant = await this.prisma.tenant.findFirst({
            where: { subdomain, deletedAt: null },
            select: { id: true, subdomain: true },
        });
        if (!tenant) {
            this.logger.warn(`Inbound email for unknown subdomain "${subdomain}"; dropping`);
            return;
        }
        if (payload.MessageID) {
            const existing = await this.prisma.emailMessage.findFirst({
                where: { messageId: payload.MessageID, tenantId: tenant.id },
                select: { id: true },
            });
            if (existing) {
                this.logger.debug(`Duplicate inbound message ${payload.MessageID}; already processed`);
                return;
            }
        }
        const senderEmail = (payload.FromFull?.Email || payload.From || '').toLowerCase().trim();
        if (!senderEmail) {
            this.logger.warn('Inbound email with no sender; dropping');
            return;
        }
        const buyer = await this.prisma.buyer.findFirst({
            where: {
                tenantId: tenant.id,
                email: { equals: senderEmail, mode: 'insensitive' },
            },
            select: { id: true },
        });
        const attachmentsMeta = await this.uploadAttachments(tenant.id, payload.Attachments);
        const threadId = this.findThreadId(payload);
        if (!buyer) {
            try {
                await this.prisma.unmatchedInboundEmail.create({
                    data: {
                        tenantId: tenant.id,
                        fromEmail: senderEmail,
                        fromName: payload.FromFull?.Name || payload.FromName || null,
                        toEmail: recipient,
                        subject: payload.Subject || '(no subject)',
                        bodyHtml: payload.HtmlBody || null,
                        bodyText: payload.TextBody || null,
                        messageId: payload.MessageID || null,
                        headers: (payload.Headers || []),
                        attachments: attachmentsMeta,
                        rawPayload: payload,
                    },
                });
                this.logger.log(`Parked unmatched inbound email from ${senderEmail} to ${recipient}`);
            }
            catch (err) {
                if (err?.code !== 'P2002')
                    throw err;
            }
            return;
        }
        const record = await this.prisma.emailMessage.create({
            data: {
                tenantId: tenant.id,
                senderId: null,
                buyerId: buyer.id,
                direction: 'inbound',
                status: 'delivered',
                fromEmail: senderEmail,
                toEmail: recipient,
                replyTo: payload.ReplyTo || null,
                subject: payload.Subject || '(no subject)',
                bodyHtml: payload.HtmlBody || null,
                bodyText: payload.TextBody || null,
                messageId: payload.MessageID || null,
                threadId,
                inReplyTo: this.getHeaderValue(payload, 'In-Reply-To'),
                references: this.parseReferences(this.getHeaderValue(payload, 'References')),
                attachments: attachmentsMeta,
                attachmentCount: attachmentsMeta.length,
                isRead: false,
            },
            include: this.includeRelations,
        });
        await this.emitCreated(record);
        this.logger.log(`Inbound email recorded: ${record.id} from ${senderEmail} to ${recipient}`);
    }
    parseEmail(value) {
        if (!value)
            return null;
        const match = value.match(/<([^>]+)>/);
        const email = (match ? match[1] : value).trim().toLowerCase();
        return email.includes('@') ? email : null;
    }
    extractTenantSubdomain(email) {
        const atIdx = email.indexOf('@');
        if (atIdx < 0)
            return null;
        const host = email.slice(atIdx + 1);
        const parts = host.split('.');
        if (parts.length < 3)
            return null;
        return parts[0] || null;
    }
    getHeaderValue(payload, name) {
        const target = name.toLowerCase();
        const h = payload.Headers?.find((h) => h.Name?.toLowerCase() === target);
        return h?.Value || null;
    }
    parseReferences(value) {
        if (!value)
            return undefined;
        return value.split(/\s+/).filter(Boolean);
    }
    findThreadId(payload) {
        const inReplyTo = this.getHeaderValue(payload, 'In-Reply-To');
        if (inReplyTo)
            return inReplyTo.replace(/[<>]/g, '');
        const refs = this.getHeaderValue(payload, 'References');
        if (refs) {
            const first = refs.split(/\s+/).find(Boolean);
            if (first)
                return first.replace(/[<>]/g, '');
        }
        return null;
    }
    async emitCreated(record) {
        await this.s3.signAttachmentsOnRecords([record]);
        this.emailEvents.emitEmailCreated({
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
exports.PostmarkInboundProcessor = PostmarkInboundProcessor;
exports.PostmarkInboundProcessor = PostmarkInboundProcessor = PostmarkInboundProcessor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        email_events_service_1.EmailEventsService,
        common_2.S3Service])
], PostmarkInboundProcessor);
//# sourceMappingURL=postmark-inbound.processor.js.map
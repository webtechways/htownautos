import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
import { CreateEmailMessageDto, UpdateEmailMessageDto, EmailStatus, EmailDirection } from './dto/create-email-message.dto';
import { QueryEmailMessageDto } from './dto/query-email-message.dto';
import { Prisma } from '@prisma/client';
import { PostmarkService, PostmarkAttachmentInput } from '../postmark/postmark.service';
import { TenantEmailDomainService } from '../tenant/tenant-email-domain.service';
import { EmailEventsService, EmailEvent } from '../presence/email-events.service';
import { resolveTenantUserIdentity, S3Service } from '@htownautos/common';

export interface SendEmailToBuyerDto {
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  attachments?: Array<{
    filename: string;
    contentType: string;
    content: string;
    size?: number;
  }>;
}

@Injectable()
export class EmailMessagesService {
  private readonly logger = new Logger(EmailMessagesService.name);

  constructor(
    private prisma: PrismaService,
    private postmarkService: PostmarkService,
    private tenantEmailDomainService: TenantEmailDomainService,
    private emailEventsService: EmailEventsService,
    private s3: S3Service,
  ) {}

  /**
   * Generate a short-lived presigned URL for a specific attachment of an email.
   * Validates that the attachment key is actually recorded on that email within
   * the tenant, preventing the caller from signing arbitrary S3 keys.
   */
  async getAttachmentDownloadUrl(
    tenantId: string,
    emailId: string,
    key: string,
    expiresInSeconds = 300,
  ): Promise<{ url: string; name?: string; mimeType?: string }> {
    const email = await this.prisma.emailMessage.findFirst({
      where: { id: emailId, tenantId },
      select: { attachments: true },
    });

    if (!email) {
      throw new NotFoundException('Email message not found');
    }

    const attachments = Array.isArray(email.attachments)
      ? (email.attachments as any[])
      : [];
    const match = attachments.find((a) => a && typeof a === 'object' && a.key === key);

    if (!match || !match.key) {
      throw new NotFoundException('Attachment not found on this email');
    }

    const url = await this.s3.getSignedUrl(match.key, expiresInSeconds);
    return { url, name: match.name, mimeType: match.mimeType };
  }

  /**
   * Upload outbound attachments to S3 so the UI can display/download them later.
   * Returns the metadata list to persist on the EmailMessage record. Failures are
   * logged but don't block sending — the email still goes out with the raw content.
   */
  private async uploadOutboundAttachments(
    tenantId: string,
    attachments: SendEmailToBuyerDto['attachments'],
  ): Promise<Array<{ name: string; mimeType: string; size: number; url: string; key: string }>> {
    if (!attachments?.length) return [];
    const stored: Array<{ name: string; mimeType: string; size: number; url: string; key: string }> = [];
    for (const att of attachments) {
      try {
        const base64 = att.content.includes('base64,')
          ? att.content.slice(att.content.indexOf('base64,') + 'base64,'.length)
          : att.content;
        const buffer = Buffer.from(base64, 'base64');
        const ext = (att.filename?.split('.').pop() || 'bin').toLowerCase();
        const result = await this.s3.uploadBuffer(
          buffer,
          `email-attachments/${tenantId}/outbound`,
          ext,
          att.contentType || 'application/octet-stream',
        );
        stored.push({
          name: att.filename,
          mimeType: att.contentType,
          size: att.size || buffer.length,
          url: result.url,
          key: result.key,
        });
      } catch (err) {
        this.logger.error(
          `Failed to upload outbound attachment "${att.filename}": ${(err as Error)?.message}`,
        );
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

  private readonly includeRelations = {
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

  private async emitCreated(record: any): Promise<void> {
    await this.s3.signAttachmentsOnRecords([record]);
    this.emailEventsService.emitEmailCreated(this.toEmailEvent(record));
  }

  private async emitUpdated(record: any): Promise<void> {
    await this.s3.signAttachmentsOnRecords([record]);
    this.emailEventsService.emitEmailUpdated(this.toEmailEvent(record));
  }

  private toEmailEvent(record: any): EmailEvent {
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
      attachments: (record.attachments as any) || null,
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

  /**
   * Send an email to a buyer via Postmark using the sender's tenant email
   * (e.g. marcos@dealermx.htownautos.com). Lazily provisions the tenant's
   * email domain on first use.
   */
  async sendToBuyer(
    tenantId: string,
    senderId: string,
    buyerId: string,
    dto: SendEmailToBuyerDto,
  ) {
    this.logger.log(`Sending email to buyer ${buyerId} from tenant ${tenantId}`);

    if (!dto.subject?.trim()) {
      throw new BadRequestException('Subject is required');
    }
    if (!dto.bodyHtml?.trim()) {
      throw new BadRequestException('Body is required');
    }

    const buyer = await this.prisma.buyer.findFirst({
      where: { id: buyerId, tenantId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!buyer) {
      throw new NotFoundException('Buyer not found in this tenant');
    }

    if (!buyer.email) {
      throw new BadRequestException('Buyer does not have an email address');
    }

    let tenantUser = await this.prisma.tenantUser.findFirst({
      where: { id: senderId, tenantId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        tenant: { select: { id: true, name: true, subdomain: true } },
      },
    });

    if (!tenantUser) {
      throw new BadRequestException('Sender is not a member of this tenant');
    }

    // Self-heal: legacy TenantUser rows created by Clerk webhook / auto-provision
    // may have null username/tenantEmail. Derive and persist on the fly so we
    // don't block the user from sending.
    if (!tenantUser.tenantEmail || !tenantUser.username) {
      if (!tenantUser.tenant?.subdomain) {
        throw new BadRequestException(
          'Tenant has no subdomain configured; cannot derive sender email',
        );
      }
      const identity = await resolveTenantUserIdentity(
        this.prisma,
        tenantId,
        {
          email: tenantUser.user.email,
          firstName: tenantUser.user.firstName,
          lastName: tenantUser.user.lastName,
        },
        tenantUser.tenant.subdomain,
        tenantUser.id,
      );
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
      this.logger.log(
        `Self-healed TenantUser ${tenantUser.id}: ${patched.tenantEmail}`,
      );
      tenantUser = patched;
    }

    if (!tenantUser.tenantEmail) {
      throw new BadRequestException(
        'Sender does not have a tenantEmail configured; cannot send from this account',
      );
    }

    // Lazy provision: ensure tenant's email domain + dedicated Postmark server are live.
    const provisionedTenant = await this.tenantEmailDomainService.ensureProvisioned(tenantId);
    if (!provisionedTenant.postmarkServerToken) {
      throw new BadRequestException(
        'Tenant is missing a Postmark server token; provisioning did not complete',
      );
    }

    const fromName =
      [tenantUser.user.firstName, tenantUser.user.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || tenantUser.tenant?.name || undefined;

    const fromEmail = tenantUser.tenantEmail;
    const replyTo = tenantUser.tenantEmail; // replies route back through Postmark inbound
    const subject = dto.subject.trim();
    const bodyText = dto.bodyText?.trim() || this.htmlToText(dto.bodyHtml);

    // Upload attachments to S3 in parallel with the queued-record creation so the
    // UI can later render/download them. Postmark still receives the raw base64.
    const uploadedAttachments = await this.uploadOutboundAttachments(tenantId, dto.attachments);
    const attachmentMetadata: Prisma.InputJsonValue = uploadedAttachments;

    // Optimistic record (status=queued) so the UI shows the pending email immediately.
    let record = await this.prisma.emailMessage.create({
      data: {
        tenantId,
        senderId,
        buyerId,
        direction: EmailDirection.OUTBOUND,
        status: EmailStatus.QUEUED,
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

    const attachments: PostmarkAttachmentInput[] | undefined = dto.attachments?.map((a) => ({
      filename: a.filename,
      contentType: a.contentType,
      content: a.content,
    }));

    const result = await this.postmarkService.sendEmailWithToken(
      provisionedTenant.postmarkServerToken,
      {
        from: this.formatSender(fromName, fromEmail),
        to: buyer.email,
        subject,
        htmlBody: dto.bodyHtml,
        textBody: bodyText,
        replyTo,
        attachments,
        tag: 'buyer-outbound',
        metadata: { tenantId, buyerId, senderId },
      },
    );

    if (result.success) {
      record = await this.prisma.emailMessage.update({
        where: { id: record.id },
        data: {
          status: EmailStatus.SENT,
          messageId: result.messageId,
          sentAt: new Date(),
        },
        include: this.includeRelations,
      });
      await this.emitUpdated(record);
      return record;
    }

    // Failure path
    record = await this.prisma.emailMessage.update({
      where: { id: record.id },
      data: {
        status: EmailStatus.FAILED,
        sesStatus: result.errorMessage?.slice(0, 255) || null,
      },
      include: this.includeRelations,
    });
    await this.emitUpdated(record);
    throw new BadRequestException(
      `Failed to send email: ${result.errorMessage || 'Unknown error'}`,
    );
  }

  /**
   * Format sender as `"Display Name" <email>`, RFC 2047-encoding display names
   * with non-ASCII characters and escaping quotes.
   */
  private formatSender(displayName: string | undefined, email: string): string {
    if (!displayName) return email;
    const hasNonAscii = /[^\x20-\x7E]/.test(displayName);
    if (hasNonAscii) {
      const encoded = `=?UTF-8?B?${Buffer.from(displayName, 'utf8').toString('base64')}?=`;
      return `${encoded} <${email}>`;
    }
    const safe = displayName.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `"${safe}" <${email}>`;
  }

  private htmlToText(html: string): string {
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

  async create(
    tenantId: string,
    createEmailMessageDto: CreateEmailMessageDto,
    senderId?: string,
  ) {
    // Verify buyer exists in the tenant
    const buyer = await this.prisma.buyer.findFirst({
      where: {
        id: createEmailMessageDto.buyerId,
        tenantId,
      },
    });

    if (!buyer) {
      throw new NotFoundException('Buyer not found in this tenant');
    }

    const record = await this.prisma.emailMessage.create({
      data: {
        tenantId,
        senderId,
        buyerId: createEmailMessageDto.buyerId,
        direction: createEmailMessageDto.direction,
        status: createEmailMessageDto.status || EmailStatus.SENT,
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

  async findAll(tenantId: string, query: QueryEmailMessageDto) {
    const {
      buyerId,
      senderId,
      direction,
      status,
      priority,
      isRead,
      threadId,
      search,
      fromDate,
      toDate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.EmailMessageWhereInput = {
      tenantId,
    };

    if (buyerId) where.buyerId = buyerId;
    if (senderId) where.senderId = senderId;
    if (direction) where.direction = direction;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (isRead !== undefined) where.isRead = isRead;
    if (threadId) where.threadId = threadId;

    if (search) {
      where.subject = { contains: search, mode: 'insensitive' };
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
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

    await this.s3.signAttachmentsOnRecords(data as any[]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string) {
    const emailMessage = await this.prisma.emailMessage.findFirst({
      where: { id, tenantId },
      include: this.includeRelations,
    });

    if (!emailMessage) {
      throw new NotFoundException('Email message not found');
    }

    await this.s3.signAttachmentsOnRecords([emailMessage as any]);

    return emailMessage;
  }

  async update(tenantId: string, id: string, updateEmailMessageDto: UpdateEmailMessageDto) {
    await this.findOne(tenantId, id);

    const data: Prisma.EmailMessageUpdateInput = {};

    if (updateEmailMessageDto.direction !== undefined) data.direction = updateEmailMessageDto.direction;
    if (updateEmailMessageDto.status !== undefined) data.status = updateEmailMessageDto.status;
    if (updateEmailMessageDto.fromEmail !== undefined) data.fromEmail = updateEmailMessageDto.fromEmail;
    if (updateEmailMessageDto.toEmail !== undefined) data.toEmail = updateEmailMessageDto.toEmail;
    if (updateEmailMessageDto.replyTo !== undefined) data.replyTo = updateEmailMessageDto.replyTo;
    if (updateEmailMessageDto.ccEmails !== undefined) data.ccEmails = updateEmailMessageDto.ccEmails;
    if (updateEmailMessageDto.bccEmails !== undefined) data.bccEmails = updateEmailMessageDto.bccEmails;
    if (updateEmailMessageDto.subject !== undefined) data.subject = updateEmailMessageDto.subject;
    if (updateEmailMessageDto.bodyHtml !== undefined) data.bodyHtml = updateEmailMessageDto.bodyHtml;
    if (updateEmailMessageDto.bodyText !== undefined) data.bodyText = updateEmailMessageDto.bodyText;
    if (updateEmailMessageDto.threadId !== undefined) data.threadId = updateEmailMessageDto.threadId;
    if (updateEmailMessageDto.inReplyTo !== undefined) data.inReplyTo = updateEmailMessageDto.inReplyTo;
    if (updateEmailMessageDto.references !== undefined) data.references = updateEmailMessageDto.references;
    if (updateEmailMessageDto.attachments !== undefined) data.attachments = updateEmailMessageDto.attachments;
    if (updateEmailMessageDto.attachmentCount !== undefined) data.attachmentCount = updateEmailMessageDto.attachmentCount;
    if (updateEmailMessageDto.messageId !== undefined) data.messageId = updateEmailMessageDto.messageId;
    if (updateEmailMessageDto.sesStatus !== undefined) data.sesStatus = updateEmailMessageDto.sesStatus;
    if (updateEmailMessageDto.bounceType !== undefined) data.bounceType = updateEmailMessageDto.bounceType;
    if (updateEmailMessageDto.bounceSubType !== undefined) data.bounceSubType = updateEmailMessageDto.bounceSubType;
    if (updateEmailMessageDto.complaintType !== undefined) data.complaintType = updateEmailMessageDto.complaintType;
    if (updateEmailMessageDto.isRead !== undefined) data.isRead = updateEmailMessageDto.isRead;
    if (updateEmailMessageDto.openCount !== undefined) data.openCount = updateEmailMessageDto.openCount;
    if (updateEmailMessageDto.clickCount !== undefined) data.clickCount = updateEmailMessageDto.clickCount;
    if (updateEmailMessageDto.priority !== undefined) data.priority = updateEmailMessageDto.priority;
    if (updateEmailMessageDto.labels !== undefined) data.labels = updateEmailMessageDto.labels;
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

  async remove(tenantId: string, id: string) {
    const existing = await this.findOne(tenantId, id);

    await this.prisma.emailMessage.delete({ where: { id } });

    return { message: 'Email message deleted successfully' };
  }

  async findByBuyer(tenantId: string, buyerId: string, query: QueryEmailMessageDto) {
    return this.findAll(tenantId, { ...query, buyerId });
  }

  async markAsRead(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    return this.prisma.emailMessage.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
      include: this.includeRelations,
    });
  }

  async markAllAsRead(tenantId: string, buyerId: string) {
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

  async getThread(tenantId: string, threadId: string, query: QueryEmailMessageDto) {
    return this.findAll(tenantId, {
      ...query,
      threadId,
      sortBy: 'createdAt',
      sortOrder: 'asc',
    });
  }

  async trackOpen(tenantId: string, id: string) {
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

  async trackClick(tenantId: string, id: string) {
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

  async getEmailStats(tenantId: string, buyerId?: string, senderId?: string) {
    const where: Prisma.EmailMessageWhereInput = { tenantId };
    if (buyerId) where.buyerId = buyerId;
    if (senderId) where.senderId = senderId;

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
}

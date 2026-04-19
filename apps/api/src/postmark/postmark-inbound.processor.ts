import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';
import { EmailEventsService } from '../presence/email-events.service';
import type {
  PostmarkInboundWebhookDto,
  PostmarkInboundAttachment,
} from './dto/postmark-inbound-webhook.dto';
import { Prisma } from '@prisma/client';

interface StoredAttachment {
  name: string;
  mimeType: string;
  size: number;
  url: string;
  key: string;
  contentId?: string | null;
}

@Injectable()
export class PostmarkInboundProcessor {
  private readonly logger = new Logger(PostmarkInboundProcessor.name);

  private readonly includeRelations = {
    sender: {
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, avatar: true } },
      },
    },
    buyer: {
      select: { id: true, firstName: true, lastName: true, email: true, phoneMain: true, phoneMobile: true },
    },
  } as const;

  constructor(
    private prisma: PrismaService,
    private emailEvents: EmailEventsService,
    private s3: S3Service,
  ) {}

  private async uploadAttachments(
    tenantId: string,
    attachments: PostmarkInboundAttachment[] | undefined,
  ): Promise<StoredAttachment[]> {
    if (!attachments || attachments.length === 0) return [];

    const stored: StoredAttachment[] = [];
    for (const att of attachments) {
      try {
        const buffer = Buffer.from(att.Content, 'base64');
        const ext = (att.Name?.split('.').pop() || 'bin').toLowerCase();
        const result = await this.s3.uploadBuffer(
          buffer,
          `email-attachments/${tenantId}/inbound`,
          ext,
          att.ContentType || 'application/octet-stream',
        );
        stored.push({
          name: att.Name,
          mimeType: att.ContentType,
          size: att.ContentLength ?? buffer.length,
          url: result.url,
          key: result.key,
          contentId: att.ContentID || null,
        });
      } catch (err) {
        this.logger.error(
          `Failed to upload inbound attachment "${att.Name}": ${(err as Error)?.message}`,
        );
        // Keep metadata even if upload failed, so we know it was there
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

  async process(payload: PostmarkInboundWebhookDto): Promise<void> {
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

    // Idempotency: if MessageID already stored, skip (Postmark retries up to 10 times).
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

    // Try to match sender to a buyer in this tenant.
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
      // No matching buyer — park in UnmatchedInboundEmail for admin review.
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
            headers: (payload.Headers || []) as unknown as Prisma.InputJsonValue,
            attachments: attachmentsMeta as unknown as Prisma.InputJsonValue,
            rawPayload: payload as unknown as Prisma.InputJsonValue,
          },
        });
        this.logger.log(`Parked unmatched inbound email from ${senderEmail} to ${recipient}`);
      } catch (err: any) {
        // Unique constraint on messageId — safe to ignore (duplicate)
        if (err?.code !== 'P2002') throw err;
      }
      return;
    }

    const record = await this.prisma.emailMessage.create({
      data: {
        tenantId: tenant.id,
        senderId: null, // inbound from buyer, no internal sender
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
        attachments: attachmentsMeta as unknown as Prisma.InputJsonValue,
        attachmentCount: attachmentsMeta.length,
        isRead: false,
      },
      include: this.includeRelations,
    });

    await this.emitCreated(record);
    this.logger.log(`Inbound email recorded: ${record.id} from ${senderEmail} to ${recipient}`);
  }

  private parseEmail(value: string | undefined): string | null {
    if (!value) return null;
    const match = value.match(/<([^>]+)>/);
    const email = (match ? match[1] : value).trim().toLowerCase();
    return email.includes('@') ? email : null;
  }

  /** From "marcos@dealermx.htownautos.com" → "dealermx" (the tenant subdomain). */
  private extractTenantSubdomain(email: string): string | null {
    const atIdx = email.indexOf('@');
    if (atIdx < 0) return null;
    const host = email.slice(atIdx + 1);
    // host = "dealermx.htownautos.com"
    const parts = host.split('.');
    if (parts.length < 3) return null; // require at least sub.domain.tld
    return parts[0] || null;
  }

  private getHeaderValue(payload: PostmarkInboundWebhookDto, name: string): string | null {
    const target = name.toLowerCase();
    const h = payload.Headers?.find((h) => h.Name?.toLowerCase() === target);
    return h?.Value || null;
  }

  private parseReferences(value: string | null): Prisma.InputJsonValue | undefined {
    if (!value) return undefined;
    return value.split(/\s+/).filter(Boolean) as unknown as Prisma.InputJsonValue;
  }

  private findThreadId(payload: PostmarkInboundWebhookDto): string | null {
    // Thread by In-Reply-To or first References entry. Caller can later join
    // multiple messages via threadId. Fallback: messageId → single-message thread.
    const inReplyTo = this.getHeaderValue(payload, 'In-Reply-To');
    if (inReplyTo) return inReplyTo.replace(/[<>]/g, '');
    const refs = this.getHeaderValue(payload, 'References');
    if (refs) {
      const first = refs.split(/\s+/).find(Boolean);
      if (first) return first.replace(/[<>]/g, '');
    }
    return null;
  }

  private async emitCreated(record: any): Promise<void> {
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
    });
  }
}

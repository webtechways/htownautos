import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';
import { EmailEventsService } from '../presence/email-events.service';
import type {
  PostmarkEventWebhookDto,
  PostmarkBounceEvent,
  PostmarkDeliveryEvent,
  PostmarkOpenEvent,
  PostmarkClickEvent,
  PostmarkSpamComplaintEvent,
} from './dto/postmark-event-webhook.dto';

@Injectable()
export class PostmarkEventProcessor {
  private readonly logger = new Logger(PostmarkEventProcessor.name);

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

  async process(event: PostmarkEventWebhookDto): Promise<void> {
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
        await this.handleBounce(existing.id, event as PostmarkBounceEvent);
        break;
      case 'SpamComplaint':
        await this.handleComplaint(existing.id, event as PostmarkSpamComplaintEvent);
        break;
      case 'Delivery':
        await this.handleDelivery(existing.id, event as PostmarkDeliveryEvent);
        break;
      case 'Open':
        await this.handleOpen(existing.id, existing.openCount || 0, event as PostmarkOpenEvent);
        break;
      case 'Click':
        await this.handleClick(existing.id, existing.clickCount || 0, event as PostmarkClickEvent);
        break;
      default:
        this.logger.debug(`Unhandled Postmark event type: ${event.RecordType}`);
    }
  }

  private async handleBounce(id: string, event: PostmarkBounceEvent) {
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

  private async handleComplaint(id: string, event: PostmarkSpamComplaintEvent) {
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

  private async handleDelivery(id: string, event: PostmarkDeliveryEvent) {
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

  private async handleOpen(id: string, currentCount: number, event: PostmarkOpenEvent) {
    const updated = await this.prisma.emailMessage.update({
      where: { id },
      data: {
        status: 'opened',
        openCount: currentCount + 1,
        lastOpenedAt: event.ReceivedAt ? new Date(event.ReceivedAt) : new Date(),
      },
      include: this.includeRelations,
    });
    // Only push the WebSocket update on the FIRST open. Subsequent opens still
    // bump openCount in the DB but don't notify clients — the email tracking
    // pixel reloads on every render in some clients (Gmail, Outlook), which
    // would otherwise spam every connected user.
    if (currentCount === 0) {
      await this.emitUpdated(updated);
    }
  }

  private async handleClick(id: string, currentCount: number, event: PostmarkClickEvent) {
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

  private mapBounceType(postmarkType: string): string {
    const t = (postmarkType || '').toLowerCase();
    if (t.includes('hard')) return 'hard';
    if (t.includes('transient')) return 'transient';
    if (t.includes('soft')) return 'soft';
    return 'soft';
  }

  private async emitUpdated(record: any): Promise<void> {
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

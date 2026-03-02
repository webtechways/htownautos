import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

export interface EmailEventUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

export interface EmailEventSender {
  id: string;
  user: EmailEventUser;
}

export interface EmailEventBuyer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
}

export interface EmailEvent {
  id: string;
  tenantId: string;
  direction: 'inbound' | 'outbound';
  status: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  bodyHtml?: string | null;
  bodyText?: string | null;
  messageId?: string | null;
  sesStatus?: string | null;
  bounceType?: string | null;
  isRead: boolean;
  buyerId: string;
  senderId?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  bouncedAt?: string | null;
  createdAt: string;
  // Related data
  sender?: EmailEventSender | null;
  buyer?: EmailEventBuyer | null;
}

/**
 * Service for emitting Email events via WebSocket.
 * Used for real-time updates to Email conversations.
 */
@Injectable()
export class EmailEventsService {
  private readonly logger = new Logger(EmailEventsService.name);
  private server: Server | null = null;

  /**
   * Set the Socket.IO server instance.
   * Called by PresenceGateway after initialization.
   */
  setServer(server: Server) {
    this.server = server;
    this.logger.log('Socket.IO server set for Email events');
  }

  /**
   * Emit a new email message event to the tenant room.
   */
  emitEmailCreated(email: EmailEvent) {
    if (!this.server) {
      this.logger.warn('Cannot emit email_created: Socket server not initialized');
      return;
    }

    const room = `tenant:${email.tenantId}`;
    this.server.to(room).emit('email_created', {
      email,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Emitted email_created to ${room} for message ${email.id}`);
  }

  /**
   * Emit an email status update event to the tenant room.
   */
  emitEmailUpdated(email: EmailEvent) {
    if (!this.server) {
      this.logger.warn('Cannot emit email_updated: Socket server not initialized');
      return;
    }

    const room = `tenant:${email.tenantId}`;
    this.server.to(room).emit('email_updated', {
      email,
      timestamp: new Date().toISOString(),
    });

    this.logger.log(`Emitted email_updated to ${room} for message ${email.id} (status: ${email.status})`);
  }
}

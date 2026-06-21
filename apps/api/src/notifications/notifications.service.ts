import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ListNotificationsDto } from './dto/list-notifications.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Create (single) ──────────────────────────────────────────────────────────

  async create(
    tenantId: string,
    userId: string,
    data: CreateNotificationDto,
  ) {
    return this.prisma.notification.create({
      data: {
        tenantId,
        userId,
        title: data.title,
        message: data.message,
        type: data.type,
        entityType: data.entityType ?? null,
        entityId: data.entityId ?? null,
        actionUrl: data.actionUrl ?? null,
        priority: data.priority ?? 'normal',
        metaValue: data.metaValue != null
          ? (data.metaValue as Prisma.InputJsonValue)
          : undefined,
      },
    });
  }

  // ── Fan-out to all active tenant staff ───────────────────────────────────────

  /**
   * Creates one Notification row per active staff member of the tenant.
   * Best-effort: any error is swallowed and logged — a notification failure
   * must NEVER propagate up to break the customer action that triggered it.
   */
  async notifyTenantStaff(
    tenantId: string,
    data: CreateNotificationDto,
  ): Promise<void> {
    try {
      const staff = await this.prisma.tenantUser.findMany({
        where: { tenantId, status: 'active', isActive: true },
        select: { userId: true },
      });

      if (staff.length === 0) return;

      // Deduplicate userIds (should not happen, but guard against it).
      const userIds = Array.from(new Set(staff.map((s) => s.userId)));

      const metaValue = data.metaValue != null
        ? (data.metaValue as Prisma.InputJsonValue)
        : undefined;

      await this.prisma.notification.createMany({
        data: userIds.map((userId) => ({
          tenantId,
          userId,
          title: data.title,
          message: data.message,
          type: data.type,
          entityType: data.entityType ?? null,
          entityId: data.entityId ?? null,
          actionUrl: data.actionUrl ?? null,
          priority: data.priority ?? 'normal',
          metaValue,
        })),
        skipDuplicates: true,
      });
    } catch (err) {
      this.logger.warn(
        `notifyTenantStaff: tenant=${tenantId} type=${data.type} — ${(err as Error).message}`,
      );
      // Never throw — caller must not be affected.
    }
  }

  // ── List (paginated) ─────────────────────────────────────────────────────────

  async list(
    userId: string,
    tenantId: string,
    query: ListNotificationsDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      tenantId,
      ...(query.unreadOnly ? { isRead: false } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  // ── Unread count ─────────────────────────────────────────────────────────────

  async unreadCount(userId: string, tenantId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, tenantId, isRead: false },
    });
  }

  // ── Mark single read ─────────────────────────────────────────────────────────

  async markRead(id: string, userId: string) {
    // where: id + userId — cross-user read is silently a no-op (updateMany returns
    // count 0), which is safe; a missing notification is not an error on a read path.
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
    return { ok: true };
  }

  // ── Mark all read ────────────────────────────────────────────────────────────

  async markAllRead(userId: string, tenantId: string) {
    const { count } = await this.prisma.notification.updateMany({
      where: { userId, tenantId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { ok: true, updated: count };
  }
}

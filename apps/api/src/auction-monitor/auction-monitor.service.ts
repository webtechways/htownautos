import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import { UpdateMonitorConfigDto } from './dto/update-monitor-config.dto';

const CONFIG_ID = 'singleton';
/** The worker beats every 30s; anything older than this means it is down. */
const HEARTBEAT_STALE_MS = 3 * 60_000;
const ACTIVE = ['pending', 'starting', 'running', 'stopping'];

/**
 * Control plane for the headless live-sale monitor. The browser itself runs in
 * the separate `auction-monitor` container, so every action here is a DB write
 * that the worker picks up on its next tick (≤30s).
 */
@Injectable()
export class AuctionMonitorService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig() {
    return this.prisma.auctionMonitorConfig.upsert({
      where: { id: CONFIG_ID },
      update: {},
      create: { id: CONFIG_ID },
    });
  }

  async updateConfig(dto: UpdateMonitorConfigDto) {
    const data: Prisma.AuctionMonitorConfigUpdateInput = { ...dto };
    if (dto.forwardWebhookUrl === '') data.forwardWebhookUrl = null;
    return this.prisma.auctionMonitorConfig.upsert({
      where: { id: CONFIG_ID },
      update: data,
      create: { id: CONFIG_ID, ...(data as Prisma.AuctionMonitorConfigCreateInput) },
    });
  }

  async getStatus() {
    const config = await this.getConfig();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [active, todayGrouped, monitored, upcoming] = await Promise.all([
      this.prisma.auctionMonitorSession.findMany({
        where: { status: { in: ACTIVE } },
        orderBy: { scheduledAt: 'asc' },
        select: this.sessionSelect(),
      }),
      this.prisma.auctionMonitorSession.groupBy({
        by: ['status'],
        where: { createdAt: { gte: startOfDay } },
        _count: { _all: true },
        _sum: { eventsSold: true, ingested: true },
      }),
      this.prisma.auctionCalendarEntry.count({ where: { monitor: true } }),
      this.prisma.auctionCalendarEntry.count({
        where: { monitor: true, startedAt: { gte: new Date() } },
      }),
    ]);

    const today = { sessions: 0, eventsSold: 0, ingested: 0 };
    for (const g of todayGrouped) {
      today.sessions += g._count._all;
      today.eventsSold += g._sum.eventsSold ?? 0;
      today.ingested += g._sum.ingested ?? 0;
    }

    const heartbeat = config.workerHeartbeatAt;
    const workerAlive = !!heartbeat && Date.now() - heartbeat.getTime() < HEARTBEAT_STALE_MS;

    return {
      config,
      workerAlive,
      active,
      today,
      monitoredEntries: monitored,
      upcomingMonitored: upcoming,
    };
  }

  async listSessions(params: { status?: string; page?: number; limit?: number }) {
    const p = Math.max(1, Math.floor(Number(params.page) || 1));
    const l = Math.min(200, Math.max(1, Math.floor(Number(params.limit) || 50)));
    const where: Prisma.AuctionMonitorSessionWhereInput = params.status
      ? params.status === 'active'
        ? { status: { in: ACTIVE } }
        : { status: params.status }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.auctionMonitorSession.findMany({
        where,
        orderBy: [{ scheduledAt: 'desc' }, { createdAt: 'desc' }],
        skip: (p - 1) * l,
        take: l,
        select: this.sessionSelect(),
      }),
      this.prisma.auctionMonitorSession.count({ where }),
    ]);
    return { data, total, page: p, limit: l };
  }

  async getSession(id: string) {
    const row = await this.prisma.auctionMonitorSession.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Session not found');
    return row;
  }

  /** Ask the worker to close a page. It flips the row to `stopped` when done. */
  async stopSession(id: string) {
    const row = await this.getSession(id);
    if (!ACTIVE.includes(row.status)) return row;
    return this.prisma.auctionMonitorSession.update({
      where: { id },
      data: { status: 'stopping' },
    });
  }

  /**
   * Start a calendar entry now, ignoring its scheduled time. Creates the same
   * `pending` row the scheduler would have created.
   */
  async startEntry(calendarEntryId: string) {
    const entry = await this.prisma.auctionCalendarEntry.findUnique({
      where: { id: calendarEntryId },
    });
    if (!entry) throw new NotFoundException('Calendar entry not found');

    const running = await this.prisma.auctionMonitorSession.findFirst({
      where: {
        locationSourceId: entry.locationSourceId,
        scheduledAt: entry.startedAt,
        status: { in: ACTIVE },
      },
    });
    if (running) return running;

    return this.prisma.auctionMonitorSession.create({
      data: {
        calendarEntryId: entry.id,
        locationSourceId: entry.locationSourceId,
        locationName: entry.locationName,
        locationSlug: entry.locationSlug,
        saleDate: entry.saleDate,
        scheduledAt: entry.startedAt,
        url: entry.url,
        status: 'pending',
      },
    });
  }

  /** Stamp a login check; the worker runs it on its next tick. */
  async requestLoginTest() {
    await this.prisma.auctionMonitorConfig.upsert({
      where: { id: CONFIG_ID },
      update: { loginTestRequestedAt: new Date(), loginError: null },
      create: { id: CONFIG_ID, loginTestRequestedAt: new Date() },
    });
    return { requested: true };
  }

  private sessionSelect() {
    return {
      id: true,
      locationName: true,
      locationSlug: true,
      saleDate: true,
      scheduledAt: true,
      url: true,
      status: true,
      startedAt: true,
      endedAt: true,
      lastEventAt: true,
      framesSeen: true,
      eventsSold: true,
      ingested: true,
      errors: true,
      stopReason: true,
      error: true,
    } satisfies Prisma.AuctionMonitorSessionSelect;
  }
}

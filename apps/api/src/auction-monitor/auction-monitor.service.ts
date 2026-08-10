import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';
import { UpdateMonitorConfigDto } from './dto/update-monitor-config.dto';
import { UploadScreenshotDto } from './dto/upload-screenshot.dto';

const CONFIG_ID = 'singleton';
/** Keep only the most recent captures per session. */
const SCREENSHOT_TAIL = 6;
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
  private readonly logger = new Logger(AuctionMonitorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

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

  /** Ask the worker for a fresh capture of a live page. */
  async requestScreenshot(id: string) {
    const row = await this.getSession(id);
    if (!ACTIVE.includes(row.status)) {
      throw new BadRequestException('Session is not running');
    }
    return this.prisma.auctionMonitorSession.update({
      where: { id },
      data: { screenshotRequestedAt: new Date() },
      select: { id: true, screenshotRequestedAt: true },
    });
  }

  /**
   * Store a capture pushed by the worker. Login shots overwrite the single slot
   * on the config; session shots append to a capped tail.
   */
  async storeScreenshot(dto: UploadScreenshotDto) {
    const buffer = Buffer.from(dto.imageBase64, 'base64');
    if (!buffer.length) throw new BadRequestException('Empty image');

    const stamp = Date.now();
    const safeLabel = dto.label.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
    const key =
      dto.kind === 'login'
        ? `monitor/login/${stamp}-${safeLabel}.jpg`
        : `monitor/sessions/${dto.sessionId}/${stamp}-${safeLabel}.jpg`;

    await this.s3.uploadBufferToKey(buffer, key, 'image/jpeg', 'public-read');
    const url = this.s3.buildPublicUrl(key);

    if (dto.kind === 'login') {
      await this.prisma.auctionMonitorConfig.upsert({
        where: { id: CONFIG_ID },
        update: { loginScreenshotUrl: url },
        create: { id: CONFIG_ID, loginScreenshotUrl: url },
      });
      return { url };
    }

    if (!dto.sessionId) throw new BadRequestException('sessionId is required for session shots');
    const session = await this.prisma.auctionMonitorSession.findUnique({
      where: { id: dto.sessionId },
      select: { screenshots: true },
    });
    if (!session) throw new NotFoundException('Session not found');

    const previous = Array.isArray(session.screenshots) ? (session.screenshots as any[]) : [];
    const next = [...previous, { label: dto.label, url, at: new Date().toISOString() }].slice(
      -SCREENSHOT_TAIL,
    );
    await this.prisma.auctionMonitorSession.update({
      where: { id: dto.sessionId },
      data: { screenshots: next, screenshotRequestedAt: null },
    });
    this.logger.log(`Stored monitor screenshot ${key}`);
    return { url };
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

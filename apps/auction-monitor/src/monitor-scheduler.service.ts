import { Injectable, Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@htownautos/prisma';
import { AbmSessionService } from './abm-session.service';
import { SaleEventSinkService } from './sale-event-sink.service';
import { ScreenshotService } from './screenshot.service';
import { SessionRunner } from './session-runner';
import type { FilterOptions } from './sio-decoder';

const CONFIG_ID = 'singleton';
const ACTIVE_STATUSES = ['pending', 'starting', 'running', 'stopping'];

type MonitorConfig = {
  paused: boolean;
  leadMinutes: number;
  maxConcurrentSessions: number;
  idleStopMinutes: number;
  maxDurationMinutes: number;
  onlySold: boolean;
  eventNames: string;
  wsUrlPattern: string;
  includeRaw: boolean;
  forwardWebhookUrl: string | null;
  loginTestRequestedAt: Date | null;
  lastError: string | null;
};

/**
 * The brain. Every 30s it reconciles what should be running (calendar entries
 * flagged `monitor`, plus rows the UI created by hand) against the pages the
 * browser actually has open, and flushes live counters back to the DB.
 *
 * The API runs in a different container, so the DB is the control bus: the UI
 * writes `status = 'stopping'`, a `pending` row, or `loginTestRequestedAt`, and
 * this loop acts on it within one tick.
 */
@Injectable()
export class MonitorSchedulerService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(MonitorSchedulerService.name);
  private readonly runners = new Map<string, SessionRunner>();
  private ticking = false;
  private shuttingDown = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly session: AbmSessionService,
    private readonly sink: SaleEventSinkService,
    private readonly screenshots: ScreenshotService,
  ) {}

  async onModuleInit(): Promise<void> {
    // A previous container may have died mid-sale; nothing is running now.
    await this.prisma.auctionMonitorSession
      .updateMany({
        where: { status: { in: ['pending', 'starting', 'running', 'stopping'] } },
        data: { status: 'stopped', stopReason: 'shutdown', endedAt: new Date() },
      })
      .catch(() => undefined);
    this.logger.log('Auction monitor scheduler active');
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async tick(): Promise<void> {
    if (this.ticking || this.shuttingDown) return;
    this.ticking = true;
    try {
      const config = await this.loadConfig();
      this.sink.setMirrorUrl(config.forwardWebhookUrl);

      await this.prisma.auctionMonitorConfig.update({
        where: { id: CONFIG_ID },
        data: { workerHeartbeatAt: new Date() },
      });

      if (config.loginTestRequestedAt) await this.runLoginTest();

      await this.syncCounters();
      await this.serveScreenshotRequests();

      if (config.paused) {
        await this.stopAll('paused');
        return;
      }

      await this.reconcile();
      await this.applyStopConditions(config);
      await this.startDue(config);

      if (config.lastError) {
        await this.prisma.auctionMonitorConfig.update({
          where: { id: CONFIG_ID },
          data: { lastError: null },
        });
      }
    } catch (err: any) {
      this.logger.error(`Tick failed: ${err.message}`);
      await this.prisma.auctionMonitorConfig
        .update({ where: { id: CONFIG_ID }, data: { lastError: err.message } })
        .catch(() => undefined);
    } finally {
      this.ticking = false;
    }
  }

  private async loadConfig(): Promise<MonitorConfig> {
    const cfg = await this.prisma.auctionMonitorConfig.upsert({
      where: { id: CONFIG_ID },
      update: {},
      create: { id: CONFIG_ID },
    });
    return cfg as unknown as MonitorConfig;
  }

  private filtersFrom(config: MonitorConfig): FilterOptions {
    return {
      onlySold: config.onlySold,
      eventNames: config.eventNames,
      wsUrlPattern: config.wsUrlPattern,
      includeRaw: config.includeRaw,
    };
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  private async runLoginTest(): Promise<void> {
    this.logger.log('Login check requested from the UI');
    const result = await this.session.ensureLoggedIn(true);
    await this.prisma.auctionMonitorConfig.update({
      where: { id: CONFIG_ID },
      data: {
        loginOk: result.ok,
        loginError: result.ok ? null : (result.error ?? 'unknown error'),
        lastLoginAt: new Date(),
        loginTestRequestedAt: null,
      },
    });
  }

  // ── Counters ──────────────────────────────────────────────────────────────
  private async syncCounters(): Promise<void> {
    for (const [sessionId, runner] of this.runners) {
      const { ingested, errors } = this.sink.takeCounters(sessionId);
      await this.prisma.auctionMonitorSession
        .update({
          where: { id: sessionId },
          data: {
            framesSeen: runner.framesSeen,
            eventsSold: runner.eventsSold,
            lastEventAt: runner.lastEventAt,
            ingested: { increment: ingested },
            errors: { increment: errors },
            log: runner.log,
          },
        })
        .catch((e) => this.logger.warn(`Counter sync failed for ${sessionId}: ${e.message}`));
    }
  }

  /**
   * Heal the two ways the map and the table can drift apart: a page Chromium
   * killed under us (mark `failed` so the sale gets retried while it is still
   * running), and a row left mid-flight by a crash (close it out).
   */
  private async reconcile(): Promise<void> {
    for (const [sessionId, runner] of [...this.runners]) {
      if (runner.isAlive) continue;
      this.runners.delete(sessionId);
      await runner.stop().catch(() => undefined);
      await this.prisma.auctionMonitorSession
        .update({
          where: { id: sessionId },
          data: {
            status: 'failed',
            error: 'Browser page closed unexpectedly',
            endedAt: new Date(),
            log: runner.log,
          },
        })
        .catch(() => undefined);
      this.logger.warn(`Session ${sessionId} lost its page — marked failed for retry`);
    }

    const orphans = await this.prisma.auctionMonitorSession.findMany({
      where: { status: { in: ['starting', 'running', 'stopping'] } },
      select: { id: true },
    });
    const lost = orphans.filter((o) => !this.runners.has(o.id)).map((o) => o.id);
    if (lost.length) {
      await this.prisma.auctionMonitorSession.updateMany({
        where: { id: { in: lost } },
        data: { status: 'stopped', stopReason: 'lost', endedAt: new Date() },
      });
      this.logger.warn(`Closed ${lost.length} orphaned session row(s)`);
    }
  }

  /** "Capture now" from the UI: one fresh shot of a live page. */
  private async serveScreenshotRequests(): Promise<void> {
    if (!this.runners.size) return;
    const requested = await this.prisma.auctionMonitorSession.findMany({
      where: { id: { in: [...this.runners.keys()] }, screenshotRequestedAt: { not: null } },
      select: { id: true },
    });
    for (const { id } of requested) {
      await this.runners.get(id)?.capture('manual');
      // The API clears the flag when the upload lands; clear it here too so a
      // failed capture does not loop forever.
      await this.prisma.auctionMonitorSession
        .update({ where: { id }, data: { screenshotRequestedAt: null } })
        .catch(() => undefined);
    }
  }

  // ── Stopping ──────────────────────────────────────────────────────────────
  private async applyStopConditions(config: MonitorConfig): Promise<void> {
    if (!this.runners.size) return;

    const rows = await this.prisma.auctionMonitorSession.findMany({
      where: { id: { in: [...this.runners.keys()] } },
      select: {
        id: true,
        status: true,
        scheduledAt: true,
        locationSourceId: true,
        lastEventAt: true,
        startedAt: true,
      },
    });

    const now = Date.now();
    for (const row of rows) {
      const runner = this.runners.get(row.id);
      if (!runner) continue;

      if (row.status === 'stopping') {
        await this.stopSession(row.id, 'manual');
        continue;
      }

      const hardStop = row.scheduledAt.getTime() + config.maxDurationMinutes * 60_000;
      if (now > hardStop) {
        await this.stopSession(row.id, 'duration');
        continue;
      }

      // Idle only counts once the sale should have started — pages opened early
      // are legitimately silent until then.
      const since = runner.lastEventAt?.getTime() ?? row.scheduledAt.getTime();
      if (
        now > row.scheduledAt.getTime() &&
        now - since > config.idleStopMinutes * 60_000
      ) {
        await this.stopSession(row.id, 'idle');
        continue;
      }

      // Staff turned the calendar toggle off mid-sale.
      if (row.locationSourceId != null) {
        const entry = await this.prisma.auctionCalendarEntry.findUnique({
          where: {
            locationSourceId_startedAt: {
              locationSourceId: row.locationSourceId,
              startedAt: row.scheduledAt,
            },
          },
          select: { monitor: true },
        });
        if (entry && !entry.monitor) await this.stopSession(row.id, 'unmonitored');
      }
    }
  }

  private async stopSession(sessionId: string, reason: string): Promise<void> {
    const runner = this.runners.get(sessionId);
    if (runner) {
      await runner.stop().catch(() => undefined);
      const { ingested, errors } = this.sink.takeCounters(sessionId);
      await this.prisma.auctionMonitorSession
        .update({
          where: { id: sessionId },
          data: {
            status: 'stopped',
            stopReason: reason,
            endedAt: new Date(),
            framesSeen: runner.framesSeen,
            eventsSold: runner.eventsSold,
            ingested: { increment: ingested },
            errors: { increment: errors },
            log: runner.log,
          },
        })
        .catch(() => undefined);
      this.runners.delete(sessionId);
      this.logger.log(`Session ${sessionId} stopped (${reason})`);
    }
  }

  private async stopAll(reason: string): Promise<void> {
    for (const id of [...this.runners.keys()]) await this.stopSession(id, reason);
  }

  // ── Starting ──────────────────────────────────────────────────────────────
  private async startDue(config: MonitorConfig): Promise<void> {
    await this.enqueueDueEntries(config);

    const capacity = config.maxConcurrentSessions - this.runners.size;
    if (capacity <= 0) return;

    const pending = await this.prisma.auctionMonitorSession.findMany({
      where: { status: 'pending' },
      orderBy: { scheduledAt: 'asc' },
      take: capacity,
    });
    if (!pending.length) return;

    // Verify the account once per batch and publish the result, so the UI shows
    // real login state without anyone pressing "Test login".
    const login = await this.session.ensureLoggedIn();
    await this.prisma.auctionMonitorConfig.update({
      where: { id: CONFIG_ID },
      data: {
        loginOk: login.ok,
        loginError: login.ok ? null : (login.error ?? 'unknown error'),
        lastLoginAt: new Date(),
      },
    });
    if (!login.ok) {
      await this.prisma.auctionMonitorSession.updateMany({
        where: { id: { in: pending.map((p) => p.id) } },
        data: { status: 'failed', error: `Not logged in: ${login.error}`, endedAt: new Date() },
      });
      this.logger.error(`Cannot open sales — not logged in: ${login.error}`);
      return;
    }

    for (const row of pending) {
      await this.startSession(row, config);
    }
  }

  /**
   * Materialize a session row for every monitored calendar entry whose start is
   * within `leadMinutes`. Identity is (locationSourceId, scheduledAt) because a
   * calendar refresh recreates entries with fresh ids.
   */
  private async enqueueDueEntries(config: MonitorConfig): Promise<void> {
    const now = Date.now();
    const entries = await this.prisma.auctionCalendarEntry.findMany({
      where: {
        monitor: true,
        startedAt: {
          gte: new Date(now - config.maxDurationMinutes * 60_000),
          lte: new Date(now + config.leadMinutes * 60_000),
        },
      },
      select: {
        id: true,
        locationSourceId: true,
        locationName: true,
        locationSlug: true,
        saleDate: true,
        startedAt: true,
        url: true,
      },
    });
    if (!entries.length) return;

    const existing = await this.prisma.auctionMonitorSession.findMany({
      where: {
        scheduledAt: { in: entries.map((e) => e.startedAt) },
        locationSourceId: { in: entries.map((e) => e.locationSourceId) },
      },
      select: { locationSourceId: true, scheduledAt: true, status: true, stopReason: true },
    });
    // A sale is "already handled" while a session is live, or once one finished
    // for a reason that means we are done with it. Sessions cut short by a
    // restart, a lost page, a pause or a crash are re-opened — otherwise a
    // deploy mid-sale would silently end coverage for the rest of the day.
    const TERMINAL = ['idle', 'duration', 'manual', 'unmonitored'];
    const handled = new Set(
      existing
        .filter(
          (s) =>
            ACTIVE_STATUSES.includes(s.status) ||
            (s.status === 'stopped' && TERMINAL.includes(s.stopReason ?? '')),
        )
        .map((s) => `${s.locationSourceId}|${s.scheduledAt.toISOString()}`),
    );

    for (const e of entries) {
      const key = `${e.locationSourceId}|${e.startedAt.toISOString()}`;
      if (handled.has(key)) continue;

      const failures = existing.filter(
        (s) =>
          s.status === 'failed' &&
          s.locationSourceId === e.locationSourceId &&
          s.scheduledAt.getTime() === e.startedAt.getTime(),
      ).length;
      if (failures >= 3) continue; // stop hammering a sale that will not open

      await this.prisma.auctionMonitorSession.create({
        data: {
          calendarEntryId: e.id,
          locationSourceId: e.locationSourceId,
          locationName: e.locationName,
          locationSlug: e.locationSlug,
          saleDate: e.saleDate,
          scheduledAt: e.startedAt,
          url: e.url,
          status: 'pending',
        },
      });
      this.logger.log(`Queued ${e.locationName} (${e.saleDate})`);
    }
  }

  private async startSession(
    row: { id: string; url: string; locationName: string },
    config: MonitorConfig,
  ): Promise<void> {
    await this.prisma.auctionMonitorSession.update({
      where: { id: row.id },
      data: { status: 'starting' },
    });

    const runner = new SessionRunner(
      { sessionId: row.id, url: row.url, locationName: row.locationName },
      this.session,
      this.sink,
      this.screenshots,
      this.filtersFrom(config),
    );

    try {
      await runner.start();
      this.runners.set(row.id, runner);
      await this.prisma.auctionMonitorSession.update({
        where: { id: row.id },
        data: { status: 'running', startedAt: new Date(), error: null, log: runner.log },
      });
      this.logger.log(`Session ${row.id} running — ${row.locationName}`);
    } catch (err: any) {
      await runner.stop().catch(() => undefined);
      await this.prisma.auctionMonitorSession.update({
        where: { id: row.id },
        data: {
          status: 'failed',
          error: err.message,
          endedAt: new Date(),
          log: runner.log,
        },
      });
      this.logger.error(`Session ${row.id} failed to start: ${err.message}`);
    }
  }

  async onApplicationShutdown(): Promise<void> {
    this.shuttingDown = true;
    await this.stopAll('shutdown');
  }
}

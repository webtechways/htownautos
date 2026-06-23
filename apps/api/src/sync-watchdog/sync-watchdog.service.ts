import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@htownautos/prisma';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * The main HtownAutos tenant that receives operational alerts.
 * Mirrors PORTAL_TENANT_ID from @htownautos/auth.
 * Override via SYNC_FAILURE_NOTIFY_TENANT_ID if needed.
 */
const PORTAL_TENANT_ID = '50197477-9e89-4465-bed5-99c638c435a0';

/**
 * Alert if no successful Copart sync has finished within this many hours.
 * Two missed half-hourly windows + a full run duration (~1h) = safe margin.
 */
const STALE_THRESHOLD_HOURS = 4;

/**
 * Dedupe window: do not send another SYNC_STALE alert if one was already
 * created within this many hours (prevents a 30-min cron from spamming staff).
 */
const DEDUPE_WINDOW_HOURS = 6;

const NOTIFICATION_TYPE = 'SYNC_STALE';

@Injectable()
export class SyncWatchdogService {
  private readonly logger = new Logger(SyncWatchdogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Runs every 30 minutes. Checks whether the Copart feed has had a successful
   * sync within the last STALE_THRESHOLD_HOURS. If not, notifies tenant staff
   * once per DEDUPE_WINDOW_HOURS so the alert doesn't spam every 30 minutes.
   *
   * This runs in the API process, which is always up even when the data-sync
   * worker is dead, crashed, or hung — that's intentional.
   */
  @Cron('0,30 * * * *')
  async checkCopartSyncStaleness(): Promise<void> {
    try {
      const tenantId =
        process.env.SYNC_FAILURE_NOTIFY_TENANT_ID ?? PORTAL_TENANT_ID;

      // Find the most recent successful Copart sync.
      const latestSuccess = await this.prisma.syncRun.findFirst({
        where: { source: 'copart', status: 'success' },
        orderBy: { finishedAt: 'desc' },
        select: { finishedAt: true },
      });

      const now = new Date();
      const thresholdMs = STALE_THRESHOLD_HOURS * 60 * 60 * 1000;
      const isStale =
        !latestSuccess?.finishedAt ||
        now.getTime() - latestSuccess.finishedAt.getTime() > thresholdMs;

      if (!isStale) return;

      // Calculate age for the notification message.
      const ageHours = latestSuccess?.finishedAt
        ? ((now.getTime() - latestSuccess.finishedAt.getTime()) / 3_600_000).toFixed(1)
        : null;

      // Dedupe: skip if a SYNC_STALE notification was already sent in the last
      // DEDUPE_WINDOW_HOURS so we don't flood staff on every 30-min tick.
      const dedupeWindowStart = new Date(
        now.getTime() - DEDUPE_WINDOW_HOURS * 60 * 60 * 1000,
      );
      const recentAlert = await this.prisma.notification.findFirst({
        where: {
          tenantId,
          type: NOTIFICATION_TYPE,
          createdAt: { gte: dedupeWindowStart },
        },
        select: { id: true },
      });

      if (recentAlert) {
        this.logger.debug(
          `Copart sync stale but SYNC_STALE alert already sent within ${DEDUPE_WINDOW_HOURS}h — skipping`,
        );
        return;
      }

      // Find the most recent run (any status) to include its error in the alert.
      const latestRun = await this.prisma.syncRun.findFirst({
        where: { source: 'copart' },
        orderBy: { startedAt: 'desc' },
        select: { status: true, error: true, startedAt: true },
      });

      const ageLabel = ageHours
        ? `${ageHours} horas`
        : 'nunca';

      let message =
        `La sincronización de Copart no se ha completado con éxito en más de ` +
        `${STALE_THRESHOLD_HOURS} horas (última sincronización exitosa hace ${ageLabel}).`;

      if (latestRun?.status === 'failed' && latestRun.error) {
        const shortError = latestRun.error.replace(/\s+/g, ' ').trim().slice(0, 200);
        message += ` Último error: ${shortError}`;
      } else if (latestRun?.status === 'running') {
        message += ' El worker parece estar bloqueado (estado "running" activo).';
      }

      this.logger.warn(`Copart sync stale (${ageLabel}): sending SYNC_STALE alert`);

      await this.notifications.notifyTenantStaff(tenantId, {
        title: 'Alerta: sincronización de Copart detenida',
        message,
        type: NOTIFICATION_TYPE,
        priority: 'high',
        actionUrl: '/dashboard/auction',
        metaValue: {
          source: 'copart',
          lastSuccessAt: latestSuccess?.finishedAt?.toISOString() ?? null,
          ageHours: ageHours ? parseFloat(ageHours) : null,
          latestRunStatus: latestRun?.status ?? null,
        },
      });
    } catch (err) {
      // Best-effort: never throw from a watchdog cron — a watchdog crashing
      // would make the monitoring disappear silently.
      this.logger.error(
        `SyncWatchdog check failed (non-fatal): ${(err as Error).message}`,
        (err as Error).stack,
      );
    }
  }
}

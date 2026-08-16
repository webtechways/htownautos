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
var SyncWatchdogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncWatchdogService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_1 = require("@htownautos/prisma");
const notifications_service_1 = require("../notifications/notifications.service");
const PORTAL_TENANT_ID = '50197477-9e89-4465-bed5-99c638c435a0';
const STALE_THRESHOLD_HOURS = 4;
const DEDUPE_WINDOW_HOURS = 6;
const NOTIFICATION_TYPE = 'SYNC_STALE';
let SyncWatchdogService = SyncWatchdogService_1 = class SyncWatchdogService {
    prisma;
    notifications;
    logger = new common_1.Logger(SyncWatchdogService_1.name);
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    async checkCopartSyncStaleness() {
        try {
            const tenantId = process.env.SYNC_FAILURE_NOTIFY_TENANT_ID ?? PORTAL_TENANT_ID;
            const latestSuccess = await this.prisma.syncRun.findFirst({
                where: { source: 'copart', status: 'success' },
                orderBy: { finishedAt: 'desc' },
                select: { finishedAt: true },
            });
            const now = new Date();
            const thresholdMs = STALE_THRESHOLD_HOURS * 60 * 60 * 1000;
            const isStale = !latestSuccess?.finishedAt ||
                now.getTime() - latestSuccess.finishedAt.getTime() > thresholdMs;
            if (!isStale)
                return;
            const ageHours = latestSuccess?.finishedAt
                ? ((now.getTime() - latestSuccess.finishedAt.getTime()) / 3_600_000).toFixed(1)
                : null;
            const dedupeWindowStart = new Date(now.getTime() - DEDUPE_WINDOW_HOURS * 60 * 60 * 1000);
            const recentAlert = await this.prisma.notification.findFirst({
                where: {
                    tenantId,
                    type: NOTIFICATION_TYPE,
                    createdAt: { gte: dedupeWindowStart },
                },
                select: { id: true },
            });
            if (recentAlert) {
                this.logger.debug(`Copart sync stale but SYNC_STALE alert already sent within ${DEDUPE_WINDOW_HOURS}h — skipping`);
                return;
            }
            const latestRun = await this.prisma.syncRun.findFirst({
                where: { source: 'copart' },
                orderBy: { startedAt: 'desc' },
                select: { status: true, error: true, startedAt: true },
            });
            const ageLabel = ageHours
                ? `${ageHours} horas`
                : 'nunca';
            let message = `La sincronización de Copart no se ha completado con éxito en más de ` +
                `${STALE_THRESHOLD_HOURS} horas (última sincronización exitosa hace ${ageLabel}).`;
            if (latestRun?.status === 'failed' && latestRun.error) {
                const shortError = latestRun.error.replace(/\s+/g, ' ').trim().slice(0, 200);
                message += ` Último error: ${shortError}`;
            }
            else if (latestRun?.status === 'running') {
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
        }
        catch (err) {
            this.logger.error(`SyncWatchdog check failed (non-fatal): ${err.message}`, err.stack);
        }
    }
};
exports.SyncWatchdogService = SyncWatchdogService;
__decorate([
    (0, schedule_1.Cron)('0,30 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SyncWatchdogService.prototype, "checkCopartSyncStaleness", null);
exports.SyncWatchdogService = SyncWatchdogService = SyncWatchdogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        notifications_service_1.NotificationsService])
], SyncWatchdogService);
//# sourceMappingURL=sync-watchdog.service.js.map
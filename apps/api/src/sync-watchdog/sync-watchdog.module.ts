import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { NotificationsModule } from '../notifications/notifications.module';
import { SyncWatchdogService } from './sync-watchdog.service';

/**
 * SyncWatchdogModule — scheduled staleness check for the Copart feed.
 *
 * Runs inside the API process (always-up) so it keeps alerting even if
 * the data-sync worker is dead. Imports PrismaModule (reads SyncRun +
 * Notification) and NotificationsModule (for notifyTenantStaff fan-out).
 * No controllers. No guards. No circular deps.
 */
@Module({
  imports: [PrismaModule, NotificationsModule],
  providers: [SyncWatchdogService],
})
export class SyncWatchdogModule {}

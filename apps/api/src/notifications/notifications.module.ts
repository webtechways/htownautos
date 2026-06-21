import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

/**
 * NotificationsModule — staff notification feed + fan-out producer.
 *
 * Only imports PrismaModule. Exported so any module that fires notifications
 * (e.g. PortalModule) can inject NotificationsService without circular deps.
 */
@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

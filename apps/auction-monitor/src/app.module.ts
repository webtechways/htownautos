import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '@htownautos/prisma';
import { AbmSessionService } from './abm-session.service';
import { MonitorSchedulerService } from './monitor-scheduler.service';
import { SaleEventSinkService } from './sale-event-sink.service';
import { ScreenshotService } from './screenshot.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
  ],
  providers: [
    AbmSessionService,
    SaleEventSinkService,
    ScreenshotService,
    MonitorSchedulerService,
  ],
})
export class AppModule {}

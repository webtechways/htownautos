import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '@htownautos/prisma';
import { OpenSearchLibModule } from '@htownautos/opensearch';
import { RabbitMQModule } from '@htownautos/rabbitmq';
import { CopartImportService } from './copart-import.service';
import { SyncTriggerListener } from './sync-trigger.listener';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    OpenSearchLibModule,
    RabbitMQModule,
  ],
  providers: [CopartImportService, SyncTriggerListener],
})
export class AppModule {}

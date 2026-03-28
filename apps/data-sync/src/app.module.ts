import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '@htownautos/prisma';
import { OpenSearchLibModule } from '@htownautos/opensearch';
import { CopartImportService } from './copart-import.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    OpenSearchLibModule,
  ],
  providers: [CopartImportService],
})
export class AppModule {}

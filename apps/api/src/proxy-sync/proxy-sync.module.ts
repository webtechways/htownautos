import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { ProxySyncService } from './proxy-sync.service';

@Module({
  imports: [PrismaModule],
  providers: [ProxySyncService],
  exports: [ProxySyncService],
})
export class ProxySyncModule {}

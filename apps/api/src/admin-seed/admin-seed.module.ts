import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { AdminSeedController } from './admin-seed.controller';
import { AdminSeedService } from './admin-seed.service';

// PrismaModule imported so the service resolves PrismaService (boot-safe).
@Module({
  imports: [PrismaModule],
  controllers: [AdminSeedController],
  providers: [AdminSeedService],
})
export class AdminSeedModule {}

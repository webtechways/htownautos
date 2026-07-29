import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { TitleMappingService } from './title-mapping.service';
import { TitleMappingController } from './title-mapping.controller';

// PrismaModule is required here because ClerkJwtGuard (used by the controller)
// injects PrismaService — without it the guard can't be instantiated and the
// whole api crash-loops on boot.
@Module({
  imports: [PrismaModule],
  controllers: [TitleMappingController],
  providers: [TitleMappingService],
  exports: [TitleMappingService],
})
export class TitleMappingModule {}

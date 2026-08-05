import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { ImageCacheService } from './image-cache.service';
import { ImageCacheController } from './image-cache.controller';
import { ProxySyncModule } from '../proxy-sync/proxy-sync.module';

// PrismaModule is required because ClerkJwtGuard (used by the controller) injects
// PrismaService (see seller-classification.module for the same note).
// ProxySyncModule provides ProxySyncService for the manual "Resync proxies" action.
@Module({
  imports: [PrismaModule, ProxySyncModule],
  controllers: [ImageCacheController],
  providers: [ImageCacheService],
  exports: [ImageCacheService],
})
export class ImageCacheModule {}

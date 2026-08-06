import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';
import { ImageCacheService } from './image-cache.service';
import { ImageCacheController } from './image-cache.controller';
import { ProxySyncModule } from '../proxy-sync/proxy-sync.module';

// PrismaModule is required because ClerkJwtGuard (used by the controller) injects
// PrismaService (see seller-classification.module for the same note).
// ProxySyncModule provides ProxySyncService for the manual "Resync proxies" action.
// S3Service computes the cached gallery storage total.
@Module({
  imports: [PrismaModule, ProxySyncModule],
  controllers: [ImageCacheController],
  providers: [ImageCacheService, S3Service],
  exports: [ImageCacheService],
})
export class ImageCacheModule {}

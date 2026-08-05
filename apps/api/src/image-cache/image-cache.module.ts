import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { ImageCacheService } from './image-cache.service';
import { ImageCacheController } from './image-cache.controller';

// PrismaModule is required because ClerkJwtGuard (used by the controller) injects
// PrismaService (see seller-classification.module for the same note).
@Module({
  imports: [PrismaModule],
  controllers: [ImageCacheController],
  providers: [ImageCacheService],
  exports: [ImageCacheService],
})
export class ImageCacheModule {}

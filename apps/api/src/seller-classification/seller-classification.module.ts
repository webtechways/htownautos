import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { SellerClassificationService } from './seller-classification.service';
import { SellerClassificationController } from './seller-classification.controller';

// PrismaModule is required here because ClerkJwtGuard (used by the controller)
// injects PrismaService — without it the guard can't be instantiated and the
// whole api crash-loops on boot.
@Module({
  imports: [PrismaModule],
  controllers: [SellerClassificationController],
  providers: [SellerClassificationService],
  exports: [SellerClassificationService],
})
export class SellerClassificationModule {}

import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { ListingReviewsController } from './listing-reviews.controller';
import { ListingReviewsService } from './listing-reviews.service';

@Module({
  imports: [PrismaModule],
  controllers: [ListingReviewsController],
  providers: [ListingReviewsService],
})
export class ListingReviewsModule {}

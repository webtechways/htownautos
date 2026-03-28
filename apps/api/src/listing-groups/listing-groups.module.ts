import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { ListingGroupsController } from './listing-groups.controller';
import { ListingGroupsService } from './listing-groups.service';

@Module({
  imports: [PrismaModule],
  controllers: [ListingGroupsController],
  providers: [ListingGroupsService],
  exports: [ListingGroupsService],
})
export class ListingGroupsModule {}

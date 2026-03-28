import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { OpenSearchService } from './opensearch.service';
import { AuctionIndexService } from './auction-index.service';
import { AuctionSyncService } from './auction-sync.service';

@Module({
  imports: [PrismaModule],
  providers: [
    OpenSearchService,
    AuctionIndexService,
    AuctionSyncService,
  ],
  exports: [
    OpenSearchService,
    AuctionIndexService,
    AuctionSyncService,
  ],
})
export class OpenSearchLibModule {}

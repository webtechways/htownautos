import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
import { OpenSearchService } from './opensearch.service';
import { AuctionIndexService } from './auction-index.service';
import { AuctionSyncService } from './auction-sync.service';
import { AuctionSearchService } from './auction-search.service';
import { AuctionSearchController } from './auction-search.controller';
import { CopartImportService } from './copart-import.service';

@Module({
  imports: [ConfigModule],
  controllers: [AuctionSearchController],
  providers: [
    PrismaService,
    OpenSearchService,
    AuctionIndexService,
    AuctionSyncService,
    AuctionSearchService,
    CopartImportService,
  ],
  exports: [
    OpenSearchService,
    AuctionIndexService,
    AuctionSyncService,
    AuctionSearchService,
    CopartImportService,
  ],
})
export class OpenSearchModule {}

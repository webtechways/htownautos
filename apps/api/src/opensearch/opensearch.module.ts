import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@htownautos/prisma';
import { ProxyService } from '@htownautos/common';
import { OpenSearchLibModule } from '@htownautos/opensearch';
import { AuctionSearchService } from './auction-search.service';
import { AuctionSearchController } from './auction-search.controller';
import { CopartImportService } from './copart-import.service';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    OpenSearchLibModule,
  ],
  controllers: [AuctionSearchController],
  providers: [
    ProxyService,
    AuctionSearchService,
    CopartImportService,
  ],
  exports: [
    AuctionSearchService,
  ],
})
export class OpenSearchModule {}

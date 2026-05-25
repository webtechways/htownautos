import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@htownautos/prisma';
import { ProxyService } from '@htownautos/common';
import { OpenSearchLibModule } from '@htownautos/opensearch';
import { AuctionSearchService } from './auction-search.service';
import { AuctionSearchController } from './auction-search.controller';
import { AuctionFacetsService } from './auction-facets.service';
import { AuctionFacetsController } from './auction-facets.controller';

/**
 * Heavy CSV import + full reindex used to live here as `CopartImportService`,
 * but they were moved to the `data-sync` worker. The api now only publishes
 * RabbitMQ trigger messages and serves read endpoints.
 */
@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    OpenSearchLibModule,
  ],
  controllers: [AuctionSearchController, AuctionFacetsController],
  providers: [
    ProxyService,
    AuctionSearchService,
    AuctionFacetsService,
  ],
  exports: [
    AuctionSearchService,
    AuctionFacetsService,
  ],
})
export class OpenSearchModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '@htownautos/prisma';
import { OpenSearchLibModule } from '@htownautos/opensearch';
import { RabbitMQModule } from '@htownautos/rabbitmq';
import { ProxyService, CopartImagesService } from '@htownautos/common';
import { CopartImportService } from './copart-import.service';
import { SyncTriggerListener } from './sync-trigger.listener';
import { WantedMatchNotifierService } from './wanted-match-notifier.service';
import { SellerClassificationNotifierService } from './seller-classification-notifier.service';
import { AuctionAliasNotifierService } from './auction-alias-notifier.service';
import { ImageCacheEnqueuerService } from './image-cache-enqueuer.service';
import { ImageCacheCrawlerService } from './image-cache-crawler.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    OpenSearchLibModule,
    RabbitMQModule,
  ],
  providers: [
    CopartImportService,
    SyncTriggerListener,
    WantedMatchNotifierService,
    SellerClassificationNotifierService,
    AuctionAliasNotifierService,
    ImageCacheEnqueuerService,
    ImageCacheCrawlerService,
    CopartImagesService,
    ProxyService,
  ],
})
export class AppModule {}

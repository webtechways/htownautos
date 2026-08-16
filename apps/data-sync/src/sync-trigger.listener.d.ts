import { OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '@htownautos/rabbitmq';
import { AuctionIndexService, AuctionSyncService } from '@htownautos/opensearch';
import { CopartImportService } from './copart-import.service';
export declare class SyncTriggerListener implements OnModuleInit {
    private readonly rabbitMQ;
    private readonly importService;
    private readonly indexService;
    private readonly syncService;
    private readonly logger;
    constructor(rabbitMQ: RabbitMQService, importService: CopartImportService, indexService: AuctionIndexService, syncService: AuctionSyncService);
    onModuleInit(): Promise<void>;
    private handle;
}

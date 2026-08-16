"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SyncTriggerListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncTriggerListener = void 0;
const common_1 = require("@nestjs/common");
const rabbitmq_1 = require("@htownautos/rabbitmq");
const opensearch_1 = require("@htownautos/opensearch");
const copart_import_service_1 = require("./copart-import.service");
let SyncTriggerListener = SyncTriggerListener_1 = class SyncTriggerListener {
    rabbitMQ;
    importService;
    indexService;
    syncService;
    logger = new common_1.Logger(SyncTriggerListener_1.name);
    constructor(rabbitMQ, importService, indexService, syncService) {
        this.rabbitMQ = rabbitMQ;
        this.importService = importService;
        this.indexService = indexService;
        this.syncService = syncService;
    }
    async onModuleInit() {
        await this.rabbitMQ.consume(rabbitmq_1.AUCTION_SYNC_TRIGGER_QUEUE, async (raw) => {
            const msg = raw;
            this.logger.log(`[SyncTrigger] received ${msg.kind}`);
            const start = Date.now();
            try {
                await this.handle(msg);
                this.logger.log(`[SyncTrigger] done ${msg.kind} in ${Date.now() - start}ms`);
            }
            catch (err) {
                this.logger.error(`[SyncTrigger] failed ${msg.kind}: ${err.message}`, err.stack);
                throw err;
            }
        });
    }
    async handle(msg) {
        switch (msg.kind) {
            case 'copart-import':
                await this.importService.runSync();
                return;
            case 'copart-import-recreate':
                await this.indexService.recreateIndex();
                await this.importService.runSync();
                return;
            case 'reindex-copart':
                await this.syncService.syncAllCopart();
                return;
            case 'reindex-all':
                await this.syncService.syncAll();
                return;
            case 'recreate-index':
                await this.indexService.recreateIndex();
                return;
            default: {
                const exhaustive = msg;
                this.logger.warn(`[SyncTrigger] unknown kind: ${JSON.stringify(exhaustive)}`);
            }
        }
    }
};
exports.SyncTriggerListener = SyncTriggerListener;
exports.SyncTriggerListener = SyncTriggerListener = SyncTriggerListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rabbitmq_1.RabbitMQService,
        copart_import_service_1.CopartImportService,
        opensearch_1.AuctionIndexService,
        opensearch_1.AuctionSyncService])
], SyncTriggerListener);
//# sourceMappingURL=sync-trigger.listener.js.map
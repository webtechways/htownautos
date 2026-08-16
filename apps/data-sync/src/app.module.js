"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const prisma_1 = require("@htownautos/prisma");
const opensearch_1 = require("@htownautos/opensearch");
const rabbitmq_1 = require("@htownautos/rabbitmq");
const copart_import_service_1 = require("./copart-import.service");
const sync_trigger_listener_1 = require("./sync-trigger.listener");
const wanted_match_notifier_service_1 = require("./wanted-match-notifier.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
            prisma_1.PrismaModule,
            opensearch_1.OpenSearchLibModule,
            rabbitmq_1.RabbitMQModule,
        ],
        providers: [
            copart_import_service_1.CopartImportService,
            sync_trigger_listener_1.SyncTriggerListener,
            wanted_match_notifier_service_1.WantedMatchNotifierService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
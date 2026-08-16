"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSearchLibModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const opensearch_service_1 = require("./opensearch.service");
const auction_index_service_1 = require("./auction-index.service");
const auction_sync_service_1 = require("./auction-sync.service");
let OpenSearchLibModule = class OpenSearchLibModule {
};
exports.OpenSearchLibModule = OpenSearchLibModule;
exports.OpenSearchLibModule = OpenSearchLibModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule],
        providers: [
            opensearch_service_1.OpenSearchService,
            auction_index_service_1.AuctionIndexService,
            auction_sync_service_1.AuctionSyncService,
        ],
        exports: [
            opensearch_service_1.OpenSearchService,
            auction_index_service_1.AuctionIndexService,
            auction_sync_service_1.AuctionSyncService,
        ],
    })
], OpenSearchLibModule);
//# sourceMappingURL=opensearch.module.js.map
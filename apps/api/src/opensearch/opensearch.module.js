"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSearchModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
const opensearch_1 = require("@htownautos/opensearch");
const title_mapping_module_1 = require("../title-mapping/title-mapping.module");
const auction_search_service_1 = require("./auction-search.service");
const auction_search_controller_1 = require("./auction-search.controller");
const auction_facets_service_1 = require("./auction-facets.service");
const auction_facets_controller_1 = require("./auction-facets.controller");
let OpenSearchModule = class OpenSearchModule {
};
exports.OpenSearchModule = OpenSearchModule;
exports.OpenSearchModule = OpenSearchModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            prisma_1.PrismaModule,
            opensearch_1.OpenSearchLibModule,
            title_mapping_module_1.TitleMappingModule,
        ],
        controllers: [auction_search_controller_1.AuctionSearchController, auction_facets_controller_1.AuctionFacetsController],
        providers: [
            common_2.ProxyService,
            auction_search_service_1.AuctionSearchService,
            auction_facets_service_1.AuctionFacetsService,
        ],
        exports: [
            auction_search_service_1.AuctionSearchService,
            auction_facets_service_1.AuctionFacetsService,
        ],
    })
], OpenSearchModule);
//# sourceMappingURL=opensearch.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectionShareLinksModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
const inspection_share_links_controller_1 = require("./inspection-share-links.controller");
const inspection_share_links_service_1 = require("./inspection-share-links.service");
const short_url_module_1 = require("../short-url/short-url.module");
const auction_analysis_module_1 = require("../auction-analysis/auction-analysis.module");
let InspectionShareLinksModule = class InspectionShareLinksModule {
};
exports.InspectionShareLinksModule = InspectionShareLinksModule;
exports.InspectionShareLinksModule = InspectionShareLinksModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule, short_url_module_1.ShortUrlModule, auction_analysis_module_1.AuctionAnalysisModule],
        controllers: [inspection_share_links_controller_1.InspectionShareLinksController],
        providers: [inspection_share_links_service_1.InspectionShareLinksService, common_2.S3Service],
        exports: [inspection_share_links_service_1.InspectionShareLinksService],
    })
], InspectionShareLinksModule);
//# sourceMappingURL=inspection-share-links.module.js.map
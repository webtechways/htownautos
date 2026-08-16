"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionAnalysisModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const common_2 = require("@htownautos/common");
const auction_analysis_service_1 = require("./auction-analysis.service");
let AuctionAnalysisModule = class AuctionAnalysisModule {
};
exports.AuctionAnalysisModule = AuctionAnalysisModule;
exports.AuctionAnalysisModule = AuctionAnalysisModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule],
        providers: [auction_analysis_service_1.AuctionAnalysisService, common_2.S3Service],
        exports: [auction_analysis_service_1.AuctionAnalysisService],
    })
], AuctionAnalysisModule);
//# sourceMappingURL=auction-analysis.module.js.map
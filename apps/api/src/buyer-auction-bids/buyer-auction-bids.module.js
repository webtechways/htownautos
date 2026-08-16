"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyerAuctionBidsModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const buyer_auction_bids_controller_1 = require("./buyer-auction-bids.controller");
const buyer_auction_bids_service_1 = require("./buyer-auction-bids.service");
let BuyerAuctionBidsModule = class BuyerAuctionBidsModule {
};
exports.BuyerAuctionBidsModule = BuyerAuctionBidsModule;
exports.BuyerAuctionBidsModule = BuyerAuctionBidsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule],
        controllers: [buyer_auction_bids_controller_1.BuyerAuctionBidsController],
        providers: [buyer_auction_bids_service_1.BuyerAuctionBidsService],
        exports: [buyer_auction_bids_service_1.BuyerAuctionBidsService],
    })
], BuyerAuctionBidsModule);
//# sourceMappingURL=buyer-auction-bids.module.js.map
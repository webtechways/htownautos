"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaxBidModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const max_bid_service_1 = require("./max-bid.service");
const max_bid_controller_1 = require("./max-bid.controller");
let MaxBidModule = class MaxBidModule {
};
exports.MaxBidModule = MaxBidModule;
exports.MaxBidModule = MaxBidModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule],
        controllers: [max_bid_controller_1.MaxBidController],
        providers: [max_bid_service_1.MaxBidService],
        exports: [max_bid_service_1.MaxBidService],
    })
], MaxBidModule);
//# sourceMappingURL=max-bid.module.js.map
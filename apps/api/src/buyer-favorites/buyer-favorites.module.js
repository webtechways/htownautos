"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuyerFavoritesModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const short_url_module_1 = require("../short-url/short-url.module");
const buyer_favorites_controller_1 = require("./buyer-favorites.controller");
const buyer_favorites_service_1 = require("./buyer-favorites.service");
const buyer_favorites_share_links_service_1 = require("./buyer-favorites-share-links.service");
const buyer_favorites_share_links_controller_1 = require("./buyer-favorites-share-links.controller");
let BuyerFavoritesModule = class BuyerFavoritesModule {
};
exports.BuyerFavoritesModule = BuyerFavoritesModule;
exports.BuyerFavoritesModule = BuyerFavoritesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule, short_url_module_1.ShortUrlModule],
        controllers: [buyer_favorites_controller_1.BuyerFavoritesController, buyer_favorites_share_links_controller_1.BuyerFavoritesShareLinksController],
        providers: [buyer_favorites_service_1.BuyerFavoritesService, buyer_favorites_share_links_service_1.BuyerFavoritesShareLinksService],
        exports: [buyer_favorites_service_1.BuyerFavoritesService],
    })
], BuyerFavoritesModule);
//# sourceMappingURL=buyer-favorites.module.js.map
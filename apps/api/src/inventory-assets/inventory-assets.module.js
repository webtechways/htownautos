"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryAssetsModule = void 0;
const common_1 = require("@nestjs/common");
const inventory_assets_controller_1 = require("./inventory-assets.controller");
const inventory_assets_service_1 = require("./inventory-assets.service");
const prisma_1 = require("@htownautos/prisma");
const media_1 = require("@htownautos/media");
let InventoryAssetsModule = class InventoryAssetsModule {
};
exports.InventoryAssetsModule = InventoryAssetsModule;
exports.InventoryAssetsModule = InventoryAssetsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule, media_1.MediaModule],
        controllers: [inventory_assets_controller_1.InventoryAssetsController],
        providers: [inventory_assets_service_1.InventoryAssetsService],
        exports: [inventory_assets_service_1.InventoryAssetsService],
    })
], InventoryAssetsModule);
//# sourceMappingURL=inventory-assets.module.js.map
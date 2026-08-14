"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GalleryCacheModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const rabbitmq_1 = require("@htownautos/rabbitmq");
const common_2 = require("@htownautos/common");
const gallery_cache_service_1 = require("./gallery-cache.service");
let GalleryCacheModule = class GalleryCacheModule {
};
exports.GalleryCacheModule = GalleryCacheModule;
exports.GalleryCacheModule = GalleryCacheModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule, rabbitmq_1.RabbitMQModule],
        providers: [gallery_cache_service_1.GalleryCacheService, common_2.S3Service, common_2.ProxyService],
    })
], GalleryCacheModule);
//# sourceMappingURL=gallery-cache.module.js.map
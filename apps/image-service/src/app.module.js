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
const prisma_1 = require("@htownautos/prisma");
const redis_1 = require("@htownautos/redis");
const rabbitmq_1 = require("@htownautos/rabbitmq");
const auth_1 = require("@htownautos/auth");
const common_2 = require("@htownautos/common");
const media_module_1 = require("./media/media.module");
const gallery_cache_module_1 = require("./gallery-cache/gallery-cache.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_1.PrismaModule,
            redis_1.RedisModule,
            rabbitmq_1.RabbitMQModule,
            auth_1.AuthModule,
            common_2.AuditModule,
            media_module_1.MediaModule,
            gallery_cache_module_1.GalleryCacheModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
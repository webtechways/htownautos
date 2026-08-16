"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShortUrlModule = void 0;
const common_1 = require("@nestjs/common");
const short_url_controller_1 = require("./short-url.controller");
const short_url_service_1 = require("./short-url.service");
const prisma_1 = require("@htownautos/prisma");
let ShortUrlModule = class ShortUrlModule {
};
exports.ShortUrlModule = ShortUrlModule;
exports.ShortUrlModule = ShortUrlModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule],
        controllers: [short_url_controller_1.ShortUrlController],
        providers: [short_url_service_1.ShortUrlService],
        exports: [short_url_service_1.ShortUrlService],
    })
], ShortUrlModule);
//# sourceMappingURL=short-url.module.js.map
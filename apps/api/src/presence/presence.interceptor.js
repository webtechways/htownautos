"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresenceInterceptor = void 0;
const common_1 = require("@nestjs/common");
const presence_service_1 = require("./presence.service");
let PresenceInterceptor = class PresenceInterceptor {
    presenceService;
    constructor(presenceService) {
        this.presenceService = presenceService;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const tenantId = request.tenant?.id || request.headers['x-tenant-id'];
        if (user?.id && tenantId) {
            this.presenceService.updateActivity(user.id, tenantId).catch(() => {
            });
        }
        return next.handle();
    }
};
exports.PresenceInterceptor = PresenceInterceptor;
exports.PresenceInterceptor = PresenceInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [presence_service_1.PresenceService])
], PresenceInterceptor);
//# sourceMappingURL=presence.interceptor.js.map
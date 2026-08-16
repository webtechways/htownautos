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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadSessionPublicController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_1 = require("@htownautos/auth");
const upload_session_service_1 = require("./upload-session.service");
const media_1 = require("@htownautos/media");
const media_2 = require("@htownautos/media");
let UploadSessionPublicController = class UploadSessionPublicController {
    uploadSessionService;
    constructor(uploadSessionService) {
        this.uploadSessionService = uploadSessionService;
    }
    async getSessionInfo(token) {
        return this.uploadSessionService.getPublicInfo(token);
    }
    async presign(token, dto) {
        return this.uploadSessionService.presign(token, dto);
    }
    async confirm(token, dto) {
        return this.uploadSessionService.confirm(token, dto);
    }
};
exports.UploadSessionPublicController = UploadSessionPublicController;
__decorate([
    (0, common_1.Get)(':token'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate token and get session info (public)' }),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadSessionPublicController.prototype, "getSessionInfo", null);
__decorate([
    (0, common_1.Post)(':token/presign'),
    (0, swagger_1.ApiOperation)({ summary: 'Presign an upload using session context (public)' }),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, media_1.PresignMediaDto]),
    __metadata("design:returntype", Promise)
], UploadSessionPublicController.prototype, "presign", null);
__decorate([
    (0, common_1.Post)(':token/confirm'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm an upload using session context (public)' }),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, media_2.ConfirmMediaDto]),
    __metadata("design:returntype", Promise)
], UploadSessionPublicController.prototype, "confirm", null);
exports.UploadSessionPublicController = UploadSessionPublicController = __decorate([
    (0, swagger_1.ApiTags)('Upload Sessions (Public)'),
    (0, common_1.Controller)('upload-sessions/public'),
    (0, auth_1.Public)(),
    (0, throttler_1.Throttle)({ default: { limit: 30, ttl: 60000 } }),
    __metadata("design:paramtypes", [upload_session_service_1.UploadSessionService])
], UploadSessionPublicController);
//# sourceMappingURL=upload-session-public.controller.js.map
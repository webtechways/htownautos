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
exports.UploadSessionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const upload_session_service_1 = require("./upload-session.service");
const create_upload_session_dto_1 = require("./dto/create-upload-session.dto");
let UploadSessionController = class UploadSessionController {
    uploadSessionService;
    constructor(uploadSessionService) {
        this.uploadSessionService = uploadSessionService;
    }
    async create(dto, req) {
        const userId = req.user?.id;
        const tenantId = req.user?.tenants?.[0]?.tenantId;
        return this.uploadSessionService.create(dto, userId, tenantId);
    }
    async getSessionMedia(token) {
        return this.uploadSessionService.getSessionMedia(token);
    }
    async close(token, req) {
        const userId = req.user?.id;
        return this.uploadSessionService.close(token, userId);
    }
};
exports.UploadSessionController = UploadSessionController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new upload session for phone uploads' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_upload_session_dto_1.CreateUploadSessionDto, Object]),
    __metadata("design:returntype", Promise)
], UploadSessionController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':token/media'),
    (0, swagger_1.ApiOperation)({ summary: 'Poll for media uploaded via this session' }),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadSessionController.prototype, "getSessionMedia", null);
__decorate([
    (0, common_1.Delete)(':token'),
    (0, swagger_1.ApiOperation)({ summary: 'Close/invalidate an upload session' }),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadSessionController.prototype, "close", null);
exports.UploadSessionController = UploadSessionController = __decorate([
    (0, swagger_1.ApiTags)('Upload Sessions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('upload-sessions'),
    __metadata("design:paramtypes", [upload_session_service_1.UploadSessionService])
], UploadSessionController);
//# sourceMappingURL=upload-session.controller.js.map
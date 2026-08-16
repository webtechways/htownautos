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
exports.EmailSendController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const email_messages_service_1 = require("./email-messages.service");
const auth_1 = require("@htownautos/auth");
const MAX_ATTACHMENT_BYTES = 7 * 1024 * 1024;
const MAX_TOTAL_ATTACHMENT_BYTES = 7 * 1024 * 1024;
class AttachmentDto {
    filename;
    contentType;
    content;
    size;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], AttachmentDto.prototype, "filename", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], AttachmentDto.prototype, "contentType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AttachmentDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(MAX_ATTACHMENT_BYTES),
    __metadata("design:type", Number)
], AttachmentDto.prototype, "size", void 0);
class SendEmailToBuyerBodyDto {
    subject;
    bodyHtml;
    bodyText;
    attachments;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(998),
    __metadata("design:type", String)
], SendEmailToBuyerBodyDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(1_000_000),
    __metadata("design:type", String)
], SendEmailToBuyerBodyDto.prototype, "bodyHtml", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1_000_000),
    __metadata("design:type", String)
], SendEmailToBuyerBodyDto.prototype, "bodyText", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(10),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => AttachmentDto),
    __metadata("design:type", Array)
], SendEmailToBuyerBodyDto.prototype, "attachments", void 0);
let EmailSendController = class EmailSendController {
    emailMessagesService;
    constructor(emailMessagesService) {
        this.emailMessagesService = emailMessagesService;
    }
    getTenantUserId(user, tenantId) {
        const tenantUser = user.tenants?.find((t) => t.tenantId === tenantId || t.tenant?.id === tenantId);
        if (!tenantUser) {
            throw new common_1.BadRequestException('User is not a member of this tenant');
        }
        return tenantUser.id;
    }
    sendToBuyer(tenantId, user, buyerId, body) {
        const tenantUserId = this.getTenantUserId(user, tenantId);
        if (body.attachments?.length) {
            const totalBytes = body.attachments.reduce((sum, a) => sum + (a.size ?? this.estimateBase64Bytes(a.content)), 0);
            if (totalBytes > MAX_TOTAL_ATTACHMENT_BYTES) {
                throw new common_1.BadRequestException(`Attachments exceed the ${Math.round(MAX_TOTAL_ATTACHMENT_BYTES / 1024 / 1024)}MB limit`);
            }
        }
        return this.emailMessagesService.sendToBuyer(tenantId, tenantUserId, buyerId, body);
    }
    estimateBase64Bytes(content) {
        const i = content.indexOf('base64,');
        const b64 = i >= 0 ? content.slice(i + 'base64,'.length) : content;
        return Math.floor((b64.length * 3) / 4);
    }
};
exports.EmailSendController = EmailSendController;
__decorate([
    (0, common_1.Post)('send-to-buyer/:buyerId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Send an email to a buyer',
        description: 'Sends an outbound email via AWS SES, records it, and emits a realtime event',
    }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Email sent and recorded' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input or SES failure' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Buyer not found' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, auth_1.CurrentUser)()),
    __param(2, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, SendEmailToBuyerBodyDto]),
    __metadata("design:returntype", void 0)
], EmailSendController.prototype, "sendToBuyer", null);
exports.EmailSendController = EmailSendController = __decorate([
    (0, swagger_1.ApiTags)('Email Sending'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('email'),
    __metadata("design:paramtypes", [email_messages_service_1.EmailMessagesService])
], EmailSendController);
//# sourceMappingURL=email-send.controller.js.map
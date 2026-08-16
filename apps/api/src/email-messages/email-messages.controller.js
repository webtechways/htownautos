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
exports.EmailMessagesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const email_messages_service_1 = require("./email-messages.service");
const create_email_message_dto_1 = require("./dto/create-email-message.dto");
const query_email_message_dto_1 = require("./dto/query-email-message.dto");
const auth_1 = require("@htownautos/auth");
const auth_2 = require("@htownautos/auth");
let EmailMessagesController = class EmailMessagesController {
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
    create(tenantId, createEmailMessageDto, user) {
        const tenantUserId = this.getTenantUserId(user, tenantId);
        return this.emailMessagesService.create(tenantId, createEmailMessageDto, tenantUserId);
    }
    findAll(tenantId, query) {
        return this.emailMessagesService.findAll(tenantId, query);
    }
    getStats(tenantId, buyerId, senderId) {
        return this.emailMessagesService.getEmailStats(tenantId, buyerId, senderId);
    }
    findByBuyer(tenantId, buyerId, query) {
        return this.emailMessagesService.findByBuyer(tenantId, buyerId, query);
    }
    getThread(tenantId, threadId, query) {
        return this.emailMessagesService.getThread(tenantId, threadId, query);
    }
    async downloadAttachment(tenantId, id, key, res) {
        if (!key)
            throw new common_1.BadRequestException('Missing "key" query parameter');
        const { url } = await this.emailMessagesService.getAttachmentDownloadUrl(tenantId, id, key, 300);
        res.redirect(302, url);
    }
    findOne(tenantId, id) {
        return this.emailMessagesService.findOne(tenantId, id);
    }
    update(tenantId, id, updateEmailMessageDto) {
        return this.emailMessagesService.update(tenantId, id, updateEmailMessageDto);
    }
    markAsRead(tenantId, id) {
        return this.emailMessagesService.markAsRead(tenantId, id);
    }
    markAllAsRead(tenantId, buyerId) {
        return this.emailMessagesService.markAllAsRead(tenantId, buyerId);
    }
    trackOpen(tenantId, id) {
        return this.emailMessagesService.trackOpen(tenantId, id);
    }
    trackClick(tenantId, id) {
        return this.emailMessagesService.trackClick(tenantId, id);
    }
    remove(tenantId, id) {
        return this.emailMessagesService.remove(tenantId, id);
    }
};
exports.EmailMessagesController = EmailMessagesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create an email message',
        description: 'Records an email message sent to or received from a buyer',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Email message created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Buyer not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, auth_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_email_message_dto_1.CreateEmailMessageDto, Object]),
    __metadata("design:returntype", void 0)
], EmailMessagesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all email messages',
        description: 'Retrieves all email messages for the current tenant with optional filters',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of email messages' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_email_message_dto_1.QueryEmailMessageDto]),
    __metadata("design:returntype", void 0)
], EmailMessagesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get email statistics',
        description: 'Retrieves email statistics for the tenant, optionally filtered by buyer or sender',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email statistics' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Query)('buyerId')),
    __param(2, (0, common_1.Query)('senderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], EmailMessagesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('by-buyer/:buyerId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get email messages by buyer',
        description: 'Retrieves all email messages related to a specific buyer',
    }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'List of email messages for the buyer' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, query_email_message_dto_1.QueryEmailMessageDto]),
    __metadata("design:returntype", void 0)
], EmailMessagesController.prototype, "findByBuyer", null);
__decorate([
    (0, common_1.Get)('thread/:threadId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get email thread',
        description: 'Retrieves all emails in a specific thread (chronological order)',
    }),
    (0, swagger_1.ApiParam)({ name: 'threadId', description: 'Thread ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Thread emails' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('threadId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, query_email_message_dto_1.QueryEmailMessageDto]),
    __metadata("design:returntype", void 0)
], EmailMessagesController.prototype, "getThread", null);
__decorate([
    (0, common_1.Get)(':id/attachments/download'),
    (0, swagger_1.ApiOperation)({
        summary: 'Download an email attachment',
        description: 'Generates a short-lived presigned URL for an attachment stored in S3 ' +
            'and redirects to it. The attachment key must belong to the email, and ' +
            'the email must belong to the current tenant.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Email message UUID' }),
    (0, swagger_1.ApiResponse)({ status: 302, description: 'Redirect to presigned URL' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Email or attachment not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('key')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], EmailMessagesController.prototype, "downloadAttachment", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get email message by ID',
        description: 'Retrieves a single email message by its UUID',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Email message UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email message found' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Email message not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EmailMessagesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update email message',
        description: 'Updates an email message record',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Email message UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email message updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Email message not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_email_message_dto_1.UpdateEmailMessageDto]),
    __metadata("design:returntype", void 0)
], EmailMessagesController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark email as read',
        description: 'Marks an email message as read',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Email message UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email message marked as read' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Email message not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EmailMessagesController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Patch)('by-buyer/:buyerId/read-all'),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark all emails as read for a buyer',
        description: 'Marks all unread emails from a buyer as read',
    }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All emails marked as read' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EmailMessagesController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Patch)(':id/track-open'),
    (0, swagger_1.ApiOperation)({
        summary: 'Track email open',
        description: 'Increments the open count for an email (for tracking pixels)',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Email message UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Open tracked' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EmailMessagesController.prototype, "trackOpen", null);
__decorate([
    (0, common_1.Patch)(':id/track-click'),
    (0, swagger_1.ApiOperation)({
        summary: 'Track email click',
        description: 'Increments the click count for an email',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Email message UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Click tracked' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EmailMessagesController.prototype, "trackClick", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete email message',
        description: 'Permanently deletes an email message record',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Email message UUID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email message deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Email message not found' }),
    __param(0, (0, auth_2.CurrentTenant)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], EmailMessagesController.prototype, "remove", null);
exports.EmailMessagesController = EmailMessagesController = __decorate([
    (0, swagger_1.ApiTags)('Email Messages'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('email-messages'),
    __metadata("design:paramtypes", [email_messages_service_1.EmailMessagesService])
], EmailMessagesController);
//# sourceMappingURL=email-messages.controller.js.map
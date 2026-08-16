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
exports.UpdateEmailMessageDto = exports.CreateEmailMessageDto = exports.BounceType = exports.EmailPriority = exports.EmailStatus = exports.EmailDirection = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var EmailDirection;
(function (EmailDirection) {
    EmailDirection["INBOUND"] = "inbound";
    EmailDirection["OUTBOUND"] = "outbound";
})(EmailDirection || (exports.EmailDirection = EmailDirection = {}));
var EmailStatus;
(function (EmailStatus) {
    EmailStatus["DRAFT"] = "draft";
    EmailStatus["QUEUED"] = "queued";
    EmailStatus["SENT"] = "sent";
    EmailStatus["DELIVERED"] = "delivered";
    EmailStatus["BOUNCED"] = "bounced";
    EmailStatus["FAILED"] = "failed";
    EmailStatus["OPENED"] = "opened";
    EmailStatus["CLICKED"] = "clicked";
})(EmailStatus || (exports.EmailStatus = EmailStatus = {}));
var EmailPriority;
(function (EmailPriority) {
    EmailPriority["HIGH"] = "high";
    EmailPriority["NORMAL"] = "normal";
    EmailPriority["LOW"] = "low";
})(EmailPriority || (exports.EmailPriority = EmailPriority = {}));
var BounceType;
(function (BounceType) {
    BounceType["HARD"] = "hard";
    BounceType["SOFT"] = "soft";
    BounceType["TRANSIENT"] = "transient";
})(BounceType || (exports.BounceType = BounceType = {}));
class CreateEmailMessageDto {
    buyerId;
    direction;
    status;
    fromEmail;
    toEmail;
    replyTo;
    ccEmails;
    bccEmails;
    subject;
    bodyHtml;
    bodyText;
    threadId;
    inReplyTo;
    references;
    attachments;
    attachmentCount;
    messageId;
    sesStatus;
    bounceType;
    bounceSubType;
    complaintType;
    isRead;
    openCount;
    clickCount;
    priority;
    labels;
    scheduledAt;
    sentAt;
    deliveredAt;
    bouncedAt;
}
exports.CreateEmailMessageDto = CreateEmailMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Buyer ID' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "buyerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: EmailDirection, description: 'Email direction' }),
    (0, class_validator_1.IsEnum)(EmailDirection),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "direction", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: EmailStatus, description: 'Email status', default: EmailStatus.SENT }),
    (0, class_validator_1.IsEnum)(EmailStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sender email address' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "fromEmail", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient email address' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "toEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Reply-to address' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "replyTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'CC email addresses', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateEmailMessageDto.prototype, "ccEmails", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'BCC email addresses', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateEmailMessageDto.prototype, "bccEmails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Email subject' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(998),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'HTML body content' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "bodyHtml", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Plain text body content' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "bodyText", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Thread ID for grouping emails' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "threadId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Message-ID of email being replied to' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "inReplyTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Array of Message-IDs in thread', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateEmailMessageDto.prototype, "references", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Attachment metadata array' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateEmailMessageDto.prototype, "attachments", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of attachments', default: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmailMessageDto.prototype, "attachmentCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'AWS SES Message ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "messageId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SES delivery status' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "sesStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: BounceType, description: 'Bounce type if bounced' }),
    (0, class_validator_1.IsEnum)(BounceType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "bounceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Bounce sub-type' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "bounceSubType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Complaint type if complaint received' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "complaintType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Has the email been read', default: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateEmailMessageDto.prototype, "isRead", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of times opened', default: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmailMessageDto.prototype, "openCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of link clicks', default: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateEmailMessageDto.prototype, "clickCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: EmailPriority, description: 'Email priority' }),
    (0, class_validator_1.IsEnum)(EmailPriority),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Labels/tags for the email', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateEmailMessageDto.prototype, "labels", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Scheduled send time' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "scheduledAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'When the email was sent' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "sentAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'When the email was delivered' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "deliveredAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'When the email bounced' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEmailMessageDto.prototype, "bouncedAt", void 0);
class UpdateEmailMessageDto extends (0, swagger_1.PartialType)(CreateEmailMessageDto) {
}
exports.UpdateEmailMessageDto = UpdateEmailMessageDto;
//# sourceMappingURL=create-email-message.dto.js.map
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
exports.UpdateSmsDto = exports.CreateSmsDto = exports.SmsStatus = exports.SmsDirection = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var SmsDirection;
(function (SmsDirection) {
    SmsDirection["INBOUND"] = "inbound";
    SmsDirection["OUTBOUND"] = "outbound";
})(SmsDirection || (exports.SmsDirection = SmsDirection = {}));
var SmsStatus;
(function (SmsStatus) {
    SmsStatus["QUEUED"] = "queued";
    SmsStatus["SENT"] = "sent";
    SmsStatus["DELIVERED"] = "delivered";
    SmsStatus["FAILED"] = "failed";
    SmsStatus["RECEIVED"] = "received";
    SmsStatus["UNDELIVERED"] = "undelivered";
})(SmsStatus || (exports.SmsStatus = SmsStatus = {}));
class CreateSmsDto {
    buyerId;
    direction;
    status;
    phoneNumber;
    fromNumber;
    toNumber;
    body;
    messageSid;
    errorCode;
    errorMessage;
    mediaUrls;
    numMedia;
    price;
    priceUnit;
    segmentCount;
    isRead;
    sentAt;
    deliveredAt;
}
exports.CreateSmsDto = CreateSmsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Buyer ID' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSmsDto.prototype, "buyerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: SmsDirection, description: 'Message direction' }),
    (0, class_validator_1.IsEnum)(SmsDirection),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSmsDto.prototype, "direction", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: SmsStatus, description: 'Message status', default: SmsStatus.SENT }),
    (0, class_validator_1.IsEnum)(SmsStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSmsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Phone number of the buyer' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSmsDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Sender phone number (Twilio number for outbound)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSmsDto.prototype, "fromNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient phone number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSmsDto.prototype, "toNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message content' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(1600),
    __metadata("design:type", String)
], CreateSmsDto.prototype, "body", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Twilio Message SID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSmsDto.prototype, "messageSid", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Twilio error code if failed' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSmsDto.prototype, "errorCode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Twilio error message if failed' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSmsDto.prototype, "errorMessage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Array of media URLs for MMS', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateSmsDto.prototype, "mediaUrls", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of media attachments', default: 0 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSmsDto.prototype, "numMedia", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cost of the message' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSmsDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Currency (e.g., USD)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSmsDto.prototype, "priceUnit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of SMS segments', default: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSmsDto.prototype, "segmentCount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Has the message been read', default: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateSmsDto.prototype, "isRead", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'When the message was sent' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSmsDto.prototype, "sentAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'When the message was delivered' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSmsDto.prototype, "deliveredAt", void 0);
class UpdateSmsDto extends (0, swagger_1.PartialType)(CreateSmsDto) {
}
exports.UpdateSmsDto = UpdateSmsDto;
//# sourceMappingURL=create-sms.dto.js.map
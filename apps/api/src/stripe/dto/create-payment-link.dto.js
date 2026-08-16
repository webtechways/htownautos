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
exports.CreatePaymentLinkDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreatePaymentLinkDto {
    amount;
    description;
    note;
    deliveryMethod;
}
exports.CreatePaymentLinkDto = CreatePaymentLinkDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount in cents (e.g., 5000 = $50.00)',
        example: 5000,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(50),
    __metadata("design:type", Number)
], CreatePaymentLinkDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Charge description shown in Stripe',
        example: 'Down payment for 2024 Toyota Camry',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePaymentLinkDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Message note sent to the customer along with the link. Not required ' +
            "when deliveryMethod is 'link' (generate-only, nothing is sent).",
        example: 'Hi! Please use this link to complete your payment.',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePaymentLinkDto.prototype, "note", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Delivery method. 'sms'/'email' send the link to the customer; " +
            "'link' only generates the URL and returns it (staff copies/sends it manually).",
        enum: ['sms', 'email', 'link'],
        example: 'sms',
    }),
    (0, class_validator_1.IsIn)(['sms', 'email', 'link']),
    __metadata("design:type", String)
], CreatePaymentLinkDto.prototype, "deliveryMethod", void 0);
//# sourceMappingURL=create-payment-link.dto.js.map
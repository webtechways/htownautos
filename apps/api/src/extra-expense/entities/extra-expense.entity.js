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
exports.ExtraExpenseEntity = void 0;
const swagger_1 = require("@nestjs/swagger");
class ExtraExpenseEntity {
    id;
    vehicleId;
    description;
    price;
    shippingCost;
    tax;
    receipts;
    createdAt;
    updatedAt;
    metaValue;
    tenantId;
    paidByUserId;
    paidByUser;
    constructor(partial) {
        Object.assign(this, partial);
        if (partial.price !== undefined) {
            this.price = Number(partial.price);
        }
        if (partial.shippingCost !== undefined) {
            this.shippingCost = Number(partial.shippingCost);
        }
        if (partial.tax !== undefined) {
            this.tax = Number(partial.tax);
        }
    }
}
exports.ExtraExpenseEntity = ExtraExpenseEntity;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    __metadata("design:type", String)
], ExtraExpenseEntity.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123e4567-e89b-12d3-a456-426614174001' }),
    __metadata("design:type", String)
], ExtraExpenseEntity.prototype, "vehicleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'New tires' }),
    __metadata("design:type", String)
], ExtraExpenseEntity.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 450.0, type: Number }),
    __metadata("design:type", Number)
], ExtraExpenseEntity.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25.0, type: Number }),
    __metadata("design:type", Number)
], ExtraExpenseEntity.prototype, "shippingCost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 36.0, type: Number }),
    __metadata("design:type", Number)
], ExtraExpenseEntity.prototype, "tax", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Receipt images', type: 'array' }),
    __metadata("design:type", Array)
], ExtraExpenseEntity.prototype, "receipts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-12T10:30:00.000Z' }),
    __metadata("design:type", Date)
], ExtraExpenseEntity.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-12T10:30:00.000Z' }),
    __metadata("design:type", Date)
], ExtraExpenseEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], ExtraExpenseEntity.prototype, "metaValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '123e4567-e89b-12d3-a456-426614174003' }),
    __metadata("design:type", Object)
], ExtraExpenseEntity.prototype, "tenantId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '123e4567-e89b-12d3-a456-426614174002' }),
    __metadata("design:type", Object)
], ExtraExpenseEntity.prototype, "paidByUserId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User who paid for this expense' }),
    __metadata("design:type", Object)
], ExtraExpenseEntity.prototype, "paidByUser", void 0);
//# sourceMappingURL=extra-expense.entity.js.map
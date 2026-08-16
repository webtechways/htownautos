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
exports.CreatePartAndAssociateDto = exports.UpdateVehiclePartDto = exports.CreateVehiclePartDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateVehiclePartDto {
    partId;
    quantity;
    priceAtTime;
    notes;
}
exports.CreateVehiclePartDto = CreateVehiclePartDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the part from inventory' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateVehiclePartDto.prototype, "partId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Quantity to use', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateVehiclePartDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Override price at time of association' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateVehiclePartDto.prototype, "priceAtTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notes about the installation' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVehiclePartDto.prototype, "notes", void 0);
class UpdateVehiclePartDto {
    quantity;
    priceAtTime;
    notes;
}
exports.UpdateVehiclePartDto = UpdateVehiclePartDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Quantity used for this vehicle' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateVehiclePartDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Unit price at time of association' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateVehiclePartDto.prototype, "priceAtTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Installation notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateVehiclePartDto.prototype, "notes", void 0);
class CreatePartAndAssociateDto {
    name;
    partNumber;
    sku;
    description;
    conditionId;
    statusId;
    categoryId;
    cost;
    price;
    quantity;
    quantityToUse;
    notes;
}
exports.CreatePartAndAssociateDto = CreatePartAndAssociateDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Part name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartAndAssociateDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'OEM or custom part number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartAndAssociateDto.prototype, "partNumber", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'SKU' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartAndAssociateDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Part description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartAndAssociateDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Condition ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePartAndAssociateDto.prototype, "conditionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Status ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePartAndAssociateDto.prototype, "statusId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Category ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreatePartAndAssociateDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cost price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePartAndAssociateDto.prototype, "cost", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Selling price' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePartAndAssociateDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total quantity in inventory' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePartAndAssociateDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity to use for this vehicle' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePartAndAssociateDto.prototype, "quantityToUse", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Installation notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartAndAssociateDto.prototype, "notes", void 0);
//# sourceMappingURL=vehicle-part.dto.js.map
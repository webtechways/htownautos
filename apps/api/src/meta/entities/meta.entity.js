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
exports.Meta = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_meta_dto_1 = require("../dto/create-meta.dto");
class Meta {
    id;
    entityType;
    entityId;
    userId;
    key;
    value;
    valueType;
    description;
    isPublic;
    isSystem;
    isActive;
    isDeleted;
    createdAt;
    updatedAt;
}
exports.Meta = Meta;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], Meta.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: create_meta_dto_1.MetaEntityType }),
    __metadata("design:type", String)
], Meta.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], Meta.prototype, "entityId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, nullable: true }),
    __metadata("design:type", Object)
], Meta.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], Meta.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], Meta.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: create_meta_dto_1.MetaValueType }),
    __metadata("design:type", String)
], Meta.prototype, "valueType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, nullable: true }),
    __metadata("design:type", Object)
], Meta.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], Meta.prototype, "isPublic", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], Meta.prototype, "isSystem", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], Meta.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], Meta.prototype, "isDeleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], Meta.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], Meta.prototype, "updatedAt", void 0);
//# sourceMappingURL=meta.entity.js.map
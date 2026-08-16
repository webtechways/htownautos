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
exports.UpdateSocialGroupDto = exports.CreateSocialGroupDto = exports.ManualConnectSocialAccountDto = exports.ConnectSocialAccountDto = exports.SocialPlatform = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var SocialPlatform;
(function (SocialPlatform) {
    SocialPlatform["FACEBOOK"] = "facebook";
    SocialPlatform["INSTAGRAM"] = "instagram";
    SocialPlatform["TIKTOK"] = "tiktok";
    SocialPlatform["YOUTUBE"] = "youtube";
    SocialPlatform["LINKEDIN"] = "linkedin";
    SocialPlatform["PINTEREST"] = "pinterest";
    SocialPlatform["THREADS"] = "threads";
    SocialPlatform["BLUESKY"] = "bluesky";
    SocialPlatform["GBP"] = "gbp";
})(SocialPlatform || (exports.SocialPlatform = SocialPlatform = {}));
class ConnectSocialAccountDto {
    platform;
    code;
    redirectUri;
}
exports.ConnectSocialAccountDto = ConnectSocialAccountDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: SocialPlatform }),
    (0, class_validator_1.IsEnum)(SocialPlatform),
    __metadata("design:type", String)
], ConnectSocialAccountDto.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConnectSocialAccountDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConnectSocialAccountDto.prototype, "redirectUri", void 0);
class ManualConnectSocialAccountDto {
    platform;
    platformAccountId;
    name;
    username;
    avatarUrl;
    accessToken;
    refreshToken;
    pageId;
    scopes;
}
exports.ManualConnectSocialAccountDto = ManualConnectSocialAccountDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: SocialPlatform }),
    (0, class_validator_1.IsEnum)(SocialPlatform),
    __metadata("design:type", String)
], ManualConnectSocialAccountDto.prototype, "platform", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ManualConnectSocialAccountDto.prototype, "platformAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ManualConnectSocialAccountDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ManualConnectSocialAccountDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ManualConnectSocialAccountDto.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ManualConnectSocialAccountDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ManualConnectSocialAccountDto.prototype, "refreshToken", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ManualConnectSocialAccountDto.prototype, "pageId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], ManualConnectSocialAccountDto.prototype, "scopes", void 0);
class CreateSocialGroupDto {
    name;
    accountIds;
}
exports.CreateSocialGroupDto = CreateSocialGroupDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSocialGroupDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)(undefined, { each: true }),
    __metadata("design:type", Array)
], CreateSocialGroupDto.prototype, "accountIds", void 0);
class UpdateSocialGroupDto {
    name;
    accountIds;
}
exports.UpdateSocialGroupDto = UpdateSocialGroupDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSocialGroupDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUUID)(undefined, { each: true }),
    __metadata("design:type", Array)
], UpdateSocialGroupDto.prototype, "accountIds", void 0);
//# sourceMappingURL=index.js.map
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
exports.BuyerMatchExclusionsController = exports.BuyerVehiclePreferencesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const buyer_vehicle_preferences_service_1 = require("./buyer-vehicle-preferences.service");
const create_buyer_vehicle_preference_dto_1 = require("./dto/create-buyer-vehicle-preference.dto");
const update_buyer_vehicle_preference_dto_1 = require("./dto/update-buyer-vehicle-preference.dto");
const create_buyer_match_exclusion_dto_1 = require("./dto/create-buyer-match-exclusion.dto");
const auth_1 = require("@htownautos/auth");
let BuyerVehiclePreferencesController = class BuyerVehiclePreferencesController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(tenantId, buyerId) {
        return this.service.list(buyerId, tenantId);
    }
    matches(tenantId, buyerId, inspectableOnly, trustedSeller) {
        return this.service.matches(buyerId, tenantId, inspectableOnly === 'true', trustedSeller === 'true');
    }
    create(tenantId, userId, buyerId, dto) {
        return this.service.create(buyerId, tenantId, userId, dto);
    }
    update(tenantId, buyerId, id, dto) {
        return this.service.update(id, buyerId, tenantId, dto);
    }
    remove(tenantId, buyerId, id) {
        return this.service.remove(id, buyerId, tenantId);
    }
};
exports.BuyerVehiclePreferencesController = BuyerVehiclePreferencesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "List a buyer's wanted vehicle preferences" }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BuyerVehiclePreferencesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('matches'),
    (0, swagger_1.ApiOperation)({
        summary: 'Auction listings matching the buyer preferences',
        description: 'Returns all active (non-stale) auction listings that satisfy at ' +
            'least one of the buyer\'s wanted vehicles. Listings whose highBid ' +
            'already exceeds that preference\'s maxCost are excluded. ' +
            'Pass inspectableOnly=true to restrict to yards with physical inspection available.',
    }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('inspectableOnly')),
    __param(3, (0, common_1.Query)('trustedSeller')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], BuyerVehiclePreferencesController.prototype, "matches", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Add a wanted vehicle preference for a buyer' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, auth_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, create_buyer_vehicle_preference_dto_1.CreateBuyerVehiclePreferenceDto]),
    __metadata("design:returntype", void 0)
], BuyerVehiclePreferencesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a wanted vehicle preference' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Preference UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, update_buyer_vehicle_preference_dto_1.UpdateBuyerVehiclePreferenceDto]),
    __metadata("design:returntype", void 0)
], BuyerVehiclePreferencesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a wanted vehicle preference' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Preference UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], BuyerVehiclePreferencesController.prototype, "remove", null);
exports.BuyerVehiclePreferencesController = BuyerVehiclePreferencesController = __decorate([
    (0, swagger_1.ApiTags)('Buyer Vehicle Preferences'),
    (0, common_1.Controller)('buyers/:buyerId/vehicle-preferences'),
    (0, common_1.UseGuards)(auth_1.ClerkJwtGuard),
    __metadata("design:paramtypes", [buyer_vehicle_preferences_service_1.BuyerVehiclePreferencesService])
], BuyerVehiclePreferencesController);
let BuyerMatchExclusionsController = class BuyerMatchExclusionsController {
    service;
    constructor(service) {
        this.service = service;
    }
    list(tenantId, buyerId) {
        return this.service.listExclusions(buyerId, tenantId);
    }
    add(tenantId, userId, buyerId, dto) {
        return this.service.addExclusion(buyerId, tenantId, dto.lotNumber, userId ?? null);
    }
    reset(tenantId, buyerId) {
        return this.service.resetExclusions(buyerId, tenantId);
    }
    removeSingle(tenantId, buyerId, lotNumber) {
        return this.service.removeExclusion(buyerId, tenantId, lotNumber);
    }
};
exports.BuyerMatchExclusionsController = BuyerMatchExclusionsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List dismissed lot numbers for a buyer' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BuyerMatchExclusionsController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Dismiss (exclude) a lot from the buyer matching list' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, auth_1.CurrentUser)('sub')),
    __param(2, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, create_buyer_match_exclusion_dto_1.CreateBuyerMatchExclusionDto]),
    __metadata("design:returntype", void 0)
], BuyerMatchExclusionsController.prototype, "add", null);
__decorate([
    (0, common_1.Delete)('reset'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reset all exclusions for a buyer (restores original matching)' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], BuyerMatchExclusionsController.prototype, "reset", null);
__decorate([
    (0, common_1.Delete)(':lotNumber'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Un-dismiss a single lot from the exclusion list' }),
    (0, swagger_1.ApiParam)({ name: 'buyerId', description: 'Buyer UUID' }),
    (0, swagger_1.ApiParam)({ name: 'lotNumber', description: 'Lot number (numeric string)' }),
    __param(0, (0, auth_1.CurrentTenant)()),
    __param(1, (0, common_1.Param)('buyerId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Param)('lotNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], BuyerMatchExclusionsController.prototype, "removeSingle", null);
exports.BuyerMatchExclusionsController = BuyerMatchExclusionsController = __decorate([
    (0, swagger_1.ApiTags)('Buyer Vehicle Preferences'),
    (0, common_1.Controller)('buyers/:buyerId/match-exclusions'),
    __metadata("design:paramtypes", [buyer_vehicle_preferences_service_1.BuyerVehiclePreferencesService])
], BuyerMatchExclusionsController);
//# sourceMappingURL=buyer-vehicle-preferences.controller.js.map
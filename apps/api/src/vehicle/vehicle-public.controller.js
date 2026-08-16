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
exports.VehiclePublicController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const throttler_1 = require("@nestjs/throttler");
const auth_1 = require("@htownautos/auth");
const vehicle_service_1 = require("./vehicle.service");
let VehiclePublicController = class VehiclePublicController {
    vehicleService;
    constructor(vehicleService) {
        this.vehicleService = vehicleService;
    }
    async findOnePublic(id) {
        return this.vehicleService.findOnePublic(id);
    }
};
exports.VehiclePublicController = VehiclePublicController;
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get public vehicle details',
        description: 'Retrieves public vehicle information for landing pages. No authentication required.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Vehicle UUID',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Public vehicle data',
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Vehicle not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehiclePublicController.prototype, "findOnePublic", null);
exports.VehiclePublicController = VehiclePublicController = __decorate([
    (0, swagger_1.ApiTags)('Vehicles (Public)'),
    (0, common_1.Controller)('public/vehicles'),
    (0, auth_1.Public)(),
    (0, throttler_1.Throttle)({ default: { limit: 60, ttl: 60000 } }),
    __metadata("design:paramtypes", [vehicle_service_1.VehicleService])
], VehiclePublicController);
//# sourceMappingURL=vehicle-public.controller.js.map
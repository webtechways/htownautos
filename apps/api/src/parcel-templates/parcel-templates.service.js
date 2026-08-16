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
var ParcelTemplatesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelTemplatesService = exports.CreateParcelTemplateDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
const shippo_service_1 = require("../shippo/shippo.service");
var parcel_template_dto_1 = require("./dto/parcel-template.dto");
Object.defineProperty(exports, "CreateParcelTemplateDto", { enumerable: true, get: function () { return parcel_template_dto_1.CreateParcelTemplateDto; } });
let ParcelTemplatesService = ParcelTemplatesService_1 = class ParcelTemplatesService {
    prisma;
    shippo;
    logger = new common_1.Logger(ParcelTemplatesService_1.name);
    constructor(prisma, shippo) {
        this.prisma = prisma;
        this.shippo = shippo;
    }
    async findAll(tenantId) {
        const custom = await this.prisma.parcelTemplate.findMany({
            where: { tenantId, isActive: true },
            orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
        });
        const upsTemplates = await this.shippo.listUpsCarrierParcelTemplates();
        return {
            custom,
            carrier: upsTemplates,
        };
    }
    async findOne(tenantId, id) {
        const template = await this.prisma.parcelTemplate.findFirst({
            where: { id, tenantId },
        });
        if (!template)
            throw new common_1.NotFoundException(`Parcel template ${id} not found`);
        return template;
    }
    async create(tenantId, dto) {
        this.logger.log(`Creating parcel template for tenant ${tenantId}: ${JSON.stringify(dto)}`);
        try {
            if (dto.isDefault) {
                await this.prisma.parcelTemplate.updateMany({
                    where: { tenantId, isDefault: true },
                    data: { isDefault: false },
                });
            }
            let shippoObjectId = dto.shippoTemplateToken;
            if (!dto.shippoTemplateToken) {
                try {
                    const shippoResponse = await this.shippo.createUserParcelTemplate({
                        name: dto.name,
                        length: dto.length,
                        width: dto.width,
                        height: dto.height,
                        distanceUnit: (dto.distanceUnit || 'in'),
                        weight: dto.defaultWeight,
                        weightUnit: (dto.massUnit || 'lb'),
                    });
                    shippoObjectId =
                        shippoResponse?.objectId || shippoResponse?.object_id || undefined;
                    this.logger.log(`Shippo returned objectId=${shippoObjectId} for "${dto.name}"`);
                }
                catch (err) {
                    this.logger.warn(`Shippo user template creation failed, saving local-only: ${err.message}`);
                }
            }
            const result = await this.prisma.parcelTemplate.create({
                data: {
                    tenantId,
                    name: dto.name,
                    carrier: dto.carrier,
                    shippoTemplateToken: shippoObjectId,
                    length: dto.length,
                    width: dto.width,
                    height: dto.height,
                    distanceUnit: dto.distanceUnit || 'in',
                    defaultWeight: dto.defaultWeight,
                    massUnit: dto.massUnit || 'lb',
                    isDefault: dto.isDefault ?? false,
                },
            });
            this.logger.log(`Created parcel template ${result.id} (${result.name}) shippoObjectId=${shippoObjectId ?? 'none'}`);
            return result;
        }
        catch (err) {
            this.logger.error(`Failed to create parcel template: ${err.message}`, err.stack);
            throw err;
        }
    }
    async update(tenantId, id, dto) {
        const existing = await this.findOne(tenantId, id);
        if (dto.isDefault) {
            await this.prisma.parcelTemplate.updateMany({
                where: { tenantId, isDefault: true, id: { not: id } },
                data: { isDefault: false },
            });
        }
        const token = existing.shippoTemplateToken;
        const looksLikeCarrierPreset = !!token && /^(UPS_|FedEx_|USPS_)/i.test(token);
        if (token && !looksLikeCarrierPreset) {
            const merged = {
                name: dto.name ?? existing.name,
                length: dto.length ?? Number(existing.length),
                width: dto.width ?? Number(existing.width),
                height: dto.height ?? Number(existing.height),
                distanceUnit: (dto.distanceUnit ?? existing.distanceUnit),
                weight: dto.defaultWeight ??
                    (existing.defaultWeight != null ? Number(existing.defaultWeight) : undefined),
                weightUnit: (dto.massUnit ?? existing.massUnit),
            };
            try {
                await this.shippo.updateUserParcelTemplate(token, merged);
            }
            catch (err) {
                this.logger.warn(`Shippo update failed but continuing with local update: ${err.message}`);
            }
        }
        return this.prisma.parcelTemplate.update({
            where: { id },
            data: dto,
        });
    }
    async remove(tenantId, id) {
        const template = await this.findOne(tenantId, id);
        this.logger.log(`Removing parcel template ${id} (${template.name}) shippoTemplateToken=${template.shippoTemplateToken ?? 'none'}`);
        const token = template.shippoTemplateToken;
        const looksLikeCarrierPreset = !!token && /^(UPS_|FedEx_|USPS_)/i.test(token);
        if (token && !looksLikeCarrierPreset) {
            try {
                await this.shippo.deleteUserParcelTemplate(token);
            }
            catch (err) {
                this.logger.warn(`Shippo delete failed but continuing with local delete: ${err.message}`);
            }
        }
        else if (token && looksLikeCarrierPreset) {
            this.logger.log(`Skipping Shippo delete for carrier preset token "${token}"`);
        }
        else {
            this.logger.warn(`No shippoTemplateToken on template ${id} — nothing to delete from Shippo. ` +
                `This means the template was created before Shippo sync was wired up, or create failed on the Shippo side.`);
        }
        await this.prisma.parcelTemplate.update({
            where: { id },
            data: { isActive: false },
        });
        return { message: 'Parcel template deleted' };
    }
    async recommend(tenantId, params) {
        const sorted = [params.length, params.width, params.height].sort((a, b) => b - a);
        const custom = await this.prisma.parcelTemplate.findMany({
            where: { tenantId, isActive: true },
        });
        const carrier = await this.shippo.listUpsCarrierParcelTemplates();
        const candidates = [
            ...custom.map((c) => ({
                name: c.name,
                length: Number(c.length),
                width: Number(c.width),
                height: Number(c.height),
                source: 'custom',
                id: c.id,
            })),
            ...carrier.map((t) => ({
                name: t.name,
                length: Number(t.length),
                width: Number(t.width),
                height: Number(t.height),
                source: 'carrier',
                carrier: t.carrier,
                token: t.token,
            })),
        ];
        const fitting = candidates.filter((c) => {
            const cDims = [c.length, c.width, c.height].sort((a, b) => b - a);
            return cDims[0] >= sorted[0] && cDims[1] >= sorted[1] && cDims[2] >= sorted[2];
        });
        if (fitting.length === 0) {
            return {
                recommended: null,
                reason: 'No template fits — use custom parcel',
                itemDimensions: sorted,
            };
        }
        fitting.sort((a, b) => {
            const vA = a.length * a.width * a.height;
            const vB = b.length * b.width * b.height;
            return vA - vB;
        });
        return { recommended: fitting[0], alternatives: fitting.slice(1, 5) };
    }
};
exports.ParcelTemplatesService = ParcelTemplatesService;
exports.ParcelTemplatesService = ParcelTemplatesService = ParcelTemplatesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService,
        shippo_service_1.ShippoService])
], ParcelTemplatesService);
//# sourceMappingURL=parcel-templates.service.js.map
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
exports.RebuildService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
let RebuildService = class RebuildService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByVehicle(vehicleId) {
        return this.prisma.rebuildItem.findMany({
            where: { vehicleId },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async create(vehicleId, data) {
        const maxOrder = await this.prisma.rebuildItem.aggregate({
            where: { vehicleId },
            _max: { sortOrder: true },
        });
        return this.prisma.rebuildItem.create({
            data: {
                vehicleId,
                side: data.side,
                damageDescription: data.damageDescription || null,
                tenantId: data.tenantId || null,
                sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
            },
        });
    }
    async update(id, data) {
        const item = await this.prisma.rebuildItem.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException(`Rebuild item ${id} not found`);
        return this.prisma.rebuildItem.update({
            where: { id },
            data: {
                ...(data.side !== undefined && { side: data.side }),
                ...(data.damageDescription !== undefined && { damageDescription: data.damageDescription }),
                ...(data.photosBefore !== undefined && { photosBefore: data.photosBefore }),
                ...(data.photosAfter !== undefined && { photosAfter: data.photosAfter }),
                ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
            },
        });
    }
    async remove(id) {
        const item = await this.prisma.rebuildItem.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException(`Rebuild item ${id} not found`);
        await this.prisma.rebuildItem.delete({ where: { id } });
        return { message: `Rebuild item deleted` };
    }
};
exports.RebuildService = RebuildService;
exports.RebuildService = RebuildService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], RebuildService);
//# sourceMappingURL=rebuild.service.js.map
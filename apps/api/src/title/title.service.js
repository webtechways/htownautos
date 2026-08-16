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
exports.TitleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
let TitleService = class TitleService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    includeRelations = {
        titleStatus: true,
        brandStatus: true,
        frontImage: true,
        backImage: true,
    };
    async findByVehicle(vehicleId) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: vehicleId },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException(`Vehicle with ID ${vehicleId} not found`);
        }
        const title = await this.prisma.title.findFirst({
            where: { vehicleId },
            include: this.includeRelations,
            orderBy: { createdAt: 'desc' },
        });
        return title;
    }
    async upsert(vehicleId, dto) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: vehicleId },
        });
        if (!vehicle) {
            throw new common_1.NotFoundException(`Vehicle with ID ${vehicleId} not found`);
        }
        const existing = await this.prisma.title.findFirst({
            where: { vehicleId },
            orderBy: { createdAt: 'desc' },
        });
        const data = {};
        if (dto.titleNumber !== undefined)
            data.titleNumber = dto.titleNumber;
        if (dto.titleState !== undefined)
            data.titleState = dto.titleState;
        if (dto.titleStatusId !== undefined)
            data.titleStatusId = dto.titleStatusId;
        if (dto.brandStatusId !== undefined)
            data.brandStatusId = dto.brandStatusId;
        if (dto.titleReceivedDate !== undefined)
            data.titleReceivedDate = dto.titleReceivedDate;
        if (dto.titleIssueDate !== undefined)
            data.titleIssueDate = dto.titleIssueDate;
        if (dto.titleSentDate !== undefined)
            data.titleSentDate = dto.titleSentDate;
        if (dto.transferDate !== undefined)
            data.transferDate = dto.transferDate;
        if (dto.titleAppNumber !== undefined)
            data.titleAppNumber = dto.titleAppNumber;
        if (dto.frontImageId !== undefined)
            data.frontImageId = dto.frontImageId || null;
        if (dto.backImageId !== undefined)
            data.backImageId = dto.backImageId || null;
        if (existing) {
            const record = await this.prisma.title.update({
                where: { id: existing.id },
                data,
                include: this.includeRelations,
            });
            return record;
        }
        const record = await this.prisma.title.create({
            data: {
                vehicleId,
                titleNumber: dto.titleNumber || undefined,
                titleState: dto.titleState || undefined,
                titleStatusId: dto.titleStatusId || undefined,
                brandStatusId: dto.brandStatusId || undefined,
                titleReceivedDate: dto.titleReceivedDate,
                titleIssueDate: dto.titleIssueDate,
                titleSentDate: dto.titleSentDate,
                transferDate: dto.transferDate,
                titleAppNumber: dto.titleAppNumber,
                frontImageId: dto.frontImageId || undefined,
                backImageId: dto.backImageId || undefined,
            },
            include: this.includeRelations,
        });
        return record;
    }
    async findOne(id) {
        const title = await this.prisma.title.findUnique({
            where: { id },
            include: this.includeRelations,
        });
        if (!title) {
            throw new common_1.NotFoundException(`Title with ID ${id} not found`);
        }
        return title;
    }
    async update(id, dto) {
        const existing = await this.prisma.title.findUnique({
            where: { id },
            include: { vehicle: { select: { tenantId: true } } },
        });
        if (!existing) {
            throw new common_1.NotFoundException(`Title with ID ${id} not found`);
        }
        const data = {};
        if (dto.titleNumber !== undefined)
            data.titleNumber = dto.titleNumber;
        if (dto.titleState !== undefined)
            data.titleState = dto.titleState;
        if (dto.titleStatusId !== undefined)
            data.titleStatusId = dto.titleStatusId;
        if (dto.brandStatusId !== undefined)
            data.brandStatusId = dto.brandStatusId;
        if (dto.titleReceivedDate !== undefined)
            data.titleReceivedDate = dto.titleReceivedDate;
        if (dto.titleIssueDate !== undefined)
            data.titleIssueDate = dto.titleIssueDate;
        if (dto.titleSentDate !== undefined)
            data.titleSentDate = dto.titleSentDate;
        if (dto.transferDate !== undefined)
            data.transferDate = dto.transferDate;
        if (dto.titleAppNumber !== undefined)
            data.titleAppNumber = dto.titleAppNumber;
        if (dto.frontImageId !== undefined)
            data.frontImageId = dto.frontImageId || null;
        if (dto.backImageId !== undefined)
            data.backImageId = dto.backImageId || null;
        const record = await this.prisma.title.update({
            where: { id },
            data,
            include: this.includeRelations,
        });
        return record;
    }
};
exports.TitleService = TitleService;
exports.TitleService = TitleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], TitleService);
//# sourceMappingURL=title.service.js.map
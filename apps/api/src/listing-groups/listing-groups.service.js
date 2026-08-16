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
exports.ListingGroupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
let ListingGroupsService = class ListingGroupsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(tenantId) {
        return this.prisma.auctionListingGroup.findMany({
            where: { tenantId },
            include: { _count: { select: { items: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(tenantId, userId, dto) {
        try {
            return await this.prisma.auctionListingGroup.create({
                data: { tenantId, userId, name: dto.name, description: dto.description },
                include: { _count: { select: { items: true } } },
            });
        }
        catch (err) {
            if (err?.code === 'P2002') {
                throw new common_1.ConflictException(`A group named "${dto.name}" already exists`);
            }
            throw err;
        }
    }
    async update(tenantId, id, dto) {
        const group = await this.prisma.auctionListingGroup.findFirst({
            where: { id, tenantId },
        });
        if (!group)
            throw new common_1.NotFoundException('Group not found');
        return this.prisma.auctionListingGroup.update({
            where: { id },
            data: { ...dto },
            include: { _count: { select: { items: true } } },
        });
    }
    async remove(tenantId, id) {
        const group = await this.prisma.auctionListingGroup.findFirst({
            where: { id, tenantId },
        });
        if (!group)
            throw new common_1.NotFoundException('Group not found');
        await this.prisma.auctionListingGroup.delete({ where: { id } });
        return { deleted: true };
    }
    async getItems(tenantId, groupId) {
        const group = await this.prisma.auctionListingGroup.findFirst({
            where: { id: groupId, tenantId },
        });
        if (!group)
            throw new common_1.NotFoundException('Group not found');
        const items = await this.prisma.auctionListingGroupItem.findMany({
            where: { groupId },
            select: { lotNumber: true },
        });
        return { groupId, lotNumbers: items.map((i) => i.lotNumber.toString()) };
    }
    async addItems(tenantId, groupId, lotNumbers) {
        const group = await this.prisma.auctionListingGroup.findFirst({
            where: { id: groupId, tenantId },
        });
        if (!group)
            throw new common_1.NotFoundException('Group not found');
        const result = await this.prisma.auctionListingGroupItem.createMany({
            data: lotNumbers.map((ln) => ({ groupId, lotNumber: BigInt(ln) })),
            skipDuplicates: true,
        });
        return { added: result.count };
    }
    async removeItem(tenantId, groupId, lotNumber) {
        const group = await this.prisma.auctionListingGroup.findFirst({
            where: { id: groupId, tenantId },
        });
        if (!group)
            throw new common_1.NotFoundException('Group not found');
        await this.prisma.auctionListingGroupItem.delete({
            where: { groupId_lotNumber: { groupId, lotNumber: BigInt(lotNumber) } },
        }).catch(() => { });
        return { removed: true };
    }
    async getGroupsForLot(tenantId, lotNumber) {
        const items = await this.prisma.auctionListingGroupItem.findMany({
            where: {
                lotNumber: BigInt(lotNumber),
                group: { tenantId },
            },
            include: { group: { select: { id: true, name: true } } },
        });
        return {
            groups: items.map((i) => i.group),
            count: items.length,
        };
    }
};
exports.ListingGroupsService = ListingGroupsService;
exports.ListingGroupsService = ListingGroupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], ListingGroupsService);
//# sourceMappingURL=listing-groups.service.js.map
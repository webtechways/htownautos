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
exports.InvestmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_1 = require("@htownautos/prisma");
let InvestmentsService = class InvestmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    toData(dto) {
        const data = {};
        if (dto.amount !== undefined)
            data.amount = dto.amount;
        if (dto.source !== undefined)
            data.source = dto.source;
        if (dto.sourceAccount !== undefined)
            data.sourceAccount = dto.sourceAccount;
        if (dto.payBackAmount !== undefined)
            data.payBackAmount = dto.payBackAmount;
        if (dto.payBackInterval !== undefined)
            data.payBackInterval = dto.payBackInterval;
        if (dto.settleDeadline !== undefined)
            data.settleDeadline = dto.settleDeadline
                ? new Date(dto.settleDeadline)
                : null;
        if (dto.notes !== undefined)
            data.notes = dto.notes;
        return data;
    }
    async create(tenantId, dto) {
        return this.prisma.investment.create({
            data: {
                tenantId,
                amount: dto.amount,
                source: dto.source,
                sourceAccount: dto.sourceAccount,
                payBackAmount: dto.payBackAmount,
                payBackInterval: dto.payBackInterval,
                settleDeadline: dto.settleDeadline
                    ? new Date(dto.settleDeadline)
                    : undefined,
                notes: dto.notes,
            },
        });
    }
    async findAll(tenantId) {
        const items = await this.prisma.investment.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
        const totals = items.reduce((acc, i) => {
            acc.invested += Number(i.amount);
            acc.payBack += Number(i.payBackAmount ?? i.amount);
            return acc;
        }, { invested: 0, payBack: 0 });
        return {
            data: items,
            count: items.length,
            totalInvested: totals.invested,
            totalPayBack: totals.payBack,
        };
    }
    async findOne(tenantId, id) {
        const item = await this.prisma.investment.findFirst({
            where: { id, tenantId },
        });
        if (!item)
            throw new common_1.NotFoundException(`Investment ${id} not found`);
        return item;
    }
    async update(tenantId, id, dto) {
        await this.findOne(tenantId, id);
        return this.prisma.investment.update({
            where: { id },
            data: this.toData(dto),
        });
    }
    async remove(tenantId, id) {
        await this.findOne(tenantId, id);
        await this.prisma.investment.delete({ where: { id } });
        return { id, deleted: true };
    }
};
exports.InvestmentsService = InvestmentsService;
exports.InvestmentsService = InvestmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_1.PrismaService])
], InvestmentsService);
//# sourceMappingURL=investments.service.js.map
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
import { Prisma } from '@prisma/client';
import { CreateInvestmentDto, UpdateInvestmentDto } from './dto';

@Injectable()
export class InvestmentsService {
  constructor(private prisma: PrismaService) {}

  private toData(dto: CreateInvestmentDto | UpdateInvestmentDto) {
    const data: Prisma.InvestmentUncheckedUpdateInput = {};
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.source !== undefined) data.source = dto.source;
    if (dto.sourceAccount !== undefined) data.sourceAccount = dto.sourceAccount;
    if (dto.payBackAmount !== undefined) data.payBackAmount = dto.payBackAmount;
    if (dto.payBackInterval !== undefined)
      data.payBackInterval = dto.payBackInterval;
    if (dto.settleDeadline !== undefined)
      data.settleDeadline = dto.settleDeadline
        ? new Date(dto.settleDeadline)
        : null;
    if (dto.notes !== undefined) data.notes = dto.notes;
    return data;
  }

  async create(tenantId: string, dto: CreateInvestmentDto) {
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

  async findAll(tenantId: string) {
    const items = await this.prisma.investment.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    const totals = items.reduce(
      (acc, i) => {
        acc.invested += Number(i.amount);
        acc.payBack += Number(i.payBackAmount ?? i.amount);
        return acc;
      },
      { invested: 0, payBack: 0 },
    );

    return {
      data: items,
      count: items.length,
      totalInvested: totals.invested,
      totalPayBack: totals.payBack,
    };
  }

  async findOne(tenantId: string, id: string) {
    const item = await this.prisma.investment.findFirst({
      where: { id, tenantId },
    });
    if (!item) throw new NotFoundException(`Investment ${id} not found`);
    return item;
  }

  async update(tenantId: string, id: string, dto: UpdateInvestmentDto) {
    await this.findOne(tenantId, id);
    return this.prisma.investment.update({
      where: { id },
      data: this.toData(dto),
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.investment.delete({ where: { id } });
    return { id, deleted: true };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import { CreateExtraExpenseDto } from './dto/create-extra-expense.dto';
import { UpdateExtraExpenseDto } from './dto/update-extra-expense.dto';
import { QueryExtraExpenseDto } from './dto/query-extra-expense.dto';
import { ExtraExpenseEntity } from './entities/extra-expense.entity';
import { PaginatedResponseDto } from '@htownautos/common';

/** Shared include for queries that need vehicle + receipts + paidByUser */
const INCLUDE_RELATIONS = {
  vehicle: {
    select: {
      id: true,
      vin: true,
      stockNumber: true,
      year: { select: { year: true } },
      make: { select: { name: true } },
      model: { select: { name: true } },
    },
  },
  receipts: true,
  paidByUser: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      name: true,
    },
  },
} as const;

@Injectable()
export class ExtraExpenseService {
  private readonly expense: ReturnType<PrismaService['getModel']>;
  private readonly vehicle: ReturnType<PrismaService['getModel']>;

  constructor(
    private readonly prisma: PrismaService,
  ) {
    this.expense = prisma.getModel('extraExpense');
    this.vehicle = prisma.getModel('vehicle');
  }

  async create(dto: CreateExtraExpenseDto): Promise<ExtraExpenseEntity> {
    const vehicleRecord = await this.vehicle.findUnique({
      where: { id: dto.vehicleId },
      select: { id: true, tenantId: true },
    });
    if (!vehicleRecord) {
      throw new NotFoundException(`Vehicle ${dto.vehicleId} not found`);
    }

    const record = await this.expense.create({
      data: {
        vehicleId: dto.vehicleId,
        description: dto.description,
        price: new Prisma.Decimal(dto.price),
        ...(dto.metaValue !== undefined && { metaValue: dto.metaValue }),
        ...(dto.paidByUserId !== undefined && { paidByUserId: dto.paidByUserId || null }),
        ...(dto.receiptIds?.length && {
          receipts: { connect: dto.receiptIds.map((id) => ({ id })) },
        }),
      },
      include: INCLUDE_RELATIONS,
    });

    return new ExtraExpenseEntity(record);
  }

  async findAll(
    query: QueryExtraExpenseDto,
  ): Promise<PaginatedResponseDto<ExtraExpenseEntity>> {
    const { page = 1, limit = 10, vehicleId } = query;
    const where: Prisma.ExtraExpenseWhereInput = {};

    if (vehicleId) {
      await this.ensureVehicleExists(vehicleId);
      where.vehicleId = vehicleId;
    }

    const [data, total] = await Promise.all([
      this.expense.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: INCLUDE_RELATIONS,
      }),
      this.expense.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map((row: Record<string, unknown>) => new ExtraExpenseEntity(row)),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<ExtraExpenseEntity> {
    const record = await this.expense.findUnique({
      where: { id },
      include: INCLUDE_RELATIONS,
    });

    if (!record) {
      throw new NotFoundException(`Extra expense ${id} not found`);
    }

    return new ExtraExpenseEntity(record);
  }

  async update(
    id: string,
    dto: UpdateExtraExpenseDto,
  ): Promise<ExtraExpenseEntity> {
    const existing = await this.expense.findUnique({
      where: { id },
      include: { vehicle: { select: { tenantId: true } } },
    });
    if (!existing) {
      throw new NotFoundException(`Extra expense ${id} not found`);
    }

    const record = await this.expense.update({
      where: { id },
      data: {
        ...(dto.description && { description: dto.description }),
        ...(dto.price !== undefined && { price: new Prisma.Decimal(dto.price) }),
        ...(dto.metaValue !== undefined && { metaValue: dto.metaValue }),
        ...(dto.paidByUserId !== undefined && { paidByUserId: dto.paidByUserId || null }),
        ...(dto.receiptIds !== undefined && {
          receipts: { set: dto.receiptIds.map((rid) => ({ id: rid })) },
        }),
      },
      include: INCLUDE_RELATIONS,
    });

    return new ExtraExpenseEntity(record);
  }

  async remove(id: string): Promise<{ message: string }> {
    const existing = await this.expense.findUnique({
      where: { id },
      include: { vehicle: { select: { tenantId: true } } },
    });
    if (!existing) {
      throw new NotFoundException(`Extra expense ${id} not found`);
    }

    await this.expense.delete({ where: { id } });

    return { message: `Extra expense ${id} deleted` };
  }

  async getVehicleTotal(vehicleId: string): Promise<{ total: number }> {
    await this.ensureVehicleExists(vehicleId);

    const result = await this.expense.aggregate({
      where: { vehicleId },
      _sum: { price: true },
    });

    return { total: Number(result._sum.price ?? 0) };
  }

  // ── Private helpers ──────────────────────────────────────────

  private async ensureVehicleExists(vehicleId: string): Promise<void> {
    const exists = await this.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Vehicle ${vehicleId} not found`);
    }
  }

  private async ensureExpenseExists(id: string): Promise<void> {
    const exists = await this.expense.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Extra expense ${id} not found`);
    }
  }
}

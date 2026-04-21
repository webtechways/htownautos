import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import { CreateBuyerVehiclePreferenceDto } from './dto/create-buyer-vehicle-preference.dto';
import { UpdateBuyerVehiclePreferenceDto } from './dto/update-buyer-vehicle-preference.dto';

function serialize(pref: any) {
  return {
    ...pref,
    maxCost: pref.maxCost?.toString() ?? null,
  };
}

@Injectable()
export class BuyerVehiclePreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureBuyer(buyerId: string, tenantId: string): Promise<void> {
    const exists = await this.prisma.buyer.findFirst({
      where: { id: buyerId, tenantId: tenantId || undefined },
      select: { id: true },
    });
    if (!exists) {
      throw new NotFoundException(`Buyer ${buyerId} not found`);
    }
  }

  async list(buyerId: string, tenantId: string) {
    await this.ensureBuyer(buyerId, tenantId);
    const rows = await this.prisma.buyerVehiclePreference.findMany({
      where: { buyerId, tenantId: tenantId || undefined },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(serialize);
  }

  async create(
    buyerId: string,
    tenantId: string,
    userId: string | null,
    dto: CreateBuyerVehiclePreferenceDto,
  ) {
    await this.ensureBuyer(buyerId, tenantId);

    const created = await this.prisma.buyerVehiclePreference.create({
      data: {
        buyerId,
        tenantId: tenantId || null,
        createdBy: userId,
        make: dto.make,
        yearFrom: dto.yearFrom ?? null,
        yearTo: dto.yearTo ?? null,
        models: dto.models ?? [],
        trims: dto.trims ?? [],
        maxMileage: dto.maxMileage ?? null,
        titleTypes: dto.titleTypes ?? [],
        colors: dto.colors ?? [],
        maxCost:
          dto.maxCost !== undefined ? new Prisma.Decimal(dto.maxCost) : null,
        notes: dto.notes ?? null,
      },
    });
    return serialize(created);
  }

  async update(
    id: string,
    buyerId: string,
    tenantId: string,
    dto: UpdateBuyerVehiclePreferenceDto,
  ) {
    const existing = await this.prisma.buyerVehiclePreference.findFirst({
      where: { id, buyerId, tenantId: tenantId || undefined },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(`Preference ${id} not found`);
    }

    const data: Prisma.BuyerVehiclePreferenceUpdateInput = {};
    if (dto.make !== undefined) data.make = dto.make;
    if (dto.yearFrom !== undefined) data.yearFrom = dto.yearFrom;
    if (dto.yearTo !== undefined) data.yearTo = dto.yearTo;
    if (dto.models !== undefined) data.models = dto.models;
    if (dto.trims !== undefined) data.trims = dto.trims;
    if (dto.maxMileage !== undefined) data.maxMileage = dto.maxMileage;
    if (dto.titleTypes !== undefined) data.titleTypes = dto.titleTypes;
    if (dto.colors !== undefined) data.colors = dto.colors;
    if (dto.maxCost !== undefined) {
      data.maxCost =
        dto.maxCost === null ? null : new Prisma.Decimal(dto.maxCost);
    }
    if (dto.notes !== undefined) data.notes = dto.notes;

    const updated = await this.prisma.buyerVehiclePreference.update({
      where: { id },
      data,
    });
    return serialize(updated);
  }

  async remove(id: string, buyerId: string, tenantId: string) {
    const existing = await this.prisma.buyerVehiclePreference.findFirst({
      where: { id, buyerId, tenantId: tenantId || undefined },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(`Preference ${id} not found`);
    }
    await this.prisma.buyerVehiclePreference.delete({ where: { id } });
    return { deleted: true };
  }
}

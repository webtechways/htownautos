import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';

@Injectable()
export class RebuildService {
  constructor(private readonly prisma: PrismaService) {}

  async findByVehicle(vehicleId: string) {
    return this.prisma.rebuildItem.findMany({
      where: { vehicleId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(vehicleId: string, data: { side: string; damageDescription?: string; tenantId?: string }) {
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

  async update(id: string, data: { side?: string; damageDescription?: string; photosBefore?: any; photosAfter?: any; sortOrder?: number }) {
    const item = await this.prisma.rebuildItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Rebuild item ${id} not found`);
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

  async remove(id: string) {
    const item = await this.prisma.rebuildItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Rebuild item ${id} not found`);
    await this.prisma.rebuildItem.delete({ where: { id } });
    return { message: `Rebuild item deleted` };
  }
}

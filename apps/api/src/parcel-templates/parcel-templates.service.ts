import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';
import { ShippoService } from '../shippo/shippo.service';
import { CreateParcelTemplateDto } from './dto/parcel-template.dto';

export { CreateParcelTemplateDto } from './dto/parcel-template.dto';

@Injectable()
export class ParcelTemplatesService {
  private readonly logger = new Logger(ParcelTemplatesService.name);

  constructor(
    private prisma: PrismaService,
    private shippo: ShippoService,
  ) {}

  async findAll(tenantId: string) {
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

  async findOne(tenantId: string, id: string) {
    const template = await this.prisma.parcelTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!template) throw new NotFoundException(`Parcel template ${id} not found`);
    return template;
  }

  async create(tenantId: string, dto: CreateParcelTemplateDto) {
    this.logger.log(`Creating parcel template for tenant ${tenantId}: ${JSON.stringify(dto)}`);
    try {
      if (dto.isDefault) {
        await this.prisma.parcelTemplate.updateMany({
          where: { tenantId, isDefault: true },
          data: { isDefault: false },
        });
      }

      // Push template to Shippo so it appears in their dashboard.
      // If Shippo fails we still keep the local record — UI won't be blocked.
      let shippoObjectId: string | undefined = dto.shippoTemplateToken;
      if (!dto.shippoTemplateToken) {
        try {
          const shippoResponse = await this.shippo.createUserParcelTemplate({
            name: dto.name,
            length: dto.length,
            width: dto.width,
            height: dto.height,
            distanceUnit: (dto.distanceUnit || 'in') as 'in' | 'cm',
            weight: dto.defaultWeight,
            weightUnit: (dto.massUnit || 'lb') as 'lb' | 'kg',
          });
          shippoObjectId =
            shippoResponse?.objectId || shippoResponse?.object_id || undefined;
          this.logger.log(`Shippo returned objectId=${shippoObjectId} for "${dto.name}"`);
        } catch (err: any) {
          this.logger.warn(
            `Shippo user template creation failed, saving local-only: ${err.message}`,
          );
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
      this.logger.log(
        `Created parcel template ${result.id} (${result.name}) shippoObjectId=${shippoObjectId ?? 'none'}`,
      );
      return result;
    } catch (err) {
      this.logger.error(`Failed to create parcel template: ${err.message}`, err.stack);
      throw err;
    }
  }

  async update(tenantId: string, id: string, dto: Partial<CreateParcelTemplateDto>) {
    const existing = await this.findOne(tenantId, id);
    if (dto.isDefault) {
      await this.prisma.parcelTemplate.updateMany({
        where: { tenantId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    // Sync to Shippo if this record is linked to a Shippo user template (not a carrier preset).
    const token = existing.shippoTemplateToken;
    const looksLikeCarrierPreset = !!token && /^(UPS_|FedEx_|USPS_)/i.test(token);
    if (token && !looksLikeCarrierPreset) {
      // Merge existing record with incoming changes — Shippo's update requires full object.
      const merged = {
        name: dto.name ?? existing.name,
        length: dto.length ?? Number(existing.length),
        width: dto.width ?? Number(existing.width),
        height: dto.height ?? Number(existing.height),
        distanceUnit: (dto.distanceUnit ?? existing.distanceUnit) as 'in' | 'cm',
        weight:
          dto.defaultWeight ??
          (existing.defaultWeight != null ? Number(existing.defaultWeight) : undefined),
        weightUnit: (dto.massUnit ?? existing.massUnit) as 'lb' | 'kg',
      };
      try {
        await this.shippo.updateUserParcelTemplate(token, merged);
      } catch (err: any) {
        this.logger.warn(
          `Shippo update failed but continuing with local update: ${err.message}`,
        );
      }
    }

    return this.prisma.parcelTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    const template = await this.findOne(tenantId, id);
    this.logger.log(
      `Removing parcel template ${id} (${template.name}) shippoTemplateToken=${template.shippoTemplateToken ?? 'none'}`,
    );
    const token = template.shippoTemplateToken;
    const looksLikeCarrierPreset =
      !!token && /^(UPS_|FedEx_|USPS_)/i.test(token);
    if (token && !looksLikeCarrierPreset) {
      // Shippo user-template object_id — remove from Shippo dashboard too.
      try {
        await this.shippo.deleteUserParcelTemplate(token);
      } catch (err: any) {
        this.logger.warn(
          `Shippo delete failed but continuing with local delete: ${err.message}`,
        );
      }
    } else if (token && looksLikeCarrierPreset) {
      this.logger.log(`Skipping Shippo delete for carrier preset token "${token}"`);
    } else {
      this.logger.warn(
        `No shippoTemplateToken on template ${id} — nothing to delete from Shippo. ` +
          `This means the template was created before Shippo sync was wired up, or create failed on the Shippo side.`,
      );
    }
    await this.prisma.parcelTemplate.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'Parcel template deleted' };
  }

  /**
   * Recommend the smallest parcel that fits the given dimensions + weight
   */
  async recommend(tenantId: string, params: {
    length: number;
    width: number;
    height: number;
    weight: number;
  }) {
    const sorted = [params.length, params.width, params.height].sort((a, b) => b - a);

    const custom = await this.prisma.parcelTemplate.findMany({
      where: { tenantId, isActive: true },
    });
    const carrier = await this.shippo.listUpsCarrierParcelTemplates();

    type Candidate = { name: string; length: number; width: number; height: number; source: string; carrier?: string; id?: string; token?: string };
    const candidates: Candidate[] = [
      ...custom.map((c) => ({
        name: c.name,
        length: Number(c.length),
        width: Number(c.width),
        height: Number(c.height),
        source: 'custom' as const,
        id: c.id,
      })),
      ...carrier.map((t: any) => ({
        name: t.name,
        length: Number(t.length),
        width: Number(t.width),
        height: Number(t.height),
        source: 'carrier' as const,
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
}

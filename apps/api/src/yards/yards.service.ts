import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import { CreateYardDto } from './dto/create-yard.dto';
import { UpdateYardDto } from './dto/update-yard.dto';
import { QueryYardsDto } from './dto/query-yards.dto';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

@Injectable()
export class YardsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: QueryYardsDto) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = Math.min(query.limit ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    const where: Prisma.YardWhereInput = {
      ...(query.source && { source: query.source }),
      ...(query.state && { state: query.state }),
      ...(query.yardNumber !== undefined && { yardNumber: query.yardNumber }),
      ...(query.physicalInspectionAvailable !== undefined && {
        physicalInspectionAvailable: query.physicalInspectionAvailable,
      }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { city: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [rows, total, counts] = await Promise.all([
      this.prisma.yard.findMany({
        where,
        orderBy: [{ source: 'asc' }, { name: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: { auctionListings: true, inspections: true },
          },
        },
      }),
      this.prisma.yard.count({ where }),
      // Global counters for the dashboard header (independent of filters).
      this.prisma.yard.groupBy({
        by: ['physicalInspectionAvailable'],
        _count: { _all: true },
      }),
    ]);

    const totalsByFlag = {
      withPhysical: counts.find((c) => c.physicalInspectionAvailable === true)?._count._all ?? 0,
      withoutPhysical: counts.find((c) => c.physicalInspectionAvailable === false)?._count._all ?? 0,
    };

    return {
      data: rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        totalsByFlag,
      },
    };
  }

  async get(id: string) {
    const row = await this.prisma.yard.findUnique({
      where: { id },
      include: {
        _count: {
          select: { auctionListings: true, inspections: true },
        },
      },
    });
    if (!row) throw new NotFoundException(`Yard ${id} not found`);
    return row;
  }

  async create(dto: CreateYardDto) {
    try {
      return await this.prisma.yard.create({
        data: {
          source: dto.source,
          yardNumber: dto.yardNumber,
          name: dto.name,
          address: dto.address,
          city: dto.city,
          state: dto.state,
          zip: dto.zip,
          country: dto.country ?? 'US',
          latitude: dto.latitude,
          longitude: dto.longitude,
          phone: dto.phone,
          email: dto.email,
          contactName: dto.contactName,
          physicalInspectionAvailable: dto.physicalInspectionAvailable ?? false,
          hours: (dto.hours as Prisma.InputJsonValue | undefined) ?? undefined,
          notes: dto.notes,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (err: any) {
      // Unique (source, yardNumber) collision — let the caller know.
      if (err?.code === 'P2002') {
        throw new ConflictException(
          `A yard with source ${dto.source} and number ${dto.yardNumber} already exists`,
        );
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateYardDto) {
    await this.ensureYard(id);
    try {
      return await this.prisma.yard.update({
        where: { id },
        data: {
          ...(dto.source !== undefined && { source: dto.source }),
          ...(dto.yardNumber !== undefined && { yardNumber: dto.yardNumber }),
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.address !== undefined && { address: dto.address }),
          ...(dto.city !== undefined && { city: dto.city }),
          ...(dto.state !== undefined && { state: dto.state }),
          ...(dto.zip !== undefined && { zip: dto.zip }),
          ...(dto.country !== undefined && { country: dto.country }),
          ...(dto.latitude !== undefined && { latitude: dto.latitude }),
          ...(dto.longitude !== undefined && { longitude: dto.longitude }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
          ...(dto.email !== undefined && { email: dto.email }),
          ...(dto.contactName !== undefined && { contactName: dto.contactName }),
          ...(dto.physicalInspectionAvailable !== undefined && {
            physicalInspectionAvailable: dto.physicalInspectionAvailable,
          }),
          ...(dto.hours !== undefined && {
            hours: dto.hours as Prisma.InputJsonValue,
          }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new ConflictException(
          'Another yard already has this (source, yardNumber) pair',
        );
      }
      throw err;
    }
  }

  async remove(id: string) {
    await this.ensureYard(id);
    // SetNull cascade is configured at the FK level, so deleting the yard
    // unhooks listings + inspections without deleting them.
    await this.prisma.yard.delete({ where: { id } });
    return { deleted: true };
  }

  /**
   * Lookup helper used by the inspection flow: find the yard for a given
   * (source, yardNumber). Returns null when not found instead of throwing
   * — the caller decides whether absence is an error.
   */
  async findBySourceAndNumber(
    source: 'COPART' | 'IAAI' | 'OTHER',
    yardNumber: number,
  ) {
    return this.prisma.yard.findUnique({
      where: { source_yardNumber: { source: source as any, yardNumber } },
    });
  }

  private async ensureYard(id: string): Promise<void> {
    const exists = await this.prisma.yard.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException(`Yard ${id} not found`);
  }
}

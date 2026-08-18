import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import {
  CreateScraperAgentDto,
  GenerateScraperAgentsDto,
  UpdateScraperAgentDto,
} from './dto/scraper-agent.dto';
import { generateAgentName, generateAgentPassword } from './password.util';

/**
 * Cuentas de agente para operar en los portales de subasta (Settings →
 * Auction Data → Scraper Agents).
 *
 * La contraseña se almacena legible a propósito: el equipo tiene que poder
 * leerla para iniciar sesión con esa cuenta. El endpoint está tras
 * ClerkJwtGuard y la pantalla solo la ven roles admin.
 */
@Injectable()
export class ScraperAgentsService {
  private readonly logger = new Logger(ScraperAgentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(params: {
    auction?: string;
    country?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const p = Math.max(1, Math.floor(Number(params.page) || 1));
    const l = Math.min(200, Math.max(1, Math.floor(Number(params.limit) || 50)));

    const where: Prisma.ScraperAgentWhereInput = {
      ...(params.auction ? { auction: params.auction } : {}),
      ...(params.country ? { country: params.country } : {}),
      ...(params.search
        ? {
            OR: [
              { firstName: { contains: params.search, mode: 'insensitive' } },
              { lastName: { contains: params.search, mode: 'insensitive' } },
              { email: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.scraperAgent.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip: (p - 1) * l,
        take: l,
      }),
      this.prisma.scraperAgent.count({ where }),
    ]);
    return { data, total, page: p, limit: l };
  }

  async create(dto: CreateScraperAgentDto) {
    try {
      return await this.prisma.scraperAgent.create({
        data: {
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          email: dto.email?.trim() || null,
          auction: dto.auction ?? 'copart',
          country: dto.country ?? 'US',
          password: dto.password || generateAgentPassword(),
          active: dto.active ?? true,
          notes: dto.notes ?? null,
        },
      });
    } catch (err) {
      throw this.mapDuplicate(err);
    }
  }

  async update(id: string, dto: UpdateScraperAgentDto) {
    await this.getOrThrow(id);
    try {
      return await this.prisma.scraperAgent.update({
        where: { id },
        data: {
          ...(dto.firstName !== undefined ? { firstName: dto.firstName.trim() } : {}),
          ...(dto.lastName !== undefined ? { lastName: dto.lastName.trim() } : {}),
          ...(dto.email !== undefined ? { email: dto.email?.trim() || null } : {}),
          ...(dto.auction !== undefined ? { auction: dto.auction } : {}),
          ...(dto.country !== undefined ? { country: dto.country } : {}),
          ...(dto.password !== undefined ? { password: dto.password } : {}),
          ...(dto.active !== undefined ? { active: dto.active } : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        },
      });
    } catch (err) {
      throw this.mapDuplicate(err);
    }
  }

  async remove(id: string) {
    await this.getOrThrow(id);
    await this.prisma.scraperAgent.delete({ where: { id } });
    return { deleted: true };
  }

  /** Nueva contraseña para una cuenta existente. */
  async regeneratePassword(id: string) {
    await this.getOrThrow(id);
    return this.prisma.scraperAgent.update({
      where: { id },
      data: { password: generateAgentPassword() },
      select: { id: true, password: true },
    });
  }

  /**
   * Alta masiva de agentes con nombre y contraseña; el email se rellena después,
   * al registrar cada cuenta en el portal.
   */
  async generate(dto: GenerateScraperAgentsDto) {
    const auction = dto.auction ?? 'copart';
    const country = dto.country ?? 'US';
    const rows: Prisma.ScraperAgentCreateManyInput[] = Array.from({ length: dto.count }, () => ({
      ...generateAgentName(),
      auction,
      country,
      password: generateAgentPassword(),
      email: null,
    }));

    // email null no colisiona con el índice único (auction, email) en Postgres:
    // los NULL no se comparan entre sí.
    await this.prisma.scraperAgent.createMany({ data: rows });
    this.logger.log(`[ScraperAgents] Generados ${rows.length} agentes para ${auction}`);
    return { created: rows.length };
  }

  private async getOrThrow(id: string) {
    const row = await this.prisma.scraperAgent.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Agente no encontrado');
    return row;
  }

  private mapDuplicate(err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return new ConflictException('Ya existe un agente con ese email en ese portal');
    }
    return err;
  }
}

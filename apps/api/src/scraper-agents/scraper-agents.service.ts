import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@htownautos/prisma';
import {
  AgentAssignmentService,
  LOCK_FROM_HOUR,
  LOCK_TO_HOUR,
  isAssignmentEditable,
} from '@htownautos/common';
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

  constructor(
    private readonly prisma: PrismaService,
    private readonly assignment: AgentAssignmentService,
  ) {}

  /**
   * De 8:00 a 23:00 (Houston) los agentes están trabajando su lista: no se
   * borran agentes ni se mueven subastas de mano.
   */
  private assertEditable() {
    if (!isAssignmentEditable()) {
      throw new BadRequestException(
        `Assignments are locked between ${LOCK_FROM_HOUR}:00 and ${LOCK_TO_HOUR}:00 Houston time. ` +
          'Try again outside that window.',
      );
    }
  }

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

    const [rows, total] = await Promise.all([
      this.prisma.scraperAgent.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip: (p - 1) * l,
        take: l,
      }),
      this.prisma.scraperAgent.count({ where }),
    ]);

    // Subastas futuras por agente, para que la tabla muestre la carga sin
    // pedir una consulta por fila.
    const grouped = await this.prisma.auctionCalendarEntry.groupBy({
      by: ['scraperAgentId'],
      where: {
        scraperAgentId: { in: rows.map((r) => r.id) },
        startedAt: { gte: new Date() },
        status: { not: 'ended' },
      },
      _count: { _all: true },
    });
    const load = new Map(grouped.map((g) => [g.scraperAgentId, g._count._all]));
    const data = rows.map((r) => ({ ...r, assignedCount: load.get(r.id) ?? 0 }));

    return { data, total, page: p, limit: l, locked: !isAssignmentEditable() };
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

  /**
   * Borra un agente traspasando antes sus subastas futuras. Sin traspaso previo
   * la FK las dejaría en NULL en silencio y el trabajo del día se perdería.
   */
  async remove(id: string, strategy: 'transfer' | 'random' | 'release' = 'random', toAgentId?: string) {
    this.assertEditable();
    await this.getOrThrow(id);

    let moved = 0;
    if (strategy === 'transfer') {
      if (!toAgentId) throw new BadRequestException('Falta el agente destino');
      await this.getOrThrow(toAgentId);
      ({ moved } = await this.assignment.reassignFrom(id, { toAgentId }));
    } else if (strategy === 'random') {
      ({ moved } = await this.assignment.reassignFrom(id));
    }
    // 'release' no mueve nada: la FK las deja en NULL y el job de mañana las recoge.

    await this.prisma.scraperAgent.delete({ where: { id } });
    return { deleted: true, reassigned: moved };
  }

  /** Activa o desactiva varios agentes de una vez. */
  async bulkSetActive(ids: string[], active: boolean) {
    const res = await this.prisma.scraperAgent.updateMany({
      where: { id: { in: ids } },
      data: { active },
    });
    return { updated: res.count };
  }

  /** Borra varios agentes aplicando la misma estrategia de traspaso a todos. */
  async bulkRemove(ids: string[], strategy: 'transfer' | 'random' | 'release', toAgentId?: string) {
    this.assertEditable();
    if (strategy === 'transfer') {
      if (!toAgentId) throw new BadRequestException('Falta el agente destino');
      if (ids.includes(toAgentId)) {
        throw new BadRequestException('El agente destino no puede estar entre los que se borran');
      }
      await this.getOrThrow(toAgentId);
    }

    let reassigned = 0;
    for (const id of ids) {
      if (strategy === 'transfer') {
        ({ moved: reassigned } = {
          moved: reassigned + (await this.assignment.reassignFrom(id, { toAgentId })).moved,
        });
      } else if (strategy === 'random') {
        // Se borran de uno en uno para que el reparto tenga en cuenta a los que
        // ya se han ido y no le pase subastas a un agente que también se borra.
        await this.prisma.scraperAgent.updateMany({ where: { id }, data: { active: false } });
        ({ moved: reassigned } = {
          moved: reassigned + (await this.assignment.reassignFrom(id)).moved,
        });
      }
    }

    const res = await this.prisma.scraperAgent.deleteMany({ where: { id: { in: ids } } });
    return { deleted: res.count, reassigned };
  }

  /** Subastas futuras asignadas a un agente. */
  async assignedEntries(id: string) {
    await this.getOrThrow(id);
    const data = await this.prisma.auctionCalendarEntry.findMany({
      where: { scraperAgentId: id, startedAt: { gte: new Date() }, status: { not: 'ended' } },
      orderBy: { startedAt: 'asc' },
      select: {
        id: true,
        locationName: true,
        startedAt: true,
        saleDate: true,
        totalAvailableItems: true,
        url: true,
      },
    });
    return { data, total: data.length, locked: !isAssignmentEditable() };
  }

  /** Mueve una subasta concreta a otro agente (solo antes del cierre). */
  async reassignEntry(entryId: string, toAgentId: string) {
    this.assertEditable();
    await this.getOrThrow(toAgentId);
    const entry = await this.prisma.auctionCalendarEntry.findUnique({ where: { id: entryId } });
    if (!entry) throw new NotFoundException('Subasta no encontrada');

    await this.prisma.auctionCalendarEntry.update({
      where: { id: entryId },
      data: { scraperAgentId: toAgentId },
    });
    return { moved: true };
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

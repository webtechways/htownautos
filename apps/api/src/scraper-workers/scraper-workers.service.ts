import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@htownautos/prisma';
import { houstonSaleDate } from '@htownautos/common';
import { PollDto } from './dto/poll.dto';
import { UpdateScraperWorkerDto } from './dto/scraper-worker.dto';

/** Cuánto retiene la API el poll esperando a que aparezca trabajo. */
const LONG_POLL_MS = 20_000;
const LONG_POLL_STEP_MS = 2_000;

/** Sin noticias durante este rato, la VM se da por muerta y suelta lo suyo. */
export const DEAD_AFTER_MINUTES = 15;

export interface PollResponse {
  worker: string;
  paused: boolean;
  account: { email: string | null; password: string } | null;
  saleDate: number;
  count: number;
  auctions: {
    id: string;
    url: string;
    urlNoScheme: string;
    locationName: string;
    locationSlug: string;
    saleDate: number;
    startsAt: string;
    items: number;
  }[];
}

/**
 * Reparte las subastas del día entre las VM que corren Chrome + Automa.
 *
 * El contrato es «dame lo mío de hoy», no «dame cinco más». Automa se
 * reinicia, Chrome se cae y el workflow se relanza; si cada llamada entregara
 * subastas nuevas, un reinicio a media mañana se comería el cupo de la
 * siguiente máquina y dejaría ventas sin cubrir. Por eso el poll es idempotente
 * dentro del día: una vez estampadas, devuelve siempre las mismas.
 *
 * El propio poll hace de heartbeat, así el workflow de Automa no necesita un
 * bloque extra que alguien pueda olvidarse de conectar.
 */
@Injectable()
export class ScraperWorkersService {
  private readonly logger = new Logger(ScraperWorkersService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Lo que llaman las VM ──────────────────────────────────────────────────
  async poll(dto: PollDto, ip?: string): Promise<PollResponse> {
    const saleDate = houstonSaleDate();
    const { workerId, agentId } = await this.resolveWorker(dto.worker.trim());

    // Alta implícita: dar de alta una VM es arrancarla con un identificador
    // nuevo. Nadie tiene que crear nada por la UI antes.
    const worker = await this.prisma.scraperWorker.upsert({
      where: { id: workerId },
      update: {
        lastSeenAt: new Date(),
        lastIp: ip ?? undefined,
        // Identificarse por email vale también para reparar el vínculo si
        // alguien lo desasignó a mano.
        scraperAgentId: agentId ?? undefined,
      },
      create: {
        id: workerId,
        lastSeenAt: new Date(),
        lastIp: ip ?? null,
        scraperAgentId: agentId ?? null,
      },
      include: { scraperAgent: { select: { email: true, password: true, active: true } } },
    });

    const account =
      worker.scraperAgent && worker.scraperAgent.active
        ? { email: worker.scraperAgent.email, password: worker.scraperAgent.password }
        : null;

    if (!worker.enabled) {
      return { worker: workerId, paused: true, account, saleDate, count: 0, auctions: [] };
    }

    let mine = await this.claim(workerId, worker.maxAuctions, saleDate);

    // Nada que dar todavía: el calendario puede no haberse refrescado aún, o
    // las otras VM haber cogido todo. Retener en vez de devolver vacío evita
    // que Automa entre en un bucle de reintentos apretado.
    if (mine.length === 0 && dto.wait !== false) {
      const deadline = Date.now() + LONG_POLL_MS;
      while (mine.length === 0 && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, LONG_POLL_STEP_MS));
        mine = await this.claim(workerId, worker.maxAuctions, saleDate);
      }
    }

    return {
      worker: workerId,
      paused: false,
      account,
      saleDate,
      count: mine.length,
      auctions: mine.map((e) => ({
        id: e.id,
        url: e.url,
        // El bloque New Tab de Automa lleva el esquema en un desplegable
        // aparte, así que su campo de texto espera la URL SIN "https://".
        // Pegar la url completa ahí produce "https://https://…" y Chrome la
        // rechaza sin decir por qué.
        urlNoScheme: e.url.replace(/^https?:\/\//, ''),
        locationName: e.locationName,
        locationSlug: e.locationSlug,
        saleDate: e.saleDate,
        startsAt: e.startedAt.toISOString(),
        items: e.totalAvailableItems,
      })),
    };
  }

  /**
   * Traduce lo que manda la VM a una fila de worker.
   *
   * Se admiten dos formas y la de email es la buena: la máquina dice con qué
   * cuenta trabaja y el vínculo VM↔agente se hace solo, sin que nadie tenga
   * que emparejarlos por la UI. Un slug suelto (`vm-01`) se sigue aceptando
   * para no romper lo que ya está corriendo.
   *
   * Si ese agente ya tenía una fila —creada antes con un slug— se reutiliza
   * en vez de crear una segunda: si no, la misma cuenta acabaría con dos
   * workers y cada uno pidiendo su propio cupo.
   */
  private async resolveWorker(
    input: string,
  ): Promise<{ workerId: string; agentId: string | null }> {
    if (!input.includes('@')) return { workerId: input, agentId: null };

    const email = input.toLowerCase();
    const agent = await this.prisma.scraperAgent.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: { id: true },
    });
    if (!agent) {
      throw new NotFoundException(
        `No hay ningún agente con el email ${email}. Créalo en Auction Data → Scraper Agents.`,
      );
    }

    const existing = await this.prisma.scraperWorker.findUnique({
      where: { scraperAgentId: agent.id },
      select: { id: true },
    });
    return { workerId: existing?.id ?? email, agentId: agent.id };
  }

  /**
   * Devuelve las subastas de hoy de esta VM, completando el cupo si le falta.
   *
   * El reclamo es un `updateMany` con `scraperWorkerId: null` en el WHERE: en
   * Postgres el perdedor de la carrera no encuentra la fila, así que dos VM no
   * pueden llevarse la misma ni pidiendo a la vez. Después se relee por
   * `scraperWorkerId`, que es la única fuente de verdad de qué ganó de verdad.
   */
  private async claim(workerId: string, maxAuctions: number, saleDate: number) {
    const mine = await this.mineToday(workerId, saleDate);
    const missing = maxAuctions - mine.length;
    if (missing <= 0) return mine.slice(0, maxAuctions);

    const worker = await this.prisma.scraperWorker.findUnique({
      where: { id: workerId },
      select: { scraperAgentId: true },
    });

    const free = {
      saleDate,
      scraperWorkerId: null,
      totalAvailableItems: { gt: 0 }, // sin inventario no hay nada que mirar
      status: { not: 'ended' },
      // Se ordena por hora ascendente, así que sin este corte una VM que
      // arranque a mediodía se llevaría las ventas de la mañana — las que ya
      // terminaron. Media hora de margen: entrar más tarde es llegar cuando la
      // mayoría de los lotes ya se vendieron.
      startedAt: { gt: new Date(Date.now() - 30 * 60_000) },
    } as const;

    // Primero lo que el reparto de las 6am ya había puesto a nombre de su
    // agente: así el plan del día se respeta y la VM entra con la cuenta que le
    // corresponde. Solo si no llega a cupo se completa con lo que quede libre.
    const preferred = worker?.scraperAgentId
      ? await this.prisma.auctionCalendarEntry.findMany({
          where: { ...free, scraperAgentId: worker.scraperAgentId },
          orderBy: { startedAt: 'asc' },
          take: missing,
          select: { id: true },
        })
      : [];

    const rest =
      preferred.length < missing
        ? await this.prisma.auctionCalendarEntry.findMany({
            where: { ...free, id: { notIn: preferred.map((p) => p.id) } },
            orderBy: { startedAt: 'asc' },
            take: missing - preferred.length,
            select: { id: true },
          })
        : [];

    const candidates = [...preferred, ...rest].map((c) => c.id);
    if (candidates.length === 0) return mine;

    await this.prisma.auctionCalendarEntry.updateMany({
      where: { id: { in: candidates }, scraperWorkerId: null },
      data: { scraperWorkerId: workerId },
    });
    await this.prisma.scraperWorker.update({
      where: { id: workerId },
      data: { lastClaimAt: new Date() },
    });

    // Puede haber ganado menos de los que pidió si otra VM le adelantó; esta
    // relectura es la que dice la verdad.
    const after = await this.mineToday(workerId, saleDate);
    return after.slice(0, maxAuctions);
  }

  private mineToday(workerId: string, saleDate: number) {
    return this.prisma.auctionCalendarEntry.findMany({
      where: { scraperWorkerId: workerId, saleDate },
      orderBy: { startedAt: 'asc' },
      select: {
        id: true,
        url: true,
        locationName: true,
        locationSlug: true,
        saleDate: true,
        startedAt: true,
        totalAvailableItems: true,
      },
    });
  }

  /**
   * Una VM que deja de pollear está apagada o colgada. Se le sueltan las
   * subastas de hoy **que aún no han empezado**, para que otra máquina las
   * coja; las que ya están en curso se quedan donde están, porque reabrirlas a
   * media venta aporta poco y descuadra el recuento.
   */
  @Cron('*/5 * * * *')
  async sweepDeadWorkers(): Promise<number> {
    const cutoff = new Date(Date.now() - DEAD_AFTER_MINUTES * 60_000);
    const dead = await this.prisma.scraperWorker.findMany({
      where: { OR: [{ lastSeenAt: { lt: cutoff } }, { lastSeenAt: null }] },
      select: { id: true },
    });
    if (dead.length === 0) return 0;

    const res = await this.prisma.auctionCalendarEntry.updateMany({
      where: {
        scraperWorkerId: { in: dead.map((d) => d.id) },
        saleDate: houstonSaleDate(),
        startedAt: { gt: new Date() },
      },
      data: { scraperWorkerId: null },
    });
    if (res.count > 0) {
      this.logger.warn(
        `[ScraperWorkers] ${res.count} subasta(s) devueltas al bote por ${dead.length} VM sin señal`,
      );
    }
    return res.count;
  }

  // ── Lo que usa la UI ──────────────────────────────────────────────────────
  async list() {
    const saleDate = houstonSaleDate();
    const [workers, today, covered] = await Promise.all([
      this.prisma.scraperWorker.findMany({
        orderBy: { id: 'asc' },
        include: {
          scraperAgent: {
            select: { id: true, firstName: true, lastName: true, email: true, active: true },
          },
        },
      }),
      // Cuántas subastas reales hay hoy: sin esto no se ve que el cupo fijo
      // (5 × VMs) puede dejar ventas sin cubrir en silencio.
      this.prisma.auctionCalendarEntry.count({
        where: { saleDate, totalAvailableItems: { gt: 0 }, status: { not: 'ended' } },
      }),
      this.prisma.auctionCalendarEntry.groupBy({
        by: ['scraperWorkerId'],
        where: { saleDate, scraperWorkerId: { not: null } },
        _count: { _all: true },
      }),
    ]);

    const byWorker = new Map(covered.map((c) => [c.scraperWorkerId as string, c._count._all]));
    const cutoff = Date.now() - DEAD_AFTER_MINUTES * 60_000;

    return {
      data: workers.map((w) => ({
        ...w,
        assignedToday: byWorker.get(w.id) ?? 0,
        online: !!w.lastSeenAt && w.lastSeenAt.getTime() > cutoff,
      })),
      today: {
        saleDate,
        total: today,
        covered: [...byWorker.values()].reduce((a, b) => a + b, 0),
        capacity: workers
          .filter((w) => w.enabled)
          .reduce((a, w) => a + w.maxAuctions, 0),
      },
    };
  }

  async entries(workerId: string) {
    await this.get(workerId);
    return this.prisma.auctionCalendarEntry.findMany({
      where: { scraperWorkerId: workerId, saleDate: houstonSaleDate() },
      orderBy: { startedAt: 'asc' },
      select: {
        id: true,
        locationName: true,
        startedAt: true,
        totalAvailableItems: true,
        url: true,
        status: true,
      },
    });
  }

  async update(id: string, dto: UpdateScraperWorkerDto) {
    await this.get(id);
    let worker;
    try {
      worker = await this.prisma.scraperWorker.update({
        where: { id },
        data: {
          label: dto.label !== undefined ? dto.label?.trim() || null : undefined,
          scraperAgentId: dto.scraperAgentId !== undefined ? dto.scraperAgentId || null : undefined,
          enabled: dto.enabled,
          maxAuctions: dto.maxAuctions,
          notes: dto.notes !== undefined ? dto.notes?.trim() || null : undefined,
        },
      });
    } catch (err: any) {
      // El índice único de scraperAgentId es deliberado: la misma cuenta desde
      // dos IPs es lo que hace saltar los bloqueos. Merece un mensaje claro y no
      // un 500.
      if (err?.code === 'P2002') {
        throw new ConflictException('That account is already assigned to another worker');
      }
      throw err;
    }

    // Bajar el cupo con la VM ya trabajando dejaría subastas retenidas que
    // nadie va a abrir: se sueltan las que sobran, las últimas en empezar.
    if (dto.maxAuctions !== undefined) await this.trimToQuota(id, dto.maxAuctions);
    // Apagar una VM devuelve su día al bote en el acto.
    if (dto.enabled === false) await this.release(id);

    return worker;
  }

  async remove(id: string) {
    await this.get(id);
    await this.release(id);
    await this.prisma.scraperWorker.delete({ where: { id } });
    return { deleted: true };
  }

  /** Suelta todas las subastas de hoy de una VM. */
  async release(id: string): Promise<number> {
    const res = await this.prisma.auctionCalendarEntry.updateMany({
      where: { scraperWorkerId: id, saleDate: houstonSaleDate() },
      data: { scraperWorkerId: null },
    });
    return res.count;
  }

  private async trimToQuota(id: string, quota: number): Promise<void> {
    const mine = await this.mineToday(id, houstonSaleDate());
    if (mine.length <= quota) return;
    const extra = mine.slice(quota).map((e) => e.id);
    await this.prisma.auctionCalendarEntry.updateMany({
      where: { id: { in: extra } },
      data: { scraperWorkerId: null },
    });
  }

  private async get(id: string) {
    const worker = await this.prisma.scraperWorker.findUnique({ where: { id } });
    if (!worker) throw new NotFoundException(`Scraper worker ${id} not found`);
    return worker;
  }
}

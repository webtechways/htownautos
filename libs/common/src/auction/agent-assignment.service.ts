import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@htownautos/prisma';

/** Cuántas entradas se asignan como máximo en una pasada. */
const BATCH = 5000;

export interface AssignmentResult {
  assigned: number;
  agents: number;
  skipped: string | null;
}

/**
 * Reparte las subastas del calendario entre los agentes disponibles.
 *
 * Corre cada día a las 6:00 **hora de Houston**, no del contenedor: el host va
 * en UTC y sin fijar la zona el job saltaría a la 1:00 de la madrugada local.
 *
 * Solo toca entradas que aún no tienen agente, así que es idempotente: una
 * subasta ya asignada conserva su agente aunque el job corra mil veces. La
 * asignación además sobrevive al refresco del calendario, que borra y recrea
 * todas las filas (ver AuctionCalendarService.fetchAndStore).
 */
@Injectable()
export class AgentAssignmentService {
  private readonly logger = new Logger(AgentAssignmentService.name);
  private running = false;

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 6 * * *', { timeZone: 'America/Chicago' })
  async dailyAssign(): Promise<void> {
    try {
      const res = await this.assignPending();
      if (res.skipped) {
        this.logger.warn(`[AgentAssignment] Sin asignar: ${res.skipped}`);
      } else if (res.assigned > 0) {
        this.logger.log(
          `[AgentAssignment] ${res.assigned} subasta(s) repartidas entre ${res.agents} agente(s)`,
        );
      }
    } catch (err: any) {
      this.logger.error(`[AgentAssignment] Falló: ${err.message}`);
    }
  }

  /**
   * Asigna agente a las subastas futuras que tengan enlace y fecha y no tengan
   * uno todavía, equilibrando la carga: siempre coge al agente con menos
   * subastas asignadas, contando también las que ya tenía de antes.
   */
  async assignPending(): Promise<AssignmentResult> {
    if (this.running) return { assigned: 0, agents: 0, skipped: 'ya hay una pasada en curso' };
    this.running = true;
    try {
      const agents = await this.prisma.scraperAgent.findMany({
        where: { active: true },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
      });
      if (agents.length === 0) {
        return { assigned: 0, agents: 0, skipped: 'no hay agentes activos' };
      }

      const pending = await this.prisma.auctionCalendarEntry.findMany({
        where: {
          scraperAgentId: null,
          startedAt: { gte: new Date() }, // solo lo que aún no se ha subastado
          status: { not: 'ended' },
        },
        orderBy: { startedAt: 'asc' },
        take: BATCH,
        select: { id: true },
      });
      if (pending.length === 0) return { assigned: 0, agents: agents.length, skipped: null };

      // Carga actual de cada agente, para repartir desde donde toca y no
      // amontonar todo en los primeros.
      const counts = new Map<string, number>(agents.map((a) => [a.id, 0]));
      const grouped = await this.prisma.auctionCalendarEntry.groupBy({
        by: ['scraperAgentId'],
        where: { scraperAgentId: { in: agents.map((a) => a.id) } },
        _count: { _all: true },
      });
      for (const g of grouped) {
        if (g.scraperAgentId) counts.set(g.scraperAgentId, g._count._all);
      }

      // Agrupa por agente para hacer un updateMany por agente en vez de una
      // consulta por subasta (5.000 updates individuales serían lentísimos).
      const byAgent = new Map<string, string[]>();
      for (const entry of pending) {
        let bestId = agents[0].id;
        let best = Number.POSITIVE_INFINITY;
        for (const [id, n] of counts) {
          if (n < best) {
            best = n;
            bestId = id;
          }
        }
        counts.set(bestId, best + 1);
        const list = byAgent.get(bestId) ?? [];
        list.push(entry.id);
        byAgent.set(bestId, list);
      }

      let assigned = 0;
      for (const [agentId, ids] of byAgent) {
        const res = await this.prisma.auctionCalendarEntry.updateMany({
          where: { id: { in: ids }, scraperAgentId: null },
          data: { scraperAgentId: agentId },
        });
        assigned += res.count;
      }

      return { assigned, agents: agents.length, skipped: null };
    } finally {
      this.running = false;
    }
  }
}

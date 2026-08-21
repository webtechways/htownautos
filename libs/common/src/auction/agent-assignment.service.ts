import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@htownautos/prisma';
import { randomInt } from 'node:crypto';

/** Cuántas entradas se reparten como máximo en una pasada. */
const BATCH = 5000;

/** Ventana de trabajo en Houston: dentro de ella el reparto está congelado. */
export const LOCK_FROM_HOUR = 8;
export const LOCK_TO_HOUR = 23;

export interface AssignmentResult {
  assigned: number;
  agents: number;
  skipped: string | null;
}

/** Baraja in-place con entropía criptográfica (Fisher-Yates). */
function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/** La hora actual en Houston, que es la que manda para el corte diario. */
export function houstonHour(now = new Date()): number {
  return Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      hour: '2-digit',
      hour12: false,
    }).format(now),
  );
}

/**
 * De 23:00 a 8:00 (hora de Houston) se puede tocar el reparto: borrar agentes y
 * mover subastas de mano. Entre las 8:00 y las 23:00 los agentes están
 * trabajando su lista y cambiarla por debajo es peor que esperar.
 */
export function isAssignmentEditable(now = new Date()): boolean {
  const h = houstonHour(now);
  return h >= LOCK_TO_HOUR || h < LOCK_FROM_HOUR;
}

/**
 * Reparte las subastas del calendario entre los agentes activos.
 *
 * Corre cada día a las 6:00 **hora de Houston** — el host va en UTC, así que sin
 * fijar la zona el job saltaría a la 1:00 local. De 8:00 a 23:00 el reparto
 * queda congelado (ver {@link isAssignmentEditable}).
 *
 * Solo entran subastas con inventario: una subasta con 0 items no da trabajo y
 * repartirla solo desequilibra la carga real.
 */
@Injectable()
export class AgentAssignmentService {
  private readonly logger = new Logger(AgentAssignmentService.name);
  private running = false;

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 6 * * *', { timeZone: 'America/Chicago' })
  async dailyAssign(): Promise<void> {
    try {
      const res = await this.runAssignment();
      if (res.skipped) {
        this.logger.warn(`[AgentAssignment] Sin repartir: ${res.skipped}`);
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
   * Suelta lo que ya no aplica y reparte lo próximo. Es lo que ejecutan tanto el
   * cron de las 6:00 como el botón de la UI.
   */
  async runAssignment(): Promise<AssignmentResult & { released: number }> {
    const released = await this.releaseStale();
    const res = await this.assignPending();
    return { ...res, released };
  }

  /**
   * Desasocia lo que ya no tiene sentido tener asignado: subastas que ya se
   * celebraron y subastas sin inventario. Si no, la carga de cada agente se
   * infla con trabajo inexistente y el reparto deja de ser proporcional de
   * verdad.
   */
  async releaseStale(): Promise<number> {
    const res = await this.prisma.auctionCalendarEntry.updateMany({
      where: {
        scraperAgentId: { not: null },
        OR: [
          { startedAt: { lt: new Date() } },
          { status: 'ended' },
          { totalAvailableItems: { lte: 0 } },
        ],
      },
      data: { scraperAgentId: null },
    });
    if (res.count > 0) {
      this.logger.log(`[AgentAssignment] ${res.count} subasta(s) liberadas (pasadas o sin items)`);
    }
    return res.count;
  }

  /**
   * Asigna agente a las subastas futuras **con items** que no tengan uno.
   *
   * El reparto es aleatorio pero proporcional: se barajan las subastas y en cada
   * paso se coge al agente con menos carga (contando la que ya tenía), con
   * desempate al azar. Así dos pasadas seguidas no dan el mismo resultado, pero
   * la diferencia entre el más y el menos cargado nunca pasa de uno.
   */
  async assignPending(): Promise<AssignmentResult> {
    if (this.running) return { assigned: 0, agents: 0, skipped: 'ya hay una pasada en curso' };
    this.running = true;
    try {
      const agents = await this.prisma.scraperAgent.findMany({
        where: { active: true },
        select: { id: true },
      });
      if (agents.length === 0) {
        return { assigned: 0, agents: 0, skipped: 'no hay agentes activos' };
      }

      const pending = await this.prisma.auctionCalendarEntry.findMany({
        where: {
          scraperAgentId: null,
          startedAt: { gte: new Date() },
          status: { not: 'ended' },
          totalAvailableItems: { gt: 0 }, // sin inventario no hay nada que mirar
        },
        take: BATCH,
        select: { id: true },
      });
      if (pending.length === 0) return { assigned: 0, agents: agents.length, skipped: null };

      const counts = await this.currentLoad(agents.map((a) => a.id));
      const byAgent = this.deal(shuffle(pending.map((p) => p.id)), counts);

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

  /**
   * Traspasa las subastas futuras de un agente: a otro concreto, o repartidas
   * entre los activos que queden. Se usa al borrar o desactivar un agente.
   */
  async reassignFrom(
    fromAgentId: string,
    target: { toAgentId?: string } = {},
  ): Promise<{ moved: number }> {
    const entries = await this.prisma.auctionCalendarEntry.findMany({
      where: {
        scraperAgentId: fromAgentId,
        startedAt: { gte: new Date() },
        status: { not: 'ended' },
      },
      select: { id: true },
    });
    if (entries.length === 0) return { moved: 0 };

    if (target.toAgentId) {
      const res = await this.prisma.auctionCalendarEntry.updateMany({
        where: { id: { in: entries.map((e) => e.id) } },
        data: { scraperAgentId: target.toAgentId },
      });
      return { moved: res.count };
    }

    const others = await this.prisma.scraperAgent.findMany({
      where: { active: true, id: { not: fromAgentId } },
      select: { id: true },
    });
    if (others.length === 0) {
      // Nadie a quien pasárselas: se sueltan y el job diario las recogerá.
      const res = await this.prisma.auctionCalendarEntry.updateMany({
        where: { id: { in: entries.map((e) => e.id) } },
        data: { scraperAgentId: null },
      });
      return { moved: res.count };
    }

    const counts = await this.currentLoad(others.map((o) => o.id));
    const byAgent = this.deal(shuffle(entries.map((e) => e.id)), counts);

    let moved = 0;
    for (const [agentId, ids] of byAgent) {
      const res = await this.prisma.auctionCalendarEntry.updateMany({
        where: { id: { in: ids } },
        data: { scraperAgentId: agentId },
      });
      moved += res.count;
    }
    return { moved };
  }

  /** Carga futura actual de cada agente, para no amontonar sobre quien ya tiene. */
  private async currentLoad(agentIds: string[]): Promise<Map<string, number>> {
    const counts = new Map<string, number>(agentIds.map((id) => [id, 0]));
    const grouped = await this.prisma.auctionCalendarEntry.groupBy({
      by: ['scraperAgentId'],
      where: {
        scraperAgentId: { in: agentIds },
        startedAt: { gte: new Date() },
        status: { not: 'ended' },
      },
      _count: { _all: true },
    });
    for (const g of grouped) {
      if (g.scraperAgentId) counts.set(g.scraperAgentId, g._count._all);
    }
    return counts;
  }

  /** Agrupa por agente para hacer un updateMany por agente, no uno por subasta. */
  private deal(entryIds: string[], counts: Map<string, number>): Map<string, string[]> {
    const byAgent = new Map<string, string[]>();
    // Orden aleatorio de partida: si dos agentes empatan a carga, no gana
    // siempre el mismo.
    const order = shuffle([...counts.keys()]);

    for (const entryId of entryIds) {
      let bestId = order[0];
      let best = Number.POSITIVE_INFINITY;
      for (const id of order) {
        const n = counts.get(id) ?? 0;
        if (n < best) {
          best = n;
          bestId = id;
        }
      }
      counts.set(bestId, best + 1);
      const list = byAgent.get(bestId) ?? [];
      list.push(entryId);
      byAgent.set(bestId, list);
    }
    return byAgent;
  }
}

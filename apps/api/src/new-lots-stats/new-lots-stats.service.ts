import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';

// New-lot ingest stats are expensive (unindexed createdAt aggregations over ~1.2M
// rows), so the whole bundle is cached in-memory and recomputed on a throttle.
const STATS_TTL_MS = 15 * 60_000;

interface DayCount {
  day: string;
  count: number;
}
interface HourCount {
  hour: number;
  count: number;
}
interface KeyCount {
  key: string;
  count: number;
}

export interface NewLotsStats {
  lastArrivalAt: string | null;
  summary: {
    total: number;
    today: number;
    yesterday: number;
    last7: number;
    last30: number;
    avgPerDay30: number;
  };
  perDay: DayCount[]; // arrival day (createdAt), last 90 days
  perCreationHour: HourCount[]; // Copart createDateTime hour, last 30d
  perArrivalDOW: HourCount[]; // createdAt day-of-week (0=Sun), last 30d
  topMakes: KeyCount[];
  byState: KeyCount[];
  byTitleType: KeyCount[];
  computedAt: string | null;
}

@Injectable()
export class NewLotsStatsService {
  private readonly logger = new Logger(NewLotsStatsService.name);
  private cache: NewLotsStats | null = null;
  private computedAt = 0;
  private computing = false;

  constructor(private readonly prisma: PrismaService) {}

  /** Typed raw query (the PrismaService getter drops the generic signature). */
  private raw<T>(sql: string): Promise<T> {
    return this.prisma.$queryRawUnsafe(sql) as Promise<T>;
  }

  /** Return the cached bundle, kicking off a throttled recompute in the background. */
  getStats(): NewLotsStats {
    this.maybeRefresh();
    return (
      this.cache ?? {
        lastArrivalAt: null,
        summary: { total: 0, today: 0, yesterday: 0, last7: 0, last30: 0, avgPerDay30: 0 },
        perDay: [],
        perCreationHour: [],
        perArrivalDOW: [],
        topMakes: [],
        byState: [],
        byTitleType: [],
        computedAt: null,
      }
    );
  }

  private maybeRefresh() {
    if (this.computing) return;
    if (this.cache && Date.now() - this.computedAt < STATS_TTL_MS) return;
    this.computing = true;
    this.compute()
      .then((s) => {
        this.cache = s;
        this.computedAt = Date.now();
      })
      .catch((e) => this.logger.warn(`[NewLotsStats] compute failed: ${e.message}`))
      .finally(() => {
        this.computing = false;
      });
  }

  private async compute(): Promise<NewLotsStats> {
    const num = (v: unknown) => Number(v ?? 0);

    // Q1 — arrivals per day (last 90d) + last arrival timestamp
    const perDayRows = await this.raw<Array<{ day: string; c: number }>>(
      `SELECT to_char(date_trunc('day', "createdAt"), 'YYYY-MM-DD') AS day, count(*)::int AS c
       FROM auction_listings
       WHERE "createdAt" >= now() - interval '90 days'
       GROUP BY 1 ORDER BY 1`,
    );
    const lastRow = await this.raw<Array<{ m: Date | null }>>(
      `SELECT max("createdAt") AS m FROM auction_listings`,
    );

    // Q2 — Copart creation hour (last 30d arrivals)
    const hourRows = await this.raw<Array<{ hr: number; c: number }>>(
      `SELECT extract(hour from to_timestamp(left("createDateTime",19),'YYYY-MM-DD-HH24.MI.SS'))::int AS hr, count(*)::int AS c
       FROM auction_listings
       WHERE "createdAt" >= now() - interval '30 days'
         AND "createDateTime" ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{2}\\.[0-9]{2}\\.[0-9]{2}'
       GROUP BY 1 ORDER BY 1`,
    );

    // Q3 — arrival day-of-week (last 30d)
    const dowRows = await this.raw<Array<{ dow: number; c: number }>>(
      `SELECT extract(dow from "createdAt")::int AS dow, count(*)::int AS c
       FROM auction_listings WHERE "createdAt" >= now() - interval '30 days'
       GROUP BY 1 ORDER BY 1`,
    );

    // Q4/Q5/Q6 — breakdowns (last 30d), use canonical make
    const makeRows = await this.raw<Array<{ k: string; c: number }>>(
      `SELECT coalesce("makeCanonical", "make") AS k, count(*)::int AS c
       FROM auction_listings
       WHERE "createdAt" >= now() - interval '30 days' AND "make" IS NOT NULL
       GROUP BY 1 ORDER BY 2 DESC LIMIT 15`,
    );
    const stateRows = await this.raw<Array<{ k: string; c: number }>>(
      `SELECT "locationState" AS k, count(*)::int AS c
       FROM auction_listings
       WHERE "createdAt" >= now() - interval '30 days' AND "locationState" IS NOT NULL
       GROUP BY 1 ORDER BY 2 DESC LIMIT 15`,
    );
    const titleRows = await this.raw<Array<{ k: string; c: number }>>(
      `SELECT "saleTitleType" AS k, count(*)::int AS c
       FROM auction_listings
       WHERE "createdAt" >= now() - interval '30 days' AND "saleTitleType" IS NOT NULL
       GROUP BY 1 ORDER BY 2 DESC LIMIT 15`,
    );

    // Derive summary from perDay (UTC day keys)
    const byDay = new Map(perDayRows.map((r) => [r.day, num(r.c)]));
    const dayKey = (d: Date) => d.toISOString().slice(0, 10);
    const now = new Date();
    const todayK = dayKey(now);
    const yK = dayKey(new Date(now.getTime() - 86400_000));
    let last7 = 0;
    let last30 = 0;
    let total = 0;
    for (const [day, c] of byDay) {
      total += c;
      const ageDays = (now.getTime() - new Date(day + 'T00:00:00Z').getTime()) / 86400_000;
      if (ageDays < 7) last7 += c;
      if (ageDays < 30) last30 += c;
    }

    return {
      lastArrivalAt: lastRow[0]?.m ? new Date(lastRow[0].m).toISOString() : null,
      summary: {
        total,
        today: byDay.get(todayK) ?? 0,
        yesterday: byDay.get(yK) ?? 0,
        last7,
        last30,
        avgPerDay30: Math.round(last30 / 30),
      },
      perDay: perDayRows.map((r) => ({ day: r.day, count: num(r.c) })),
      perCreationHour: hourRows.map((r) => ({ hour: num(r.hr), count: num(r.c) })),
      perArrivalDOW: dowRows.map((r) => ({ hour: num(r.dow), count: num(r.c) })),
      topMakes: makeRows.map((r) => ({ key: r.k, count: num(r.c) })),
      byState: stateRows.map((r) => ({ key: r.k, count: num(r.c) })),
      byTitleType: titleRows.map((r) => ({ key: r.k, count: num(r.c) })),
      computedAt: new Date().toISOString(),
    };
  }
}

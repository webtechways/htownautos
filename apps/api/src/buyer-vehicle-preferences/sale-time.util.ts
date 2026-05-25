/**
 * Resolves whether a Copart auction lot's sale moment is still in the future.
 *
 * Copart stores `saleDate` as an integer YYYYMMDD, `saleTime` as HHMM (24h),
 * and `timeZone` as an abbreviation like "CT" / "PT" / "ET" / "MT". We map
 * those to IANA zones and use `Intl.DateTimeFormat` to compute the UTC
 * instant — DST-correct, no external dependencies.
 */

const TZ_ABBREV_TO_IANA: Record<string, string> = {
  CT: 'America/Chicago',
  CST: 'America/Chicago',
  CDT: 'America/Chicago',
  ET: 'America/New_York',
  EST: 'America/New_York',
  EDT: 'America/New_York',
  PT: 'America/Los_Angeles',
  PST: 'America/Los_Angeles',
  PDT: 'America/Los_Angeles',
  MT: 'America/Denver',
  MST: 'America/Denver',
  MDT: 'America/Denver',
  AT: 'America/Halifax',
  AST: 'America/Halifax',
  ADT: 'America/Halifax',
  HT: 'Pacific/Honolulu',
  HST: 'Pacific/Honolulu',
};

const DEFAULT_IANA = 'America/Chicago'; // Copart HQ default

/**
 * Offset (in minutes) for IANA `tz` at the given absolute moment.
 * Positive = ahead of UTC, negative = behind.
 */
function tzOffsetMinutes(tz: string, at: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(at);

  const map: Record<string, string> = {};
  for (const p of parts) if (p.type !== 'literal') map[p.type] = p.value;

  const asIfUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour === '24' ? '00' : map.hour),
    Number(map.minute),
    Number(map.second),
  );
  return (asIfUtc - at.getTime()) / 60000;
}

/**
 * Converts a wall-clock `YYYYMMDD` + `HHMM` in the given timezone
 * abbreviation to a UTC `Date`. Returns null if saleDate is missing.
 */
export function saleMomentUtc(
  saleDate: number | null,
  saleTime: string | null,
  timeZone: string | null,
): Date | null {
  if (saleDate == null) return null;
  const raw = String(saleDate).padStart(8, '0');
  if (raw.length !== 8) return null;
  const year = Number(raw.slice(0, 4));
  const month = Number(raw.slice(4, 6));
  const day = Number(raw.slice(6, 8));
  if (!year || !month || !day) return null;

  const tRaw = (saleTime ?? '0000').replace(/[^\d]/g, '').padStart(4, '0').slice(0, 4);
  const hour = Number(tRaw.slice(0, 2));
  const minute = Number(tRaw.slice(2, 4));

  const iana =
    TZ_ABBREV_TO_IANA[(timeZone ?? '').trim().toUpperCase()] ?? DEFAULT_IANA;

  // Start by building a Date as if the wall-clock were UTC, then shift by
  // the local offset at that instant. Because `offset` is defined relative
  // to a UTC moment, we iterate once to converge — DST transitions only
  // need a single correction step for the "fall back" hour edge case.
  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offset1 = tzOffsetMinutes(iana, new Date(naiveUtc));
  let correctedUtc = naiveUtc - offset1 * 60000;
  const offset2 = tzOffsetMinutes(iana, new Date(correctedUtc));
  if (offset2 !== offset1) {
    correctedUtc = naiveUtc - offset2 * 60000;
  }
  return new Date(correctedUtc);
}

/**
 * True if the lot's sale is strictly in the future (sale moment > now).
 * Lots with an unknown saleDate are considered "future" — they appear
 * labelled as "Future Sale" in the UI.
 */
export function isFutureSale(
  saleDate: number | null,
  saleTime: string | null,
  timeZone: string | null,
  now: Date = new Date(),
): boolean {
  if (saleDate == null) return true;
  const moment = saleMomentUtc(saleDate, saleTime, timeZone);
  if (!moment) return true; // unparseable → include (don't hide good data)
  return moment.getTime() > now.getTime();
}

/**
 * Socket.IO / Engine.IO frame decoding + filtering, ported 1:1 from the Chrome
 * extension's ws-bridge.js so the server-side monitor captures exactly what the
 * extension captured.
 *
 * Typical Copart frame relayed by broadcast.autobidmaster.com:
 *   42["event",{"auction":"copart-110-a","lot":57600736,"bid":3200,"order":38,
 *               "asking":3250,"reserve":true,"sold":true,"round":1,"ticks":0}]
 */

// 42["name",payload]  /  42/namespace,["name",payload]
const SIO_FRAME = /^(\d{2})(\/[^,]*,)?(\[[\s\S]*\])$/;

export interface DecodedFrame {
  name: string;
  payload: any;
  extra: any[];
}

/** Returns null for anything that is not a Socket.IO EVENT (42) or ACK (43). */
export function decodeFrame(raw: string): DecodedFrame | null {
  const m = raw.match(SIO_FRAME);
  if (!m) return null;
  // Ignore 0/40 (handshake) and 2/3 (ping/pong).
  if (m[1] !== '42' && m[1] !== '43') return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(m[3]);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || !parsed.length) return null;

  return { name: String(parsed[0]), payload: parsed[1], extra: parsed.slice(2) };
}

/** Comma-separated allow-list; empty means "every event name". */
export function nameAllowed(name: string, eventNames: string | null | undefined): boolean {
  const list = (eventNames || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return !list.length || list.includes(name);
}

/** Regex match on the socket URL; empty pattern means "every socket". */
export function wsUrlAllowed(wsUrl: string, pattern: string | null | undefined): boolean {
  if (!pattern) return true;
  try {
    return new RegExp(pattern, 'i').test(wsUrl);
  } catch {
    return true; // a bad regex must not silence the monitor
  }
}

/**
 * Dedupe key. A sold lot is emitted once ever; live bids are deduped on the
 * exact (lot, order, bid) triple so re-broadcasts of the same tick collapse.
 */
export function dedupeKey(d: any): string | null {
  if (d && d.lot != null) {
    return d.sold === true ? `sold:${d.lot}` : `${d.lot}:${d.order}:${d.bid}`;
  }
  return null;
}

export interface SaleEvent {
  auction?: string;
  lot: number;
  bid?: number;
  order?: number;
  asking?: number;
  reserve?: boolean;
  sold?: boolean;
  round?: number;
  ticks?: number;
  event: string;
  receivedAt: string;
  pageUrl: string;
  raw?: string;
}

export interface FilterOptions {
  onlySold: boolean;
  eventNames: string;
  wsUrlPattern: string;
  includeRaw: boolean;
}

/**
 * Decode + filter one frame into the payload shape the ingest endpoint expects,
 * or null when the frame should be ignored. Dedupe is the caller's job (it owns
 * the cross-page key set).
 */
export function frameToSaleEvent(
  wsUrl: string,
  raw: string,
  pageUrl: string,
  opts: FilterOptions,
): SaleEvent | null {
  if (!wsUrlAllowed(wsUrl, opts.wsUrlPattern)) return null;

  const decoded = decodeFrame(raw);
  if (!decoded || !nameAllowed(decoded.name, opts.eventNames)) return null;

  const d = decoded.payload;
  if (!d || typeof d !== 'object') return null;
  if (opts.onlySold && d.sold !== true) return null;
  if (d.lot == null || isNaN(Number(d.lot))) return null;

  const event: SaleEvent = {
    ...d,
    lot: Number(d.lot),
    event: decoded.name,
    receivedAt: new Date().toISOString(),
    pageUrl,
  };
  if (opts.includeRaw) event.raw = raw;
  return event;
}

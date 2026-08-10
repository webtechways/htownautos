/**
 * Thin client for the HTown API. Everything the worker needs lives behind the
 * shared ingest secret, so there is no Clerk session involved.
 *
 * The API mounts every route under the `api/v1` global prefix; API_BASE_URL is
 * configured without it, so it is appended here (and tolerated if already set).
 */
const PREFIX = 'api/v1';

export function apiUrl(path: string): string {
  const base = (process.env.API_BASE_URL || '').replace(/\/+$/, '');
  if (!base) throw new Error('API_BASE_URL is not configured');
  const clean = path.replace(/^\/+/, '');
  return base.endsWith(`/${PREFIX}`) ? `${base}/${clean}` : `${base}/${PREFIX}/${clean}`;
}

export function ingestKey(): string {
  const key = process.env.AUCTION_INGEST_API_KEY;
  if (!key) throw new Error('AUCTION_INGEST_API_KEY is not configured');
  return key;
}

export async function postJson(
  path: string,
  body: unknown,
  timeoutMs = 30_000,
): Promise<string> {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': ingestKey() },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} ${text.slice(0, 200)}`);
  return text;
}

/**
 * Run an async mapper over `items` with a bounded number of workers in flight.
 * There is no `p-limit` in the repo; this is the minimal replacement used by the
 * image caching pipeline to avoid firing dozens of proxied downloads at once.
 *
 * Never rejects: each item resolves to `{ status: 'fulfilled', value }` or
 * `{ status: 'rejected', reason }`, mirroring `Promise.allSettled` ordering.
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  const limit = Math.max(1, Math.floor(concurrency) || 1);
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let next = 0;

  async function worker(): Promise<void> {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      try {
        results[i] = { status: 'fulfilled', value: await mapper(items[i], i) };
      } catch (reason) {
        results[i] = { status: 'rejected', reason };
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

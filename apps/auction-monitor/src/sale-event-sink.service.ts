import { Injectable, Logger } from '@nestjs/common';
import { postJson } from './api-client';
import type { SaleEvent } from './sio-decoder';

interface QueueItem {
  event: SaleEvent;
  sessionId: string;
  key: string | null;
  attempts: number;
}

export interface SinkResult {
  sessionId: string;
  count: number;
  ok: boolean;
  error?: string;
}

/**
 * Ships captured events to the same endpoint the Chrome extension fed through
 * n8n: POST {API_BASE_URL}/auction-sale-results/ingest with the shared-secret
 * header. Reusing that path means the ingest/merge logic stays in one place.
 *
 * Dedupe is global (not per page) so overlapping sale pages can never post the
 * same sold lot twice.
 */
@Injectable()
export class SaleEventSinkService {
  private readonly logger = new Logger(SaleEventSinkService.name);

  private queue: QueueItem[] = [];
  private draining = false;
  private readonly sentKeys = new Set<string>();
  private readonly keyOrder: string[] = [];
  private readonly MAX_KEYS = 20_000;
  private readonly MAX_ATTEMPTS = 3;
  private readonly BATCH = 50;

  /** Per-session tally of rows the API confirmed, drained by the scheduler. */
  private readonly ingested = new Map<string, number>();
  private readonly failures = new Map<string, number>();

  private mirrorUrl: string | null = null;

  setMirrorUrl(url: string | null): void {
    this.mirrorUrl = url && url.trim() ? url.trim() : null;
  }

  /** Returns false when the event was a duplicate and therefore not queued. */
  enqueue(sessionId: string, event: SaleEvent, key: string | null): boolean {
    if (key) {
      if (this.sentKeys.has(key)) return false;
      this.remember(key);
    }
    this.queue.push({ event, sessionId, key, attempts: 0 });
    void this.drain();
    return true;
  }

  private remember(key: string): void {
    this.sentKeys.add(key);
    this.keyOrder.push(key);
    if (this.keyOrder.length > this.MAX_KEYS) {
      const old = this.keyOrder.shift();
      if (old) this.sentKeys.delete(old);
    }
  }

  private async drain(): Promise<void> {
    if (this.draining) return;
    this.draining = true;
    try {
      while (this.queue.length) {
        const batch = this.queue.splice(0, this.BATCH);
        await this.post(batch);
      }
    } finally {
      this.draining = false;
    }
  }

  private async post(batch: QueueItem[]): Promise<void> {
    const payload = batch.map((i) => i.event);
    try {
      await postJson('auction-sale-results/ingest', payload);

      for (const item of batch) this.bump(this.ingested, item.sessionId);
      this.logger.log(`Ingested ${batch.length} event(s)`);
      void this.mirror(payload);
    } catch (err: any) {
      this.logger.error(`Ingest failed: ${err.message}`);
      const retry: QueueItem[] = [];
      for (const item of batch) {
        item.attempts++;
        if (item.attempts < this.MAX_ATTEMPTS) {
          retry.push(item);
        } else {
          this.bump(this.failures, item.sessionId);
          // Give up on the key too, so a later re-broadcast gets another chance.
          if (item.key) this.sentKeys.delete(item.key);
        }
      }
      if (retry.length) {
        await new Promise((r) => setTimeout(r, 2_000));
        this.queue.unshift(...retry);
      }
    }
  }

  /** Optional copy to the legacy n8n webhook while migrating off the extension. */
  private async mirror(payload: SaleEvent[]): Promise<void> {
    if (!this.mirrorUrl) return;
    try {
      await fetch(this.mirrorUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (err: any) {
      this.logger.warn(`Mirror webhook failed: ${err.message}`);
    }
  }

  private bump(map: Map<string, number>, sessionId: string): void {
    map.set(sessionId, (map.get(sessionId) ?? 0) + 1);
  }

  /** Read-and-reset the counters for one session (called on each scheduler tick). */
  takeCounters(sessionId: string): { ingested: number; errors: number } {
    const ingested = this.ingested.get(sessionId) ?? 0;
    const errors = this.failures.get(sessionId) ?? 0;
    this.ingested.delete(sessionId);
    this.failures.delete(sessionId);
    return { ingested, errors };
  }

  get pending(): number {
    return this.queue.length;
  }
}

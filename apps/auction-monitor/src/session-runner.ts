import { Logger } from '@nestjs/common';
import type { CDPSession, Page } from 'puppeteer-core';
import type { AbmSessionService } from './abm-session.service';
import type { SaleEventSinkService } from './sale-event-sink.service';
import { dedupeKey, frameToSaleEvent, type FilterOptions } from './sio-decoder';

export interface RunnerTarget {
  sessionId: string;
  url: string;
  locationName: string;
}

/**
 * One browser page parked on a sale-search page, reading its Socket.IO frames.
 *
 * Frames are read passively over CDP (Network.webSocketFrameReceived) instead of
 * patching window.WebSocket like the extension does — same data, but nothing is
 * injected into the page, so a change in their bundle cannot break us.
 */
export class SessionRunner {
  private readonly logger: Logger;
  private page: Page | null = null;
  private client: CDPSession | null = null;
  /** CDP requestId → socket URL, so each frame can be matched to its socket. */
  private readonly socketUrls = new Map<string, string>();
  private readonly logLines: string[] = [];
  private stopped = false;

  framesSeen = 0;
  eventsSold = 0;
  lastEventAt: Date | null = null;
  startedAt: Date | null = null;

  constructor(
    readonly target: RunnerTarget,
    private readonly session: AbmSessionService,
    private readonly sink: SaleEventSinkService,
    private readonly filters: FilterOptions,
  ) {
    this.logger = new Logger(`Runner:${target.locationName}`);
  }

  get isStopped(): boolean {
    return this.stopped;
  }

  /** False once Chromium has dropped the page (crash, OOM, target closed). */
  get isAlive(): boolean {
    return !this.stopped && !!this.page && !this.page.isClosed();
  }

  get log(): string[] {
    return [...this.logLines];
  }

  private note(line: string): void {
    const stamped = `${new Date().toISOString()} ${line}`;
    this.logLines.push(stamped);
    if (this.logLines.length > 40) this.logLines.shift();
    this.logger.log(line);
  }

  async start(): Promise<void> {
    const login = await this.session.ensureLoggedIn();
    if (!login.ok) throw new Error(`Not logged in: ${login.error}`);

    this.page = await this.session.newPage();
    this.page.on('error', (err) => this.note(`page crashed: ${err.message}`));
    this.page.on('pageerror', () => undefined); // their JS errors are not ours

    await this.attachSocketTap(this.page);

    await this.page.goto(this.target.url, {
      waitUntil: 'domcontentloaded',
      timeout: 120_000,
    });

    // A stale cookie lands us on the login form instead of the sale page.
    if (/\/login\b/i.test(this.page.url())) {
      this.note('landed on login — re-authenticating');
      this.session.invalidateLogin();
      const retry = await this.session.ensureLoggedIn(true);
      if (!retry.ok) throw new Error(`Re-login failed: ${retry.error}`);
      await this.page.goto(this.target.url, {
        waitUntil: 'domcontentloaded',
        timeout: 120_000,
      });
    }

    this.startedAt = new Date();
    this.note(`watching ${this.target.url}`);
  }

  private async attachSocketTap(page: Page): Promise<void> {
    const client = await page.createCDPSession();
    this.client = client;
    await client.send('Network.enable');

    client.on('Network.webSocketCreated', ({ requestId, url }: any) => {
      this.socketUrls.set(requestId, url);
      this.note(`socket open: ${url}`);
    });
    client.on('Network.webSocketClosed', ({ requestId }: any) => {
      const url = this.socketUrls.get(requestId);
      this.socketUrls.delete(requestId);
      if (url) this.note(`socket closed: ${url}`);
    });
    client.on('Network.webSocketFrameError', ({ errorMessage }: any) => {
      this.note(`socket error: ${errorMessage}`);
    });
    client.on('Network.webSocketFrameReceived', ({ requestId, response }: any) => {
      const payload = response?.payloadData;
      if (typeof payload !== 'string') return; // binary frames are not ours
      this.onFrame(this.socketUrls.get(requestId) ?? '', payload);
    });
  }

  private onFrame(wsUrl: string, raw: string): void {
    if (this.stopped) return;
    let event;
    try {
      event = frameToSaleEvent(wsUrl, raw, this.target.url, this.filters);
    } catch (err: any) {
      this.note(`frame decode failed: ${err.message}`);
      return;
    }
    if (!event) return;

    // Liveness first: a stream of duplicates still proves the socket is alive,
    // so it must keep the idle watchdog from closing the page.
    this.lastEventAt = new Date();

    // Counters track unique events only — a re-broadcast of the same tick is not
    // a new sale.
    const queued = this.sink.enqueue(this.target.sessionId, event, dedupeKey(event));
    if (!queued) return;

    this.framesSeen++;
    if (event.sold === true) this.eventsSold++;

    if (this.framesSeen % 25 === 1) {
      this.note(`lot ${event.lot} bid ${event.bid ?? '-'} sold=${event.sold === true}`);
    }
  }

  async stop(): Promise<void> {
    if (this.stopped) return;
    this.stopped = true;
    await this.client?.detach().catch(() => undefined);
    await this.page?.close().catch(() => undefined);
    this.client = null;
    this.page = null;
    this.note('stopped');
  }
}

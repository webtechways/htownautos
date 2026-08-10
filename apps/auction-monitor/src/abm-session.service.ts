import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import type { Browser, Page } from 'puppeteer-core';
import puppeteer from 'puppeteer-core';
import { ScreenshotService } from './screenshot.service';

const CONTACT_URL = 'https://www.autobidmaster.com/en/myaccount/contact-information/';
const LOGIN_URL = 'https://www.autobidmaster.com/en/login/';

export interface LoginResult {
  ok: boolean;
  error?: string;
  finalUrl?: string;
}

/**
 * Owns the single Chromium instance and the AutoBidMaster session.
 *
 * Login check follows the flow the staff use by hand: hit the account page
 * first; if AutoBidMaster bounces us to /en/login/, sign in with ABM_USER /
 * ABM_PASS and verify the account page loads. Cookies live in a persistent
 * user-data-dir, so a restart usually skips the login entirely.
 */
@Injectable()
export class AbmSessionService implements OnModuleDestroy {
  private readonly logger = new Logger(AbmSessionService.name);
  private browser: Browser | null = null;
  private launching: Promise<Browser> | null = null;
  private userAgent: string | null = null;
  private loginChain: Promise<LoginResult> = Promise.resolve({ ok: false });
  private lastLoginOkAt = 0;

  /** Re-verify the session at most this often (ms) unless forced. */
  private readonly LOGIN_TTL_MS = 30 * 60 * 1000;

  constructor(private readonly screenshots: ScreenshotService) {}

  private get profileDir(): string {
    return process.env.MONITOR_PROFILE_DIR || '/data/abm-profile';
  }

  private get headless(): boolean {
    return process.env.MONITOR_HEADLESS !== 'false';
  }

  async getBrowser(): Promise<Browser> {
    if (this.browser?.connected) return this.browser;
    if (this.launching) return this.launching;

    this.launching = (async () => {
      const executablePath =
        process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH || undefined;
      this.logger.log(
        `Launching Chromium (headless=${this.headless}, profile=${this.profileDir}, bin=${executablePath ?? 'bundled'})`,
      );
      const browser = await puppeteer.launch({
        headless: this.headless,
        executablePath,
        userDataDir: this.profileDir,
        protocolTimeout: 180_000,
        // Drop the banner flag Chrome sets for automation; Cloudflare reads it.
        ignoreDefaultArgs: ['--enable-automation'],
        args: [
          '--disable-blink-features=AutomationControlled',
          '--lang=en-US,en',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          // /dev/shm is tiny in containers; without this Chromium crashes under load.
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-default-browser-check',
          '--window-size=1280,900',
          // The whole point is capturing sockets in pages nobody is looking at —
          // never let Chromium throttle or freeze a backgrounded tab.
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-features=CalculateNativeWinOcclusion,IntensiveWakeUpThrottling',
        ],
      });
      browser.on('disconnected', () => {
        this.logger.warn('Chromium disconnected');
        this.browser = null;
        this.userAgent = null;
        this.lastLoginOkAt = 0;
      });
      this.browser = browser;
      return browser;
    })();

    try {
      return await this.launching;
    } finally {
      this.launching = null;
    }
  }

  /**
   * The User-Agent Chromium reports, with the `HeadlessChrome` token swapped for
   * `Chrome`. That single token is what Cloudflare blocks on: with it, every
   * request to autobidmaster.com returns a 403 challenge page; without it, the
   * exact same browser gets 200. Deriving it from the running binary keeps the
   * version honest across Chromium upgrades.
   */
  private async realUserAgent(browser: Browser): Promise<string> {
    if (process.env.MONITOR_USER_AGENT) return process.env.MONITOR_USER_AGENT;
    if (this.userAgent) return this.userAgent;
    const raw = await browser.userAgent();
    this.userAgent = raw.replace(/HeadlessChrome/g, 'Chrome');
    return this.userAgent;
  }

  /** A page tuned for long-lived socket listening: no images, fonts or media. */
  async newPage(): Promise<Page> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.setUserAgent(await this.realUserAgent(browser));
    await page.setExtraHTTPHeaders({ 'accept-language': 'en-US,en;q=0.9' });
    // Cheap insurance on top of the UA: the obvious automation tells.
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      (window as any).chrome = { runtime: {} };
    });
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const type = req.resourceType();
      if (type === 'image' || type === 'media' || type === 'font') {
        req.abort().catch(() => undefined);
      } else {
        req.continue().catch(() => undefined);
      }
    });
    return page;
  }

  /**
   * Serialized so N sessions starting at once trigger at most one login.
   * Skips the round-trip when a check succeeded recently.
   */
  async ensureLoggedIn(force = false): Promise<LoginResult> {
    if (!force && Date.now() - this.lastLoginOkAt < this.LOGIN_TTL_MS) {
      return { ok: true };
    }
    this.loginChain = this.loginChain.then(
      () => this.doEnsureLoggedIn(force),
      () => this.doEnsureLoggedIn(force),
    );
    return this.loginChain;
  }

  private async doEnsureLoggedIn(force: boolean): Promise<LoginResult> {
    if (!force && Date.now() - this.lastLoginOkAt < this.LOGIN_TTL_MS) {
      return { ok: true };
    }

    const user = process.env.ABM_USER;
    const pass = process.env.ABM_PASS || process.env.ABM_PASSWORD;
    if (!user || !pass) {
      return { ok: false, error: 'ABM_USER / ABM_PASS not configured' };
    }

    let page: Page | null = null;
    try {
      page = await this.newPage();

      // 1. Try the account page. If it renders, the session is already good.
      await this.goto(page, CONTACT_URL);
      if (!this.isLoginPage(page.url())) {
        this.lastLoginOkAt = Date.now();
        this.logger.log('AutoBidMaster session already active');
        if (force) await this.screenshots.capture(page, 'login', 'session-active');
        return { ok: true, finalUrl: page.url() };
      }

      // 2. Redirected to the login form → sign in.
      this.logger.log('Redirected to login — signing in');
      await this.submitLogin(page, user, pass);

      // 3. Verify by loading the account page again.
      await this.goto(page, CONTACT_URL);
      if (this.isLoginPage(page.url())) {
        // The screenshot is the whole point here: a captcha or a changed form is
        // invisible in a log line.
        await this.screenshots.capture(page, 'login', 'login-failed');
        return {
          ok: false,
          error: 'Login did not stick (wrong credentials, captcha or 2FA)',
          finalUrl: page.url(),
        };
      }

      this.lastLoginOkAt = Date.now();
      this.logger.log('Logged in to AutoBidMaster');
      await this.screenshots.capture(page, 'login', 'logged-in');
      return { ok: true, finalUrl: page.url() };
    } catch (err: any) {
      this.lastLoginOkAt = 0;
      this.logger.error(`Login check failed: ${err.message}`);
      if (page) await this.screenshots.capture(page, 'login', 'login-error');
      return { ok: false, error: err.message };
    } finally {
      await page?.close().catch(() => undefined);
    }
  }

  private isLoginPage(url: string): boolean {
    return /\/login\b/i.test(url);
  }

  private async goto(page: Page, url: string): Promise<void> {
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await this.assertNotBlocked(page, res?.status() ?? 0);
    await this.dismissCookieBanner(page);
  }

  /**
   * A bot challenge is not a login page: the URL keeps its original path, so
   * "we were not redirected to /login" would read it as a healthy session. Check
   * the response status and the challenge markers explicitly.
   */
  async assertNotBlocked(page: Page, status: number): Promise<void> {
    const title = await page.title().catch(() => '');
    const blocked =
      /cloudflare|attention required|you have been blocked|just a moment/i.test(title);
    if (blocked || status === 403 || status === 429) {
      throw new Error(
        `Blocked by AutoBidMaster's bot protection (HTTP ${status}${title ? `, "${title}"` : ''})`,
      );
    }
    if (status >= 400) {
      throw new Error(`AutoBidMaster returned HTTP ${status} for ${page.url()}`);
    }
  }

  /**
   * Selectors are kept loose on purpose — AutoBidMaster's markup is not ours and
   * a class rename should not take the monitor down.
   */
  private async submitLogin(page: Page, user: string, pass: string): Promise<void> {
    if (!this.isLoginPage(page.url())) {
      await this.goto(page, LOGIN_URL);
    }

    const emailSel = await this.firstSelector(page, [
      'input[name="email"]',
      'input[type="email"]',
      'input[name="username"]',
      'input[id*="email" i]',
    ]);
    const passSel = await this.firstSelector(page, [
      'input[name="password"]',
      'input[type="password"]',
      'input[id*="password" i]',
    ]);
    if (!emailSel || !passSel) {
      throw new Error(`Login form not found at ${page.url()}`);
    }

    await page.click(emailSel, { count: 3 }).catch(() => undefined);
    await page.type(emailSel, user, { delay: 25 });
    await page.click(passSel, { count: 3 }).catch(() => undefined);
    await page.type(passSel, pass, { delay: 25 });

    const submitSel = await this.firstSelector(page, [
      'button[type="submit"]',
      'input[type="submit"]',
      'form button',
    ]);

    const navigation = page
      .waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60_000 })
      .catch(() => undefined);
    if (submitSel) await page.click(submitSel).catch(() => undefined);
    else await page.keyboard.press('Enter');
    await navigation;

    // SPA logins sometimes swap the view without a navigation event.
    await new Promise((r) => setTimeout(r, 3_000));
  }

  private async firstSelector(page: Page, selectors: string[]): Promise<string | null> {
    for (const sel of selectors) {
      const found = await page.$(sel).catch(() => null);
      if (found) {
        await found.dispose().catch(() => undefined);
        return sel;
      }
    }
    return null;
  }

  /** Consent overlays can swallow clicks on the login button. */
  private async dismissCookieBanner(page: Page): Promise<void> {
    try {
      await page.evaluate(() => {
        const wanted = ['accept', 'agree', 'got it', 'aceptar'];
        const nodes = Array.from(document.querySelectorAll('button, a[role="button"]'));
        for (const el of nodes) {
          const text = (el.textContent || '').trim().toLowerCase();
          if (text && wanted.some((w) => text.includes(w)) && text.length < 40) {
            (el as HTMLElement).click();
            return;
          }
        }
      });
    } catch {
      /* banner handling is best-effort */
    }
  }

  /** Drops the cached "logged in" state so the next check re-verifies. */
  invalidateLogin(): void {
    this.lastLoginOkAt = 0;
  }

  async onModuleDestroy(): Promise<void> {
    await this.browser?.close().catch(() => undefined);
    this.browser = null;
  }
}

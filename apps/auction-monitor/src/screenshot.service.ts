import { Injectable, Logger } from '@nestjs/common';
import type { Page } from 'puppeteer-core';
import { postJson } from './api-client';

/**
 * Eyes for a headless container. Captures the page as JPEG and hands it to the
 * API (which owns the S3 credentials) so staff can see what Chromium saw — a
 * captcha on the login form, a redirect, an empty sale page.
 */
@Injectable()
export class ScreenshotService {
  private readonly logger = new Logger(ScreenshotService.name);

  /** Never throws: a failed capture must not take a monitoring session down. */
  async capture(
    page: Page,
    kind: 'login' | 'session',
    label: string,
    sessionId?: string,
  ): Promise<string | null> {
    try {
      const buffer = (await page.screenshot({
        type: 'jpeg',
        quality: 55,
        captureBeyondViewport: false,
      })) as Buffer;

      const body = await postJson('auction-monitor/screenshot', {
        kind,
        sessionId,
        label,
        imageBase64: Buffer.from(buffer).toString('base64'),
      });
      const url = JSON.parse(body)?.url ?? null;
      this.logger.log(`Captured ${kind}/${label}`);
      return url;
    } catch (err: any) {
      this.logger.warn(`Screenshot ${kind}/${label} failed: ${err.message}`);
      return null;
    }
  }
}

import 'dotenv/config';
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Headless live-sale monitor. Replaces the manual Chrome extension: opens each
 * monitored AutoBidMaster sale page in Chromium a few minutes before it starts
 * and forwards the Socket.IO sale frames into auction_sale_results.
 */
async function bootstrap() {
  const logger = new Logger('AuctionMonitor');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  app.enableShutdownHooks();
  logger.log('Auction monitor worker started');
}

bootstrap().catch((error) => {
  console.error('Failed to start Auction Monitor:', error);
  process.exit(1);
});

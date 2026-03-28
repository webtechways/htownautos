import 'dotenv/config';
(BigInt.prototype as any).toJSON = function () { return this.toString(); };
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('DataSync');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  logger.log('Data Sync worker started - cron jobs active');
}

bootstrap().catch((error) => {
  console.error('Failed to start Data Sync:', error);
  process.exit(1);
});

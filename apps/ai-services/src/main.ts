import 'dotenv/config';
(BigInt.prototype as any).toJSON = function () { return this.toString(); };
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('AiServices');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://app.htownautos.com'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
        exposeDefaultValues: true,
      },
    }),
  );

  const port = Number(process.env.AI_SERVICES_PORT ?? 3002);
  await app.listen(port);

  logger.log(`AI Services running on: http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start AI Services:', error);
  process.exit(1);
});

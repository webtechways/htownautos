import 'dotenv/config';
(BigInt.prototype as any).toJSON = function () { return this.toString(); };
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './logging.interceptor';

async function bootstrap() {
  const logger = new Logger('ImageService');
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

  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = Number(process.env.IMAGE_SERVICE_PORT ?? 3003);
  await app.listen(port);

  logger.log(`Image Service running on: http://localhost:${port}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start Image Service:', error);
  process.exit(1);
});

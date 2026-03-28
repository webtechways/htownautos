import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { HttpMetricsInterceptor } from './http-metrics.interceptor';

// Pretty print for development
const prettyTransport = {
  target: 'pino-pretty',
  options: {
    colorize: true,
    singleLine: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
  },
};

// Determine transport based on environment
const getTransport = () => {
  if (process.env.NODE_ENV !== 'production') {
    return prettyTransport;
  }

  return undefined; // Default JSON to stdout
};

@Global()
@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        // Custom levels to include NestJS 'log' level
        customLevels: {
          log: 30,
        },
        useOnlyCustomLevels: false,

        // Transport configuration
        transport: getTransport(),

        // Log level based on environment
        level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

        // Custom log format
        formatters: {
          level: (label) => ({ level: label }),
          bindings: (bindings) => ({
            pid: bindings.pid,
            host: bindings.hostname,
            service: 'htownautos-api',
            env: process.env.NODE_ENV || 'development',
          }),
        },

        // Custom serializers to protect sensitive data
        serializers: {
          req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            path: req.path,
            query: req.query,
            headers: {
              'user-agent': req.headers['user-agent'],
              'content-type': req.headers['content-type'],
              'x-tenant-id': req.headers['x-tenant-id'],
            },
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
          err: (err) => ({
            type: err.type,
            message: err.message,
            stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
          }),
        },

        // Auto-log requests
        autoLogging: {
          ignore: (req) => {
            const ignorePaths = ['/health', '/metrics', '/api/v1/health'];
            return ignorePaths.some(path => req.url?.includes(path));
          },
        },

        customSuccessMessage: (req, res) => {
          return `${req.method} ${req.url} completed`;
        },
        customErrorMessage: (req, res, err) => {
          return `${req.method} ${req.url} failed: ${err.message}`;
        },

        customProps: (req) => {
          return {
            correlationId: req.headers['x-correlation-id'] || req.id,
          };
        },
      },
    }),
  ],
  controllers: [MetricsController],
  providers: [
    MetricsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpMetricsInterceptor,
    },
  ],
  exports: [MetricsService],
})
export class ObservabilityModule {}

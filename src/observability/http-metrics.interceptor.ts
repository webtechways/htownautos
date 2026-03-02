import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const method = request.method;
    const route = this.getRoutePattern(request);

    // Track in-flight requests
    this.metricsService.httpRequestsInFlight.inc({ method });
    const startTime = process.hrtime.bigint();

    return next.handle().pipe(
      tap({
        next: () => {
          this.recordMetrics(method, route, response.statusCode, startTime);
        },
        error: (error) => {
          const statusCode = error.status || error.statusCode || 500;
          this.recordMetrics(method, route, statusCode, startTime);
        },
      }),
    );
  }

  private recordMetrics(
    method: string,
    route: string,
    statusCode: number,
    startTime: bigint,
  ): void {
    const endTime = process.hrtime.bigint();
    const durationSeconds = Number(endTime - startTime) / 1e9;

    const labels = {
      method,
      route,
      status_code: statusCode.toString(),
    };

    this.metricsService.httpRequestsTotal.inc(labels);
    this.metricsService.httpRequestDuration.observe(labels, durationSeconds);
    this.metricsService.httpRequestsInFlight.dec({ method });
  }

  private getRoutePattern(request: Request): string {
    // Get the route pattern instead of the actual path to reduce cardinality
    // e.g., /api/v1/buyers/123 -> /api/v1/buyers/:id
    const route = request.route?.path || request.path;

    // Normalize common patterns
    return route
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:uuid')
      .replace(/\/\d+/g, '/:id')
      .replace(/\?.*$/, ''); // Remove query string
  }
}

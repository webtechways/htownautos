import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Observability')
@Controller()
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('metrics')
  @Public()
  @ApiExcludeEndpoint() // Hide from Swagger - Prometheus scrapes this
  async getMetrics(@Res() res: any): Promise<void> {
    const metrics = await this.metricsService.getMetrics();
    res.setHeader('Content-Type', this.metricsService.getContentType());
    res.send(metrics);
  }

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  async healthCheck(): Promise<{ status: string; timestamp: string; uptime: number }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('health/live')
  @Public()
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  async liveness(): Promise<{ status: string }> {
    return { status: 'alive' };
  }

  @Get('health/ready')
  @Public()
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  async readiness(): Promise<{ status: string }> {
    // Could add checks for database, redis, etc.
    return { status: 'ready' };
  }
}

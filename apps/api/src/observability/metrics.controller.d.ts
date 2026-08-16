import { MetricsService } from './metrics.service';
export declare class MetricsController {
    private readonly metricsService;
    constructor(metricsService: MetricsService);
    getMetrics(res: any): Promise<void>;
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
    }>;
    liveness(): Promise<{
        status: string;
    }>;
    readiness(): Promise<{
        status: string;
    }>;
}

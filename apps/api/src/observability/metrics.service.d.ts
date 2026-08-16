import { OnModuleInit } from '@nestjs/common';
import { Counter, Histogram, Gauge } from 'prom-client';
export declare class MetricsService implements OnModuleInit {
    private readonly registry;
    readonly httpRequestsTotal: Counter<string>;
    readonly httpRequestDuration: Histogram<string>;
    readonly httpRequestsInFlight: Gauge<string>;
    readonly auctionSearches: Counter<string>;
    readonly buyerCreations: Counter<string>;
    readonly dealsCreated: Counter<string>;
    readonly smsMessagesSent: Counter<string>;
    readonly emailsSent: Counter<string>;
    readonly callsInitiated: Counter<string>;
    readonly dbQueryDuration: Histogram<string>;
    readonly dbConnectionsActive: Gauge<string>;
    readonly opensearchQueryDuration: Histogram<string>;
    readonly opensearchDocumentsIndexed: Counter<string>;
    readonly websocketConnections: Gauge<string>;
    readonly websocketMessagesTotal: Counter<string>;
    readonly cacheHits: Counter<string>;
    readonly cacheMisses: Counter<string>;
    constructor();
    onModuleInit(): void;
    getMetrics(): Promise<string>;
    getContentType(): string;
}

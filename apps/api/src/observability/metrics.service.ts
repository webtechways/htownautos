import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  Registry,
  Counter,
  Histogram,
  Gauge,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry: Registry;

  // HTTP metrics
  public readonly httpRequestsTotal: Counter<string>;
  public readonly httpRequestDuration: Histogram<string>;
  public readonly httpRequestsInFlight: Gauge<string>;

  // Business metrics
  public readonly auctionSearches: Counter<string>;
  public readonly buyerCreations: Counter<string>;
  public readonly dealsCreated: Counter<string>;
  public readonly smsMessagesSent: Counter<string>;
  public readonly emailsSent: Counter<string>;
  public readonly callsInitiated: Counter<string>;

  // Database metrics
  public readonly dbQueryDuration: Histogram<string>;
  public readonly dbConnectionsActive: Gauge<string>;

  // OpenSearch metrics
  public readonly opensearchQueryDuration: Histogram<string>;
  public readonly opensearchDocumentsIndexed: Counter<string>;

  // WebSocket metrics
  public readonly websocketConnections: Gauge<string>;
  public readonly websocketMessagesTotal: Counter<string>;

  // Cache metrics
  public readonly cacheHits: Counter<string>;
  public readonly cacheMisses: Counter<string>;

  constructor() {
    this.registry = new Registry();

    // HTTP metrics
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });

    this.httpRequestsInFlight = new Gauge({
      name: 'http_requests_in_flight',
      help: 'Number of HTTP requests currently being processed',
      labelNames: ['method'],
      registers: [this.registry],
    });

    // Business metrics
    this.auctionSearches = new Counter({
      name: 'auction_searches_total',
      help: 'Total number of auction searches',
      labelNames: ['source', 'has_filters'],
      registers: [this.registry],
    });

    this.buyerCreations = new Counter({
      name: 'buyer_creations_total',
      help: 'Total number of buyers created',
      labelNames: ['type'],
      registers: [this.registry],
    });

    this.dealsCreated = new Counter({
      name: 'deals_created_total',
      help: 'Total number of deals created',
      labelNames: ['status'],
      registers: [this.registry],
    });

    this.smsMessagesSent = new Counter({
      name: 'sms_messages_sent_total',
      help: 'Total number of SMS messages sent',
      labelNames: ['status'],
      registers: [this.registry],
    });

    this.emailsSent = new Counter({
      name: 'emails_sent_total',
      help: 'Total number of emails sent',
      labelNames: ['type', 'status'],
      registers: [this.registry],
    });

    this.callsInitiated = new Counter({
      name: 'calls_initiated_total',
      help: 'Total number of calls initiated',
      labelNames: ['status'],
      registers: [this.registry],
    });

    // Database metrics
    this.dbQueryDuration = new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
      registers: [this.registry],
    });

    this.dbConnectionsActive = new Gauge({
      name: 'db_connections_active',
      help: 'Number of active database connections',
      registers: [this.registry],
    });

    // OpenSearch metrics
    this.opensearchQueryDuration = new Histogram({
      name: 'opensearch_query_duration_seconds',
      help: 'Duration of OpenSearch queries in seconds',
      labelNames: ['index', 'operation'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
      registers: [this.registry],
    });

    this.opensearchDocumentsIndexed = new Counter({
      name: 'opensearch_documents_indexed_total',
      help: 'Total number of documents indexed in OpenSearch',
      labelNames: ['index'],
      registers: [this.registry],
    });

    // WebSocket metrics
    this.websocketConnections = new Gauge({
      name: 'websocket_connections_active',
      help: 'Number of active WebSocket connections',
      registers: [this.registry],
    });

    this.websocketMessagesTotal = new Counter({
      name: 'websocket_messages_total',
      help: 'Total number of WebSocket messages',
      labelNames: ['type', 'direction'],
      registers: [this.registry],
    });

    // Cache metrics
    this.cacheHits = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache_name'],
      registers: [this.registry],
    });

    this.cacheMisses = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache_name'],
      registers: [this.registry],
    });
  }

  onModuleInit() {
    // Collect default Node.js metrics (memory, CPU, event loop, etc.)
    collectDefaultMetrics({
      register: this.registry,
      prefix: 'nodejs_',
    });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}

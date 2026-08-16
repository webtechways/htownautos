"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const common_1 = require("@nestjs/common");
const prom_client_1 = require("prom-client");
let MetricsService = class MetricsService {
    registry;
    httpRequestsTotal;
    httpRequestDuration;
    httpRequestsInFlight;
    auctionSearches;
    buyerCreations;
    dealsCreated;
    smsMessagesSent;
    emailsSent;
    callsInitiated;
    dbQueryDuration;
    dbConnectionsActive;
    opensearchQueryDuration;
    opensearchDocumentsIndexed;
    websocketConnections;
    websocketMessagesTotal;
    cacheHits;
    cacheMisses;
    constructor() {
        this.registry = new prom_client_1.Registry();
        this.httpRequestsTotal = new prom_client_1.Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code'],
            registers: [this.registry],
        });
        this.httpRequestDuration = new prom_client_1.Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
            registers: [this.registry],
        });
        this.httpRequestsInFlight = new prom_client_1.Gauge({
            name: 'http_requests_in_flight',
            help: 'Number of HTTP requests currently being processed',
            labelNames: ['method'],
            registers: [this.registry],
        });
        this.auctionSearches = new prom_client_1.Counter({
            name: 'auction_searches_total',
            help: 'Total number of auction searches',
            labelNames: ['source', 'has_filters'],
            registers: [this.registry],
        });
        this.buyerCreations = new prom_client_1.Counter({
            name: 'buyer_creations_total',
            help: 'Total number of buyers created',
            labelNames: ['type'],
            registers: [this.registry],
        });
        this.dealsCreated = new prom_client_1.Counter({
            name: 'deals_created_total',
            help: 'Total number of deals created',
            labelNames: ['status'],
            registers: [this.registry],
        });
        this.smsMessagesSent = new prom_client_1.Counter({
            name: 'sms_messages_sent_total',
            help: 'Total number of SMS messages sent',
            labelNames: ['status'],
            registers: [this.registry],
        });
        this.emailsSent = new prom_client_1.Counter({
            name: 'emails_sent_total',
            help: 'Total number of emails sent',
            labelNames: ['type', 'status'],
            registers: [this.registry],
        });
        this.callsInitiated = new prom_client_1.Counter({
            name: 'calls_initiated_total',
            help: 'Total number of calls initiated',
            labelNames: ['status'],
            registers: [this.registry],
        });
        this.dbQueryDuration = new prom_client_1.Histogram({
            name: 'db_query_duration_seconds',
            help: 'Duration of database queries in seconds',
            labelNames: ['operation', 'table'],
            buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
            registers: [this.registry],
        });
        this.dbConnectionsActive = new prom_client_1.Gauge({
            name: 'db_connections_active',
            help: 'Number of active database connections',
            registers: [this.registry],
        });
        this.opensearchQueryDuration = new prom_client_1.Histogram({
            name: 'opensearch_query_duration_seconds',
            help: 'Duration of OpenSearch queries in seconds',
            labelNames: ['index', 'operation'],
            buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
            registers: [this.registry],
        });
        this.opensearchDocumentsIndexed = new prom_client_1.Counter({
            name: 'opensearch_documents_indexed_total',
            help: 'Total number of documents indexed in OpenSearch',
            labelNames: ['index'],
            registers: [this.registry],
        });
        this.websocketConnections = new prom_client_1.Gauge({
            name: 'websocket_connections_active',
            help: 'Number of active WebSocket connections',
            registers: [this.registry],
        });
        this.websocketMessagesTotal = new prom_client_1.Counter({
            name: 'websocket_messages_total',
            help: 'Total number of WebSocket messages',
            labelNames: ['type', 'direction'],
            registers: [this.registry],
        });
        this.cacheHits = new prom_client_1.Counter({
            name: 'cache_hits_total',
            help: 'Total number of cache hits',
            labelNames: ['cache_name'],
            registers: [this.registry],
        });
        this.cacheMisses = new prom_client_1.Counter({
            name: 'cache_misses_total',
            help: 'Total number of cache misses',
            labelNames: ['cache_name'],
            registers: [this.registry],
        });
    }
    onModuleInit() {
        (0, prom_client_1.collectDefaultMetrics)({
            register: this.registry,
            prefix: 'nodejs_',
        });
    }
    async getMetrics() {
        return this.registry.metrics();
    }
    getContentType() {
        return this.registry.contentType;
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const nestjs_pino_1 = require("nestjs-pino");
const metrics_service_1 = require("./metrics.service");
const metrics_controller_1 = require("./metrics.controller");
const http_metrics_interceptor_1 = require("./http-metrics.interceptor");
const prettyTransport = {
    target: 'pino-pretty',
    options: {
        colorize: true,
        singleLine: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
    },
};
const getTransport = () => {
    if (process.env.NODE_ENV !== 'production') {
        return prettyTransport;
    }
    return undefined;
};
let ObservabilityModule = class ObservabilityModule {
};
exports.ObservabilityModule = ObservabilityModule;
exports.ObservabilityModule = ObservabilityModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            nestjs_pino_1.LoggerModule.forRoot({
                pinoHttp: {
                    customLevels: {
                        log: 30,
                    },
                    useOnlyCustomLevels: false,
                    transport: getTransport(),
                    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
                    formatters: {
                        level: (label) => ({ level: label }),
                        bindings: (bindings) => ({
                            pid: bindings.pid,
                            host: bindings.hostname,
                            service: 'htownautos-api',
                            env: process.env.NODE_ENV || 'development',
                        }),
                    },
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
        controllers: [metrics_controller_1.MetricsController],
        providers: [
            metrics_service_1.MetricsService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: http_metrics_interceptor_1.HttpMetricsInterceptor,
            },
        ],
        exports: [metrics_service_1.MetricsService],
    })
], ObservabilityModule);
//# sourceMappingURL=observability.module.js.map
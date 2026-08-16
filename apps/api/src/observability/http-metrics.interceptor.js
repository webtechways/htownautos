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
exports.HttpMetricsInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const metrics_service_1 = require("./metrics.service");
let HttpMetricsInterceptor = class HttpMetricsInterceptor {
    metricsService;
    constructor(metricsService) {
        this.metricsService = metricsService;
    }
    intercept(context, next) {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const method = request.method;
        const route = this.getRoutePattern(request);
        this.metricsService.httpRequestsInFlight.inc({ method });
        const startTime = process.hrtime.bigint();
        return next.handle().pipe((0, operators_1.tap)({
            next: () => {
                this.recordMetrics(method, route, response.statusCode, startTime);
            },
            error: (error) => {
                const statusCode = error.status || error.statusCode || 500;
                this.recordMetrics(method, route, statusCode, startTime);
            },
        }));
    }
    recordMetrics(method, route, statusCode, startTime) {
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
    getRoutePattern(request) {
        const route = request.route?.path || request.path;
        return route
            .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:uuid')
            .replace(/\/\d+/g, '/:id')
            .replace(/\?.*$/, '');
    }
};
exports.HttpMetricsInterceptor = HttpMetricsInterceptor;
exports.HttpMetricsInterceptor = HttpMetricsInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], HttpMetricsInterceptor);
//# sourceMappingURL=http-metrics.interceptor.js.map
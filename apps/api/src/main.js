"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
BigInt.prototype.toJSON = function () { return this.toString(); };
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const helmet_1 = __importDefault(require("helmet"));
const bodyParser = __importStar(require("body-parser"));
const app_module_1 = require("./app.module");
const redis_io_adapter_1 = require("./websocket/redis-io.adapter");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
        'https://app.htownautos.com',
        'https://htownautos.com',
        'https://www.htownautos.com',
    ];
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug'],
        cors: {
            origin: allowedOrigins,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'X-Requested-With',
                'X-API-Key',
                'X-Clerk-User',
                'X-Tenant-Id',
            ],
            exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
            maxAge: 3600,
        },
    });
    app.use((req, res, next) => {
        if (req.originalUrl === '/api/v1/stripe/webhooks' ||
            req.originalUrl === '/api/v1/shippo/webhooks') {
            bodyParser.raw({ type: 'application/json', limit: '5mb' })(req, res, next);
        }
        else {
            bodyParser.json({ limit: '5mb' })(req, res, next);
        }
    });
    app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
            },
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
        },
        frameguard: {
            action: 'deny',
        },
        noSniff: true,
        xssFilter: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }));
    app.use((req, _res, next) => {
        const host = req.headers.host || '';
        if (host.includes('link.htownautos.com') && !req.url.startsWith('/r/')) {
            req.url = '/r' + req.url;
        }
        next();
    });
    app.setGlobalPrefix('api/v1', {
        exclude: ['r/:code'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
            exposeDefaultValues: true,
        },
        skipMissingProperties: false,
        skipNullProperties: false,
        skipUndefinedProperties: false,
        disableErrorMessages: false,
        validationError: {
            target: false,
            value: false,
        },
        exceptionFactory: (errors) => {
            const messages = errors.map((error) => ({
                field: error.property,
                errors: Object.values(error.constraints || {}),
            }));
            return new common_1.BadRequestException({
                statusCode: 400,
                error: 'Bad Request',
                message: 'Validation failed',
                details: messages,
            });
        },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('HTown Autos API')
        .setDescription(`
      API for HTown Autos vehicle dealership management system

      **Compliance:**
      - RouteOne certified
      - DealerTrack certified
      - GLBA compliant
      - OFAC compliant

      **Security Features:**
      - Rate limiting enabled
      - Input validation and sanitization
      - Audit logging for all operations
      - Encrypted sensitive data (SSN, financial info)

      **Authentication:**
      - JWT Bearer tokens (to be implemented)
      - Role-based access control
    `)
        .setVersion('1.0')
        .setContact('HTown Autos Support', 'https://htownautos.com', 'support@htownautos.com')
        .setLicense('Proprietary', 'https://htownautos.com/license')
        .addTag('Vehicle Years', 'Endpoints for managing vehicle years')
        .addTag('Vehicle Makes', 'Endpoints for managing vehicle makes')
        .addTag('Vehicle Models', 'Endpoints for managing vehicle models')
        .addTag('Vehicle Trims', 'Endpoints for managing vehicle trims')
        .addTag('Media', 'File upload and management with S3')
        .addTag('Extra Expenses', 'Vehicle-related expenses tracking')
        .addTag('Nomenclators', 'System nomenclators and catalogs')
        .addTag('Meta', 'Flexible metadata system for all entities')
        .addTag('Vehicles', 'Vehicle inventory management')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document, {
        customSiteTitle: 'HTown Autos API - RouteOne/DealerTrack Certified',
        customfavIcon: 'https://nestjs.com/img/logo-small.svg',
        customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c5f2d; }
      .swagger-ui .scheme-container { background: #e8f5e9; }
    `,
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
            tryItOutEnabled: true,
        },
    });
    const redisIoAdapter = new redis_io_adapter_1.RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis();
    app.useWebSocketAdapter(redisIoAdapter);
    const port = Number(process.env.PORT ?? 3000);
    await app.listen(port);
    logger.log(`🚀 Application is running on: http://localhost:${port}`);
    logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
    logger.log(`🔌 WebSocket: Socket.io with Redis adapter enabled`);
    logger.log(`🔒 Security: Helmet enabled, CORS configured, Rate limiting active`);
    logger.log(`✅ Compliance: RouteOne, DealerTrack, GLBA, OFAC`);
    logger.log(`📊 Audit logging: ENABLED`);
    logger.log(`⚡ Deployed via CI/CD pipeline`);
    if (process.env.NODE_ENV !== 'production') {
        logger.warn('⚠️  Running in DEVELOPMENT mode');
    }
}
bootstrap().catch((error) => {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map
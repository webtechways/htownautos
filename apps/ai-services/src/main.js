"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
BigInt.prototype.toJSON = function () { return this.toString(); };
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('AiServices');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug'],
    });
    app.enableCors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://app.htownautos.com'],
        credentials: true,
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
            exposeDefaultValues: true,
        },
    }));
    const port = Number(process.env.AI_SERVICES_PORT ?? 3002);
    await app.listen(port);
    logger.log(`AI Services running on: http://localhost:${port}`);
}
bootstrap().catch((error) => {
    console.error('Failed to start AI Services:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map
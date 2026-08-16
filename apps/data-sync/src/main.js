"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
BigInt.prototype.toJSON = function () { return this.toString(); };
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('DataSync');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug'],
    });
    logger.log('Data Sync worker started - cron jobs active');
}
bootstrap().catch((error) => {
    console.error('Failed to start Data Sync:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map
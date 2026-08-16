"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisIoAdapter = void 0;
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const redis_adapter_1 = require("@socket.io/redis-adapter");
const ioredis_1 = require("ioredis");
const common_1 = require("@nestjs/common");
class RedisIoAdapter extends platform_socket_io_1.IoAdapter {
    adapterConstructor;
    logger = new common_1.Logger(RedisIoAdapter.name);
    constructor(app) {
        super(app);
    }
    async connectToRedis() {
        const redisConfig = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            password: process.env.REDIS_PASSWORD || undefined,
        };
        const pubClient = new ioredis_1.Redis(redisConfig);
        const subClient = new ioredis_1.Redis(redisConfig);
        pubClient.on('connect', () => {
            this.logger.log('Redis pub client connected for WebSocket');
        });
        subClient.on('connect', () => {
            this.logger.log('Redis sub client connected for WebSocket');
        });
        pubClient.on('error', (err) => {
            this.logger.error(`Redis pub client error: ${err.message}`);
        });
        subClient.on('error', (err) => {
            this.logger.error(`Redis sub client error: ${err.message}`);
        });
        this.adapterConstructor = (0, redis_adapter_1.createAdapter)(pubClient, subClient);
    }
    createIOServer(port, options) {
        const server = super.createIOServer(port, {
            ...options,
            cors: {
                origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],
                credentials: true,
            },
        });
        server.adapter(this.adapterConstructor);
        return server;
    }
}
exports.RedisIoAdapter = RedisIoAdapter;
//# sourceMappingURL=redis-io.adapter.js.map
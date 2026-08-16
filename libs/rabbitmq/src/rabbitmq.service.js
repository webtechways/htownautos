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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var RabbitMQService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQService = void 0;
const common_1 = require("@nestjs/common");
const amqplib = __importStar(require("amqplib"));
let RabbitMQService = class RabbitMQService {
    static { RabbitMQService_1 = this; }
    logger = new common_1.Logger(RabbitMQService_1.name);
    connection = null;
    channel = null;
    connecting = null;
    reconnectTimer = null;
    closing = false;
    consumers = new Map();
    static RECONNECT_DELAY_MS = 5000;
    async onModuleInit() {
        await this.connect();
    }
    async onModuleDestroy() {
        this.closing = true;
        if (this.reconnectTimer)
            clearTimeout(this.reconnectTimer);
        try {
            await this.channel?.close();
            await this.connection?.close();
        }
        catch { }
    }
    async connect() {
        if (this.channel)
            return;
        if (this.connecting)
            return this.connecting;
        const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
        this.connecting = (async () => {
            try {
                const connection = await amqplib.connect(url);
                const channel = await connection.createChannel();
                connection.on('error', (err) => this.logger.warn(`RabbitMQ connection error: ${err.message}`));
                connection.on('close', () => {
                    this.connection = null;
                    this.channel = null;
                    if (!this.closing) {
                        this.logger.warn('RabbitMQ connection closed; scheduling reconnect');
                        this.scheduleReconnect();
                    }
                });
                this.connection = connection;
                this.channel = channel;
                this.logger.log('RabbitMQ connected');
                for (const [queue, handler] of this.consumers) {
                    await this.registerConsumer(queue, handler);
                }
            }
            catch (err) {
                this.logger.warn(`RabbitMQ not available: ${err.message}`);
                this.connection = null;
                this.channel = null;
                if (!this.closing)
                    this.scheduleReconnect();
            }
            finally {
                this.connecting = null;
            }
        })();
        return this.connecting;
    }
    scheduleReconnect() {
        if (this.reconnectTimer || this.closing)
            return;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            void this.connect();
        }, RabbitMQService_1.RECONNECT_DELAY_MS);
    }
    async publish(queue, message) {
        if (!this.channel)
            await this.connect();
        if (!this.channel) {
            this.logger.warn(`RabbitMQ not connected, dropping message for queue: ${queue}`);
            return false;
        }
        try {
            await this.channel.assertQueue(queue, { durable: true });
            this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
                persistent: true,
            });
            return true;
        }
        catch (err) {
            this.logger.error(`Failed to publish to ${queue}: ${err.message}`);
            return false;
        }
    }
    async consume(queue, handler) {
        this.consumers.set(queue, handler);
        if (!this.channel)
            await this.connect();
        if (!this.channel) {
            this.logger.warn(`RabbitMQ not connected, will consume ${queue} after reconnect`);
            return;
        }
        await this.registerConsumer(queue, handler);
    }
    async registerConsumer(queue, handler) {
        try {
            await this.channel.assertQueue(queue, { durable: true });
            this.channel.prefetch(1);
            this.channel.consume(queue, async (msg) => {
                if (!msg)
                    return;
                try {
                    const content = JSON.parse(msg.content.toString());
                    await handler(content);
                    this.channel.ack(msg);
                }
                catch (err) {
                    this.logger.error(`[RabbitMQ] Error processing message from ${queue}: ${err.message}`);
                    this.channel.nack(msg, false, false);
                }
            });
            this.logger.log(`[RabbitMQ] Consuming queue: ${queue}`);
        }
        catch (err) {
            this.logger.error(`[RabbitMQ] Failed to start consuming ${queue}: ${err.message}`);
        }
    }
};
exports.RabbitMQService = RabbitMQService;
exports.RabbitMQService = RabbitMQService = RabbitMQService_1 = __decorate([
    (0, common_1.Injectable)()
], RabbitMQService);
//# sourceMappingURL=rabbitmq.service.js.map
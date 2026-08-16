import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class RabbitMQService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private connection;
    private channel;
    private connecting;
    private reconnectTimer;
    private closing;
    private readonly consumers;
    private static readonly RECONNECT_DELAY_MS;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private connect;
    private scheduleReconnect;
    publish(queue: string, message: Record<string, any>): Promise<boolean>;
    consume(queue: string, handler: (msg: Record<string, any>) => Promise<void>): Promise<void>;
    private registerConsumer;
}

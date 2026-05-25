import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqplib from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: any = null;
  private channel: any = null;
  private connecting: Promise<void> | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private closing = false;
  // Remember active consumers so they can be re-attached after a reconnect.
  private readonly consumers = new Map<
    string,
    (msg: Record<string, any>) => Promise<void>
  >();

  private static readonly RECONNECT_DELAY_MS = 5000;

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    this.closing = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch { /* ignore */ }
  }

  /**
   * Open (or re-open) the connection + channel. Single-flight and idempotent:
   * concurrent callers share the same in-flight attempt, and a live channel is
   * a no-op. On unexpected close it auto-reconnects and re-registers consumers,
   * so an infrastructure restart no longer strands the process.
   */
  private async connect(): Promise<void> {
    if (this.channel) return;
    if (this.connecting) return this.connecting;

    const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
    this.connecting = (async () => {
      try {
        const connection = await amqplib.connect(url);
        const channel = await connection.createChannel();

        connection.on('error', (err: Error) =>
          this.logger.warn(`RabbitMQ connection error: ${err.message}`),
        );
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

        // Re-attach consumers that were registered before a reconnect.
        for (const [queue, handler] of this.consumers) {
          await this.registerConsumer(queue, handler);
        }
      } catch (err) {
        this.logger.warn(`RabbitMQ not available: ${err.message}`);
        this.connection = null;
        this.channel = null;
        if (!this.closing) this.scheduleReconnect();
      } finally {
        this.connecting = null;
      }
    })();

    return this.connecting;
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer || this.closing) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect();
    }, RabbitMQService.RECONNECT_DELAY_MS);
  }

  async publish(queue: string, message: Record<string, any>): Promise<boolean> {
    if (!this.channel) await this.connect();
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
    } catch (err) {
      this.logger.error(`Failed to publish to ${queue}: ${err.message}`);
      return false;
    }
  }

  async consume(queue: string, handler: (msg: Record<string, any>) => Promise<void>): Promise<void> {
    // Remember the handler so it survives reconnects.
    this.consumers.set(queue, handler);

    if (!this.channel) await this.connect();
    if (!this.channel) {
      this.logger.warn(`RabbitMQ not connected, will consume ${queue} after reconnect`);
      return;
    }

    await this.registerConsumer(queue, handler);
  }

  private async registerConsumer(
    queue: string,
    handler: (msg: Record<string, any>) => Promise<void>,
  ): Promise<void> {
    try {
      await this.channel.assertQueue(queue, { durable: true });
      this.channel.prefetch(1);
      this.channel.consume(queue, async (msg: any) => {
        if (!msg) return;
        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content);
          this.channel.ack(msg);
        } catch (err) {
          this.logger.error(`[RabbitMQ] Error processing message from ${queue}: ${err.message}`);
          this.channel.nack(msg, false, false);
        }
      });
      this.logger.log(`[RabbitMQ] Consuming queue: ${queue}`);
    } catch (err) {
      this.logger.error(`[RabbitMQ] Failed to start consuming ${queue}: ${err.message}`);
    }
  }
}

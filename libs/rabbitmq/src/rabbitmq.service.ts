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
    {
      handler: (msg: Record<string, any>) => Promise<void>;
      prefetch: number;
    }
  >();
  /**
   * One channel per consumed queue. prefetch() is a channel-level setting, so a
   * shared channel would force every consumer to the same concurrency — raising
   * it for image caching would silently raise it for the sync trigger too.
   */
  private readonly consumerChannels = new Map<string, any>();

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
        this.consumerChannels.clear();
        for (const [queue, entry] of this.consumers) {
          await this.registerConsumer(queue, entry.handler, entry.prefetch);
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

  /**
   * `prefetch` is how many messages this consumer processes at once (amqplib
   * invokes the callback per delivery without waiting for the previous one, so
   * it is the real concurrency knob). Defaults to 1 — strictly serial.
   */
  async consume(
    queue: string,
    handler: (msg: Record<string, any>) => Promise<void>,
    options: { prefetch?: number } = {},
  ): Promise<void> {
    const prefetch = Math.max(1, Math.floor(options.prefetch ?? 1));
    // Remember the handler so it survives reconnects.
    this.consumers.set(queue, { handler, prefetch });

    if (!this.channel) await this.connect();
    if (!this.channel) {
      this.logger.warn(`RabbitMQ not connected, will consume ${queue} after reconnect`);
      return;
    }

    await this.registerConsumer(queue, handler, prefetch);
  }

  /**
   * Change a live consumer's concurrency without a restart, so the setting can
   * be tuned from the UI. No-op when the value is unchanged.
   */
  async setPrefetch(queue: string, prefetch: number): Promise<boolean> {
    const value = Math.max(1, Math.floor(prefetch));
    const entry = this.consumers.get(queue);
    const channel = this.consumerChannels.get(queue);
    if (!entry || !channel) return false;
    if (entry.prefetch === value) return false;

    try {
      await channel.prefetch(value);
      entry.prefetch = value;
      this.logger.log(`[RabbitMQ] ${queue} prefetch set to ${value}`);
      return true;
    } catch (err) {
      this.logger.warn(`[RabbitMQ] Could not set prefetch on ${queue}: ${err.message}`);
      return false;
    }
  }

  /** Messages waiting in the queue — used by the crawler for flow control. */
  async queueDepth(queue: string): Promise<number | null> {
    if (!this.channel) await this.connect();
    if (!this.channel) return null;
    try {
      const info = await this.channel.assertQueue(queue, { durable: true });
      return info?.messageCount ?? null;
    } catch (err) {
      this.logger.warn(`[RabbitMQ] Could not read depth of ${queue}: ${err.message}`);
      return null;
    }
  }

  private async registerConsumer(
    queue: string,
    handler: (msg: Record<string, any>) => Promise<void>,
    prefetch: number,
  ): Promise<void> {
    try {
      const channel = await this.connection.createChannel();
      channel.on('error', (err: Error) =>
        this.logger.warn(`[RabbitMQ] Channel error on ${queue}: ${err.message}`),
      );
      this.consumerChannels.set(queue, channel);

      await channel.assertQueue(queue, { durable: true });
      await channel.prefetch(prefetch);
      channel.consume(queue, async (msg: any) => {
        if (!msg) return;
        try {
          const content = JSON.parse(msg.content.toString());
          await handler(content);
          channel.ack(msg);
        } catch (err) {
          this.logger.error(`[RabbitMQ] Error processing message from ${queue}: ${err.message}`);
          channel.nack(msg, false, false);
        }
      });
      this.logger.log(`[RabbitMQ] Consuming queue: ${queue} (prefetch=${prefetch})`);
    } catch (err) {
      this.logger.error(`[RabbitMQ] Failed to start consuming ${queue}: ${err.message}`);
    }
  }
}

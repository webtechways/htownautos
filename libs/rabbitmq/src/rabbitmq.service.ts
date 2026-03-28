import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqplib from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: any = null;
  private channel: any = null;

  async onModuleInit() {
    const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
    try {
      this.connection = await amqplib.connect(url);
      this.channel = await this.connection.createChannel();
      this.logger.log('RabbitMQ connected');
    } catch (err) {
      this.logger.warn(`RabbitMQ not available: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch { /* ignore */ }
  }

  async publish(queue: string, message: Record<string, any>): Promise<boolean> {
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
    if (!this.channel) {
      this.logger.warn(`RabbitMQ not connected, cannot consume queue: ${queue}`);
      return;
    }

    try {
      await this.channel.assertQueue(queue, { durable: true });
      this.channel.prefetch(1);
      this.channel.consume(queue, async (msg) => {
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

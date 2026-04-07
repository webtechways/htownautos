import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { ClerkWebhooksController } from './clerk-webhooks.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ClerkWebhooksController],
})
export class ClerkWebhooksModule {}

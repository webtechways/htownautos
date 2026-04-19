import { Global, Module } from '@nestjs/common';
import { PostmarkService } from './postmark.service';
import { PostmarkWebhookController } from './postmark-webhook.controller';
import { PostmarkInboundProcessor } from './postmark-inbound.processor';
import { PostmarkEventProcessor } from './postmark-event.processor';
import { PrismaService } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';

@Global()
@Module({
  controllers: [PostmarkWebhookController],
  providers: [
    PostmarkService,
    PostmarkInboundProcessor,
    PostmarkEventProcessor,
    PrismaService,
    S3Service,
  ],
  exports: [PostmarkService],
})
export class PostmarkModule {}

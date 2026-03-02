import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { SmsModule } from '../sms/sms.module';
import { ShortUrlModule } from '../short-url/short-url.module';
import { StripeController } from './stripe.controller';
import { StripeWebhookController } from './stripe-webhook.controller';
import { StripeService } from './stripe.service';

@Module({
  imports: [PrismaModule, SmsModule, ShortUrlModule],
  controllers: [StripeController, StripeWebhookController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}


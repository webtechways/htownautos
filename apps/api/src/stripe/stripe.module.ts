import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { SmsModule } from '../sms/sms.module';
import { ShortUrlModule } from '../short-url/short-url.module';
import { StripeController } from './stripe.controller';
import { StripeWebhookController } from './stripe-webhook.controller';
import { StripeService } from './stripe.service';
import { PortalModule } from '../portal/portal.module';

@Module({
  imports: [
    PrismaModule,
    SmsModule,
    ShortUrlModule,
    forwardRef(() => PortalModule),
  ],
  controllers: [StripeController, StripeWebhookController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}

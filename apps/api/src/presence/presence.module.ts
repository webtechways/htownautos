import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PresenceService } from './presence.service';
import { PresenceController } from './presence.controller';
import { PresenceInterceptor } from './presence.interceptor';
import { PresenceGateway } from './presence.gateway';
import { PhoneCallEventsService } from './phone-call-events.service';
import { SmsEventsService } from './sms-events.service';
import { StripeEventsService } from './stripe-events.service';
import { EmailEventsService } from './email-events.service';
import { PrismaModule } from '@htownautos/prisma';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [PresenceController],
  providers: [
    PresenceService,
    PhoneCallEventsService,
    SmsEventsService,
    StripeEventsService,
    EmailEventsService,
    PresenceGateway,
    // Register interceptor globally to track all API activity
    {
      provide: APP_INTERCEPTOR,
      useClass: PresenceInterceptor,
    },
  ],
  exports: [
    PresenceService,
    PresenceGateway,
    PhoneCallEventsService,
    SmsEventsService,
    StripeEventsService,
    EmailEventsService,
  ],
})
export class PresenceModule {}

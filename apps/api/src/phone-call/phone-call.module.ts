import { Module, forwardRef } from '@nestjs/common';
import { PhoneCallService } from './phone-call.service';
import { TranscriptionService } from './transcription.service';
import { PrismaModule } from '@htownautos/prisma';
import { MediaModule } from '@htownautos/media';
import { TwilioModule } from '../twilio/twilio.module';

@Module({
  imports: [PrismaModule, MediaModule, forwardRef(() => TwilioModule)],
  providers: [PhoneCallService, TranscriptionService],
  exports: [PhoneCallService, TranscriptionService],
})
export class PhoneCallModule {}

import { Module, Global } from '@nestjs/common';
import { CallFlowService } from './call-flow.service';
import { TwimlGeneratorService } from './twiml-generator.service';
import { CallFlowController, PhoneNumberCallFlowController } from './call-flow.controller';
import { PrismaModule } from '@htownautos/prisma';
import { TtsModule } from '@htownautos/tts';

@Global()
@Module({
  imports: [PrismaModule, TtsModule],
  controllers: [CallFlowController, PhoneNumberCallFlowController],
  providers: [CallFlowService, TwimlGeneratorService],
  exports: [CallFlowService, TwimlGeneratorService],
})
export class CallFlowModule {}

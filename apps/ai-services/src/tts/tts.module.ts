import { Module } from '@nestjs/common';
import { TtsController } from './tts.controller';
import { TtsService } from './tts.service';
import { PrismaModule } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';

@Module({
  imports: [PrismaModule],
  controllers: [TtsController],
  providers: [TtsService, S3Service],
  exports: [TtsService],
})
export class TtsModule {}

import { Module } from '@nestjs/common';
import { UploadSessionService } from './upload-session.service';
import { UploadSessionController } from './upload-session.controller';
import { UploadSessionPublicController } from './upload-session-public.controller';
import { PrismaModule } from '@htownautos/prisma';
import { MediaModule } from '@htownautos/media';

@Module({
  imports: [PrismaModule, MediaModule],
  controllers: [UploadSessionController, UploadSessionPublicController],
  providers: [UploadSessionService],
})
export class UploadSessionModule {}

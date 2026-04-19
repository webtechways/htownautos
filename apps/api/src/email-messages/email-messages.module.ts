import { Module } from '@nestjs/common';
import { EmailMessagesService } from './email-messages.service';
import { EmailMessagesController } from './email-messages.controller';
import { EmailSendController } from './email-send.controller';
import { PrismaService } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';

@Module({
  controllers: [EmailMessagesController, EmailSendController],
  providers: [EmailMessagesService, PrismaService, S3Service],
  exports: [EmailMessagesService],
})
export class EmailMessagesModule {}

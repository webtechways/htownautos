import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { ContactMessagesController } from './contact-messages.controller';
import { ContactMessagesService } from './contact-messages.service';

/**
 * ContactMessagesModule — staff read/list contact messages submitted via
 * the public portal contact form.
 *
 * Only imports PrismaModule. No circular dependencies.
 */
@Module({
  imports: [PrismaModule],
  controllers: [ContactMessagesController],
  providers: [ContactMessagesService],
})
export class ContactMessagesModule {}

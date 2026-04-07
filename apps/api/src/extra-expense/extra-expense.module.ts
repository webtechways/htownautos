import { Module } from '@nestjs/common';
import { ExtraExpenseService } from './extra-expense.service';
import { ExtraExpenseController } from './extra-expense.controller';
import { PrismaModule } from '@htownautos/prisma';
import { MediaModule } from '@htownautos/media';

@Module({
  imports: [PrismaModule, MediaModule],
  controllers: [ExtraExpenseController],
  providers: [ExtraExpenseService],
  exports: [ExtraExpenseService],
})
export class ExtraExpenseModule {}

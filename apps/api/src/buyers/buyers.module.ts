import { Module } from '@nestjs/common';
import { BuyersService } from './buyers.service';
import { BuyersController } from './buyers.controller';
import { PrismaModule } from '@htownautos/prisma';
import { AuthModule } from '@htownautos/auth';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BuyersController],
  providers: [BuyersService],
  exports: [BuyersService],
})
export class BuyersModule {}

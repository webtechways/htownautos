import { Module } from '@nestjs/common';
import { BuyersService } from './buyers.service';
import { BuyersController } from './buyers.controller';
import { PrismaModule } from '@htownautos/prisma';
import { AuthModule } from '@htownautos/auth';
import { S3Service } from '@htownautos/common';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BuyersController],
  providers: [BuyersService, S3Service],
  exports: [BuyersService],
})
export class BuyersModule {}

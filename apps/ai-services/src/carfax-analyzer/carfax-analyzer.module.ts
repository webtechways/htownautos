import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { S3Service } from '@htownautos/common';
import { CarfaxAnalyzerService } from './carfax-analyzer.service';
import { CarfaxAnalyzerController } from './carfax-analyzer.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CarfaxAnalyzerController],
  providers: [CarfaxAnalyzerService, S3Service],
  exports: [CarfaxAnalyzerService],
})
export class CarfaxAnalyzerModule {}

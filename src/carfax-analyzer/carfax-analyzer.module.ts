import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { MediaModule } from '../media/media.module';
import { CarfaxAnalyzerService } from './carfax-analyzer.service';
import { CarfaxAnalyzerController } from './carfax-analyzer.controller';

@Module({
  imports: [PrismaModule, MediaModule],
  controllers: [CarfaxAnalyzerController],
  providers: [CarfaxAnalyzerService],
  exports: [CarfaxAnalyzerService],
})
export class CarfaxAnalyzerModule {}

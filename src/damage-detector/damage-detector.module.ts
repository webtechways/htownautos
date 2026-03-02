import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module';
import { DamageDetectorService } from './damage-detector.service';
import { DamageDetectorController } from './damage-detector.controller';

@Module({
  imports: [PrismaModule],
  controllers: [DamageDetectorController],
  providers: [DamageDetectorService],
  exports: [DamageDetectorService],
})
export class DamageDetectorModule {}

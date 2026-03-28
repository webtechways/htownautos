import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { RedisModule } from '@htownautos/redis';
import { RabbitMQModule } from '@htownautos/rabbitmq';
import { AuthModule } from '@htownautos/auth';
import { DamageDetectorModule } from './damage-detector/damage-detector.module';
import { CarfaxAnalyzerModule } from './carfax-analyzer/carfax-analyzer.module';
import { TtsModule } from './tts/tts.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    RabbitMQModule,
    AuthModule,
    DamageDetectorModule,
    CarfaxAnalyzerModule,
    TtsModule,
  ],
})
export class AppModule {}

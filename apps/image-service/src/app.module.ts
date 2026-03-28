import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { RedisModule } from '@htownautos/redis';
import { RabbitMQModule } from '@htownautos/rabbitmq';
import { AuthModule } from '@htownautos/auth';
import { AuditModule } from '@htownautos/common';
import { MediaModule } from './media/media.module';
import { GalleryCacheModule } from './gallery-cache/gallery-cache.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    RabbitMQModule,
    AuthModule,
    AuditModule,
    MediaModule,
    GalleryCacheModule,
  ],
})
export class AppModule {}

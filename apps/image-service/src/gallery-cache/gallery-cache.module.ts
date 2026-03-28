import { Module } from '@nestjs/common';
import { PrismaModule } from '@htownautos/prisma';
import { RabbitMQModule } from '@htownautos/rabbitmq';
import { S3Service, ProxyService } from '@htownautos/common';
import { GalleryCacheService } from './gallery-cache.service';

@Module({
  imports: [PrismaModule, RabbitMQModule],
  providers: [GalleryCacheService, S3Service, ProxyService],
})
export class GalleryCacheModule {}

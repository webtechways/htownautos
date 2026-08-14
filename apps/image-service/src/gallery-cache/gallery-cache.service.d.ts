import { OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '@htownautos/rabbitmq';
import { PrismaService } from '@htownautos/prisma';
import { S3Service, ProxyService } from '@htownautos/common';
export declare class GalleryCacheService implements OnModuleInit {
    private readonly rabbitMQ;
    private readonly prisma;
    private readonly s3;
    private readonly proxyService;
    private readonly logger;
    constructor(rabbitMQ: RabbitMQService, prisma: PrismaService, s3: S3Service, proxyService: ProxyService);
    onModuleInit(): Promise<void>;
    private handleMessage;
    private uploadImage;
}

import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@htownautos/prisma';
export declare class ApiKeyGuard implements CanActivate {
    private readonly reflector;
    private readonly prisma;
    private readonly logger;
    static readonly KEY_PREFIX = "hta_";
    constructor(reflector: Reflector, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractKey;
    private hash;
    private getClientIp;
}

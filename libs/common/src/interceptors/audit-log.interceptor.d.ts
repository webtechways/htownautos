import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { PrismaService } from '@htownautos/prisma';
export declare class AuditLogInterceptor implements NestInterceptor {
    private readonly reflector;
    private readonly prisma;
    private readonly logger;
    constructor(reflector: Reflector, prisma: PrismaService);
    intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>;
    private extractUserFromToken;
    private decodeJwtPayload;
    private computeChanges;
    private enrichMediaChanges;
    private enrichReceiptSummary;
    private enrichNomenclatorChanges;
    private extractSummary;
    private createAuditLog;
}

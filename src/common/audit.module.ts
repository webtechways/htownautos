import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';
import { PrismaModule } from '../prisma.module';

/**
 * Módulo global de auditoría
 * Proporciona logging de compliance para RouteOne y DealerTrack
 */
@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
  exports: [],
})
export class AuditModule {}

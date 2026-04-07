import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClerkJwtGuard } from './guards/clerk-jwt.guard';
import { TenantGuard } from './guards/tenant.guard';
import { AuthService } from './auth.service';
import { ClerkService } from './clerk.service';
import { PrismaModule } from '@htownautos/prisma';

@Module({
  imports: [PrismaModule],
  providers: [
    AuthService,
    ClerkService,
    // ClerkJwtGuard runs first - handles authentication
    {
      provide: APP_GUARD,
      useClass: ClerkJwtGuard,
    },
    // TenantGuard runs second - validates tenant access
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
  exports: [AuthService, ClerkService],
})
export class AuthModule { }

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from './guards/api-key.guard';
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
    // ApiKeyGuard runs first — if a valid X-API-Key is present it stamps
    // request.user / request.tenant / request.apiKey so downstream guards skip.
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    // ClerkJwtGuard runs second — handles browser/Clerk auth when no API key.
    {
      provide: APP_GUARD,
      useClass: ClerkJwtGuard,
    },
    // TenantGuard runs third — validates user membership in the tenant.
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
  exports: [AuthService, ClerkService],
})
export class AuthModule { }

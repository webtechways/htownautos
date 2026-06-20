import { Body, Controller, Delete, Post } from '@nestjs/common';
import { CurrentTenant } from '@htownautos/auth';
import { AdminSeedService } from './admin-seed.service';

/**
 * TEMPORARY demo-data seeding endpoints. Staff-authenticated (inherits the
 * global ApiKey/Clerk/Tenant guards) and scoped to the caller's tenant.
 * Creates/deletes ONLY clearly-marked demo Buyer rows. Remove this module once
 * the demo data is no longer needed.
 */
@Controller('admin-seed')
export class AdminSeedController {
  constructor(private readonly service: AdminSeedService) {}

  @Post('buyers')
  seedBuyers(
    @CurrentTenant() tenantId: string,
    @Body() body: { count?: number; daysBack?: number },
  ) {
    return this.service.seedBuyers(tenantId, body?.count ?? 65, body?.daysBack ?? 60);
  }

  @Delete('buyers')
  deleteBuyers(@CurrentTenant() tenantId: string) {
    return this.service.deleteSeedBuyers(tenantId);
  }
}

import { Global, Module, forwardRef } from '@nestjs/common';
import { TenantController, InvitationController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { TenantEmailDomainService } from './tenant-email-domain.service';
import { PrismaModule } from '@htownautos/prisma';
import { AuthModule } from '@htownautos/auth';

@Global()
@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [TenantController, InvitationController],
  providers: [TenantService, TenantEmailDomainService],
  exports: [TenantService, TenantEmailDomainService],
})
export class TenantModule {}

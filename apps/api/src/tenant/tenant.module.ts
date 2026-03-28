import { Module, forwardRef } from '@nestjs/common';
import { TenantController, InvitationController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { PrismaModule } from '@htownautos/prisma';
import { AuthModule } from '@htownautos/auth';

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  controllers: [TenantController, InvitationController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}

import { Global, Module, forwardRef } from '@nestjs/common';
import { TenantController, InvitationController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { TenantEmailDomainService } from './tenant-email-domain.service';
import { PrismaModule } from '@htownautos/prisma';
import { AuthModule } from '@htownautos/auth';
import { NotificationsModule } from '../notifications/notifications.module';

@Global()
@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule), NotificationsModule],
  controllers: [TenantController, InvitationController],
  providers: [TenantService, TenantEmailDomainService],
  exports: [TenantService, TenantEmailDomainService],
})
export class TenantModule {}

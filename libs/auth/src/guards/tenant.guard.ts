import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@htownautos/prisma';

// Decorator key for marking routes that don't require tenant
export const TENANT_OPTIONAL_KEY = 'tenantOptional';

// Custom error code for frontend to detect tenant issues
export const TENANT_ERROR_CODE = 'TENANT_REQUIRED';

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if tenant is optional for this route
    const isTenantOptional = this.reflector.getAllAndOverride<boolean>(
      TENANT_OPTIONAL_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isTenantOptional) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If no user (not authenticated), let ClerkJwtGuard handle it
    if (!user) {
      return true;
    }

    // Resolve tenant: prefer JWT org_id (Clerk Organizations), fall back to X-Tenant-Id header (legacy)
    const clerkOrgId = request.clerkOrgId; // Set by ClerkJwtGuard from JWT
    const legacyTenantId = request.headers['x-tenant-id'];

    let tenant: any = null;

    if (clerkOrgId) {
      // New path: resolve tenant by Clerk Organization ID from JWT
      tenant = await this.prisma.$queryRawUnsafe(
        `SELECT * FROM tenants WHERE clerk_org_id = $1 LIMIT 1`,
        clerkOrgId,
      ).then((rows: any[]) => rows[0] || null);
    } else if (legacyTenantId) {
      // Legacy path: resolve tenant by UUID from X-Tenant-Id header
      tenant = await this.prisma.tenant.findUnique({
        where: { id: legacyTenantId },
      });
    }

    if (!tenant) {
      throw new ForbiddenException({
        message: 'Tenant ID is required. Please select a business.',
        error: 'Forbidden',
        statusCode: 403,
        code: TENANT_ERROR_CODE,
      });
    }

    if (!tenant.isActive) {
      throw new ForbiddenException({
        message: 'This business is currently inactive.',
        error: 'Forbidden',
        statusCode: 403,
        code: TENANT_ERROR_CODE,
      });
    }

    // Verify user has access to this tenant
    const tenantUser = await this.prisma.tenantUser.findUnique({
      where: {
        tenantId_userId: { tenantId: tenant.id, userId: user.id },
      },
    });

    if (!tenantUser || !tenantUser.isActive || tenantUser.status !== 'active') {
      throw new ForbiddenException({
        message: 'You do not have access to this business.',
        error: 'Forbidden',
        statusCode: 403,
        code: TENANT_ERROR_CODE,
      });
    }

    // Attach tenant to request for use in controllers and other guards
    request.tenant = tenant;
    request.tenantUser = tenantUser;

    return true;
  }
}

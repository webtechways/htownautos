import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { verifyToken } from '@clerk/backend';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '@htownautos/prisma';

export interface ClerkTokenPayload {
  sub: string;
  org_id?: string;
  org_role?: string;
  org_slug?: string;
  email?: string;
  email_verified?: boolean;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  image_url?: string;
}

export interface AuthenticatedUser {
  id: string;
  clerkUserId: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  avatar: string | null;
  isActive: boolean;
  emailVerified: boolean;
  tenants: Array<{
    id: string;
    tenantId: string;
    roleId: string;
    isActive: boolean;
    tenant: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

@Injectable()
export class ClerkJwtGuard implements CanActivate {
  private readonly logger = new Logger(ClerkJwtGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      // Verify token with Clerk
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });

      const clerkUserId = payload.sub;

      // Get user metadata from X-Clerk-User header (set by frontend)
      const userMeta = this.extractUserMeta(request);

      // Get or create user
      const user = await this.getOrCreateUser(clerkUserId, userMeta, request);

      // Extract Clerk Organization claims from JWT
      // Clerk uses both formats: top-level org_id or compact 'o' object
      request.clerkOrgId = (payload as any).org_id || (payload as any).o?.id || null;
      request.clerkOrgRole = (payload as any).org_role || ((payload as any).o?.rol ? `org:${(payload as any).o.rol}` : null);

      // Attach user to request
      request.user = user;
      request.session = { user };
      return true;
    } catch (error) {
      this.logger.error('Token verification failed:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  private extractUserMeta(request: any): Partial<ClerkTokenPayload> | null {
    try {
      const meta = request.headers['x-clerk-user'];
      if (!meta) return null;
      return JSON.parse(Buffer.from(meta, 'base64').toString('utf8'));
    } catch {
      return null;
    }
  }

  private async getOrCreateUser(
    clerkUserId: string,
    userMeta: Partial<ClerkTokenPayload> | null,
    request: any,
  ): Promise<AuthenticatedUser> {
    const startTime = Date.now();
    const email = userMeta?.email || '';

    const tenantInclude = {
      tenants: {
        where: { isActive: true, status: 'active' },
        include: {
          tenant: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    };

    // Try to find existing user by clerkUserId
    let user = await this.prisma.user.findUnique({
      where: { clerkUserId },
      include: tenantInclude,
    });

    // If not found by clerkUserId, try by email (for invited users)
    if (!user && email) {
      const existingUserByEmail = await this.prisma.user.findUnique({
        where: { email },
        include: {
          tenants: {
            where: { isActive: true },
            include: {
              tenant: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      });

      if (existingUserByEmail) {
        const firstName = userMeta?.first_name || existingUserByEmail.firstName;
        const lastName = userMeta?.last_name || existingUserByEmail.lastName;
        const name = userMeta?.full_name || existingUserByEmail.name;
        const avatar = userMeta?.image_url || existingUserByEmail.avatar;
        const emailVerified = userMeta?.email_verified ?? existingUserByEmail.emailVerified;

        this.logger.log(`Linking existing user ${email} to Clerk ID ${clerkUserId}`);

        user = await this.prisma.user.update({
          where: { id: existingUserByEmail.id },
          data: {
            clerkUserId,
            name: name || existingUserByEmail.name,
            firstName,
            lastName,
            avatar,
            emailVerified,
            isActive: true,
          },
          include: tenantInclude,
        });

        const duration = Date.now() - startTime;
        await this.createAuthAuditLog({
          userId: user.id,
          userEmail: email,
          clerkUserId,
          action: 'user-linked',
          status: 'success',
          ipAddress: this.getClientIp(request),
          userAgent: request.headers['user-agent'] || 'unknown',
          duration,
          metadata: { previousClerkUserId: existingUserByEmail.clerkUserId },
        });
      }
    }

    // If user still doesn't exist, create them
    if (!user) {
      const firstName = userMeta?.first_name || null;
      const lastName = userMeta?.last_name || null;
      const name = userMeta?.full_name || null;
      const avatar = userMeta?.image_url || null;
      const emailVerified = userMeta?.email_verified ?? false;

      if (!email) {
        throw new UnauthorizedException('Email required for user creation. Make sure X-Clerk-User header is provided.');
      }

      this.logger.log(`Auto-provisioning new user: ${email} (Clerk: ${clerkUserId})`);

      user = await this.prisma.user.create({
        data: {
          clerkUserId,
          email,
          name,
          firstName,
          lastName,
          avatar,
          emailVerified,
          isActive: true,
        },
        include: tenantInclude,
      });

      const duration = Date.now() - startTime;
      await this.createAuthAuditLog({
        userId: user.id,
        userEmail: email,
        clerkUserId,
        action: 'user-created',
        status: 'success',
        ipAddress: this.getClientIp(request),
        userAgent: request.headers['user-agent'] || 'unknown',
        duration,
        metadata: { name, firstName, lastName, emailVerified },
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    return {
      id: user.id,
      clerkUserId: user.clerkUserId!,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      tenants: user.tenants.map((t) => ({
        id: t.id,
        tenantId: t.tenantId,
        roleId: t.roleId,
        isActive: t.isActive,
        tenant: t.tenant,
      })),
    };
  }

  private getClientIp(request: any): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0]?.trim() || 'unknown';
    }
    return request.headers['x-real-ip'] || request.ip || request.connection?.remoteAddress || 'unknown';
  }

  private async createAuthAuditLog(data: {
    userId: string;
    userEmail: string;
    clerkUserId: string;
    action: string;
    status: string;
    ipAddress?: string;
    userAgent?: string;
    duration?: number;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          userEmail: data.userEmail,
          action: data.action,
          resource: 'auth',
          method: 'POST',
          url: '/auth',
          ipAddress: data.ipAddress || 'unknown',
          userAgent: data.userAgent || 'unknown',
          duration: data.duration,
          status: data.status,
          level: 'critical',
          pii: true,
          compliance: ['glba'],
          metadata: {
            clerkUserId: data.clerkUserId,
            ...data.metadata,
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create auth audit log: ${error.message}`);
    }
  }
}

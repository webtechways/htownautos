import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import { PrismaService } from '@htownautos/prisma';

/**
 * Canonical tenant for htownautos.com public portal.
 * ALL portal customers belong to this tenant.
 */
export const PORTAL_TENANT_ID = '50197477-9e89-4465-bed5-99c638c435a0';

export interface PortalBuyer {
  id: string;
  tenantId: string;
  clerkUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneMain: string;
  phoneMobile: string | null;
  phoneSecondary: string | null;
  currentAddress: string;
  currentCity: string;
  currentState: string;
  currentZipCode: string;
  currentCountry: string;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * CustomerGuard — protects all portal endpoints.
 *
 * Distinct from ClerkJwtGuard + TenantGuard (staff path) by design:
 *
 *  1. Verifies the Clerk JWT independently (same `verifyToken` call).
 *  2. REJECTS tokens that carry an org_id claim — those are staff, not customers.
 *  3. Auto-provisions a Buyer row on first login (idempotent via clerkUserId).
 *  4. Attaches `request.buyer` (PortalBuyer) and `request.tenantId`.
 *
 * Usage: apply `@UseGuards(CustomerGuard)` (or `@CustomerAuth()`) on the
 * controller class or individual handlers.  Do NOT combine with the global
 * ClerkJwtGuard + TenantGuard chain — the portal routes use this guard ONLY.
 */
@Injectable()
export class CustomerGuard implements CanActivate {
  private readonly logger = new Logger(CustomerGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    let payload: any;
    try {
      payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
    } catch (err) {
      this.logger.warn(`CustomerGuard: token verification failed — ${(err as Error).message}`);
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Staff tokens carry an org_id.  Reject them on the customer portal.
    const orgId = payload.org_id || payload.o?.id;
    if (orgId) {
      throw new ForbiddenException(
        'Staff accounts cannot access the customer portal',
      );
    }

    const clerkUserId: string = payload.sub;
    const userMeta = this.extractUserMeta(request);

    const buyer = await this.getOrProvisionBuyer(clerkUserId, userMeta);

    request.buyer = buyer;
    request.tenantId = buyer.tenantId;
    return true;
  }

  // ── private helpers ──────────────────────────────────────────────────────

  private extractToken(request: any): string | null {
    const auth: string | undefined = request.headers.authorization;
    if (auth?.startsWith('Bearer ')) return auth.substring(7);
    return null;
  }

  /**
   * X-Clerk-User header is a base64-encoded JSON blob sent by the Clerk
   * frontend SDK carrying first/last name, email, and image URL.
   * Used during auto-provisioning to seed the Buyer row.
   */
  private extractUserMeta(
    request: any,
  ): { email?: string; first_name?: string; last_name?: string } | null {
    try {
      const raw: string | undefined = request.headers['x-clerk-user'];
      if (!raw) return null;
      return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
    } catch {
      return null;
    }
  }

  /**
   * Find the Buyer by clerkUserId.  When none exists, auto-provision one in
   * the canonical portal tenant using the token's metadata.  This is
   * idempotent: if two concurrent requests race, the second upsert is a no-op
   * (unique constraint on clerkUserId prevents duplicates).
   */
  private async getOrProvisionBuyer(
    clerkUserId: string,
    meta: { email?: string; first_name?: string; last_name?: string } | null,
  ): Promise<PortalBuyer> {
    const select = {
      id: true,
      tenantId: true,
      clerkUserId: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneMain: true,
      phoneMobile: true,
      phoneSecondary: true,
      currentAddress: true,
      currentCity: true,
      currentState: true,
      currentZipCode: true,
      currentCountry: true,
      stripeCustomerId: true,
      createdAt: true,
      updatedAt: true,
    } as const;

    // Fast path: buyer already exists.
    const existing = await this.prisma.buyer.findUnique({
      where: { clerkUserId },
      select,
    });
    if (existing) return existing as PortalBuyer;

    // Slow path: first login — provision a minimal Buyer record.
    const email = meta?.email ?? '';
    const firstName = meta?.first_name ?? '';
    const lastName = meta?.last_name ?? '';

    if (!email) {
      throw new UnauthorizedException(
        'Email is required to create a portal account. Ensure the X-Clerk-User header is present.',
      );
    }

    this.logger.log(
      `Auto-provisioning portal buyer: ${email} (Clerk: ${clerkUserId})`,
    );

    try {
      const created = await this.prisma.buyer.create({
        data: {
          clerkUserId,
          tenantId: PORTAL_TENANT_ID,
          firstName: firstName || 'Portal',
          lastName: lastName || 'User',
          email,
          // Required non-nullable fields — portal customers fill them later.
          phoneMain: '',
          dateOfBirth: new Date('1900-01-01'),
          currentAddress: '',
          currentCity: '',
          currentState: '',
          currentZipCode: '',
          currentCountry: 'USA',
        },
        select,
      });
      return created as PortalBuyer;
    } catch (err: any) {
      // P2002 = unique constraint violation — concurrent request won the race.
      if (err?.code === 'P2002') {
        const retry = await this.prisma.buyer.findUnique({
          where: { clerkUserId },
          select,
        });
        if (retry) return retry as PortalBuyer;
      }
      throw err;
    }
  }
}

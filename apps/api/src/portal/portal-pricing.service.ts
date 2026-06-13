import { Injectable } from '@nestjs/common';
import { PrismaService } from '@htownautos/prisma';

/** Default inspection fee in cents when unset in Tenant.settings ($35). */
const DEFAULT_INSPECTION_FEE_CENTS = 3500;

/** Default travel fee per distinct yard in cents when unset in Tenant.settings ($50). */
const DEFAULT_TRAVEL_FEE_CENTS = 5000;

export interface PortalPricing {
  inspectionFeeCents: number;
  travelFeeCents: number;
}

interface TenantPortalSettings {
  inspectionFeeCents?: unknown;
  travelFeeCents?: unknown;
}

@Injectable()
export class PortalPricingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns {inspectionFeeCents, travelFeeCents} for the given tenant,
   * reading Tenant.settings.portal and falling back to hardcoded defaults.
   *
   * Stored in: Tenant.settings (Json) under key "portal":
   *   { "portal": { "inspectionFeeCents": 3500, "travelFeeCents": 5000 } }
   */
  async getPricing(tenantId: string): Promise<PortalPricing> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });

    const raw = tenant?.settings as Record<string, unknown> | null | undefined;
    const portal = (raw?.['portal'] ?? {}) as TenantPortalSettings;

    const inspectionFeeCents =
      typeof portal.inspectionFeeCents === 'number' &&
      Number.isInteger(portal.inspectionFeeCents) &&
      portal.inspectionFeeCents > 0
        ? portal.inspectionFeeCents
        : DEFAULT_INSPECTION_FEE_CENTS;

    const travelFeeCents =
      typeof portal.travelFeeCents === 'number' &&
      Number.isInteger(portal.travelFeeCents) &&
      portal.travelFeeCents > 0
        ? portal.travelFeeCents
        : DEFAULT_TRAVEL_FEE_CENTS;

    return { inspectionFeeCents, travelFeeCents };
  }

  /**
   * Merges updated pricing values into Tenant.settings.portal.
   * Partial update — only fields explicitly provided are overwritten.
   */
  async setPricing(
    tenantId: string,
    updates: Partial<PortalPricing>,
  ): Promise<PortalPricing> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });

    const existing = (tenant?.settings ?? {}) as Record<string, unknown>;
    const existingPortal = (existing['portal'] ?? {}) as Record<string, unknown>;

    const merged = {
      ...existingPortal,
      ...(updates.inspectionFeeCents !== undefined && {
        inspectionFeeCents: updates.inspectionFeeCents,
      }),
      ...(updates.travelFeeCents !== undefined && {
        travelFeeCents: updates.travelFeeCents,
      }),
    };

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: {
          ...existing,
          portal: merged,
        },
      },
    });

    return this.getPricing(tenantId);
  }
}

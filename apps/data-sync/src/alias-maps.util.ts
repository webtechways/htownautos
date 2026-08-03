import { PrismaService } from '@htownautos/prisma';
import {
  CANONICAL_FIELDS,
  type AliasMap,
  type CanonicalField,
} from '@htownautos/common';

/**
 * Load the staff-curated alias maps (field → normalizedVariant → canonical) from
 * `auction_value_aliases`. Shared by the ingest canonicalization step and the
 * wanted-match notifier so both apply the same merges as the API.
 */
export async function loadAliasMaps(
  prisma: PrismaService,
): Promise<Record<CanonicalField, AliasMap>> {
  const rows = await prisma.auctionValueAlias.findMany({
    select: { field: true, aliasKey: true, canonical: true },
  });
  const out = {} as Record<CanonicalField, AliasMap>;
  for (const f of CANONICAL_FIELDS) out[f] = {};
  for (const r of rows) {
    if ((CANONICAL_FIELDS as readonly string[]).includes(r.field)) {
      out[r.field as CanonicalField][r.aliasKey] = r.canonical;
    }
  }
  return out;
}

/**
 * Derived auction attributes shared by both ingestion paths (OpenSearch index
 * time and the Postgres import upsert) so the values stay identical across the
 * CRM and the public portal.
 */

export type SellerCategory = 'Insurance' | 'Rental' | 'Repo' | 'Other';

export const SELLER_CATEGORIES: SellerCategory[] = [
  'Insurance',
  'Rental',
  'Repo',
  'Other',
];

// Seller-name signals. Copart doesn't ship an explicit source column, so we
// infer it from the `rentals` flag and patterns in `sellerName`.
const REPO_PATTERNS = [
  'repo',
  'recovery',
  'credit union',
  'financial',
  'finance',
  'bank',
  'lending',
  'loan',
  'acceptance',
  'capital',
  'santander',
  'ally',
  'credit',
];

const RENTAL_PATTERNS = [
  'rental',
  'rent a car',
  'rent-a-car',
  'enterprise',
  'hertz',
  'avis',
  'budget',
  'sixt',
  'national car',
  'alamo',
  'fleet',
];

const INSURANCE_PATTERNS = [
  'insurance',
  'insur',
  'geico',
  'progressive',
  'allstate',
  'state farm',
  'usaa',
  'nationwide',
  'liberty mutual',
  'farmers',
  'esurance',
  'assurance',
  'casualty',
  'mutual',
];

/**
 * Derive the Source bucket (Insurance / Rental / Repo / Other).
 * @param rentals    the raw `rentals` flag from the feed ("Y"/"N"/null)
 * @param sellerName the raw `sellerName` from the feed
 */
export function deriveSellerCategory(
  rentals?: string | null,
  sellerName?: string | null,
): SellerCategory {
  if (rentals && rentals.trim().toUpperCase().startsWith('Y')) return 'Rental';

  const name = (sellerName ?? '').toLowerCase();
  if (name) {
    if (RENTAL_PATTERNS.some((p) => name.includes(p))) return 'Rental';
    if (REPO_PATTERNS.some((p) => name.includes(p))) return 'Repo';
    if (INSURANCE_PATTERNS.some((p) => name.includes(p))) return 'Insurance';
  }
  return 'Other';
}

/**
 * Parse engine displacement in litres from a raw `engine` string.
 * Examples: "2.5L 4" → 2.5, "3.5L V6 DOHC" → 3.5, "1500cc" → 1.5.
 * Returns null when no plausible displacement is found.
 */
export function parseEngineSizeL(engine?: string | null): number | null {
  if (!engine) return null;
  const s = engine.toLowerCase();

  // "2.5l" / "2.5 l" / "2.5 liter" / bare "2.5"
  const litreMatch = s.match(/(\d\.\d)\s*(?:l\b|liter|litre|l\s|$)/);
  if (litreMatch) {
    const n = parseFloat(litreMatch[1]);
    if (n > 0 && n < 12) return n;
  }

  // "1500cc" / "1500 cc" → litres
  const ccMatch = s.match(/(\d{3,4})\s*cc\b/);
  if (ccMatch) {
    const n = parseInt(ccMatch[1], 10) / 1000;
    if (n > 0 && n < 12) return Math.round(n * 10) / 10;
  }

  // last resort: a lone "X.Y" anywhere
  const loose = s.match(/\b(\d\.\d)\b/);
  if (loose) {
    const n = parseFloat(loose[1]);
    if (n > 0 && n < 12) return n;
  }
  return null;
}

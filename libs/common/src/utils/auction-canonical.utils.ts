/**
 * Canonicalization for auction filter values (make / model / trim / color).
 *
 * The Copart feed and other sources store these raw, so the same value shows up
 * multiple times across casing ("FORD"/"Ford") and whitespace ("PRO  MASTER").
 * `normalizeToken` folds those deterministically; `canonicalize` additionally
 * applies a staff-curated alias map to merge spelling variants that normalization
 * alone can't (e.g. "PRO MASTER" → "PROMASTER"). Shared by ingestion, the
 * facets/aggregations, and the matching so every surface agrees.
 */

export const CANONICAL_FIELDS = ['make', 'model', 'trim', 'color'] as const;
export type CanonicalField = (typeof CANONICAL_FIELDS)[number];

/** Alias map for one field: normalized variant → canonical value. */
export type AliasMap = Record<string, string>;

/**
 * Deterministic canonical base: collapse internal whitespace, strip stray
 * leading/trailing punctuation, UPPERCASE. Returns null for empty/blank input.
 * Internal separators (e.g. the hyphen in MERCEDES-BENZ) are preserved.
 */
export function normalizeToken(raw?: string | null): string | null {
  if (raw == null) return null;
  const s = raw
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '')
    .toUpperCase();
  return s.length ? s : null;
}

/**
 * Full canonical value: normalized base, then the alias map override if present.
 * `aliasMap` keys are already-normalized variants.
 */
export function canonicalize(
  raw?: string | null,
  aliasMap?: AliasMap,
): string | null {
  const norm = normalizeToken(raw);
  if (norm == null) return null;
  return aliasMap?.[norm] ?? norm;
}

-- Canonical (deduped, UPPERCASE) filter values for auction listings + a
-- staff-curated alias table (Settings → Vehicle Data). Additive & non-destructive.

-- AlterTable: canonical columns on auction_listings
ALTER TABLE "auction_listings" ADD COLUMN "makeCanonical" TEXT;
ALTER TABLE "auction_listings" ADD COLUMN "modelCanonical" TEXT;
ALTER TABLE "auction_listings" ADD COLUMN "trimCanonical" TEXT;
ALTER TABLE "auction_listings" ADD COLUMN "colorCanonical" TEXT;

-- Deterministic backfill (matches normalizeToken: collapse whitespace, strip
-- stray leading/trailing punctuation, UPPERCASE) so canonical columns are
-- populated the moment this migration applies — no transition window where
-- matching would see NULLs. Alias overrides are layered on later by the sync.
UPDATE "auction_listings" SET
  "makeCanonical"  = NULLIF(UPPER(regexp_replace(regexp_replace(trim("make"),       '\s+', ' ', 'g'), '^[^A-Za-z0-9]+|[^A-Za-z0-9]+$', '', 'g')), ''),
  "modelCanonical" = NULLIF(UPPER(regexp_replace(regexp_replace(trim("modelGroup"), '\s+', ' ', 'g'), '^[^A-Za-z0-9]+|[^A-Za-z0-9]+$', '', 'g')), ''),
  "trimCanonical"  = NULLIF(UPPER(regexp_replace(regexp_replace(trim("trim"),       '\s+', ' ', 'g'), '^[^A-Za-z0-9]+|[^A-Za-z0-9]+$', '', 'g')), ''),
  "colorCanonical" = NULLIF(UPPER(regexp_replace(regexp_replace(trim("color"),      '\s+', ' ', 'g'), '^[^A-Za-z0-9]+|[^A-Za-z0-9]+$', '', 'g')), '');

-- CreateIndex
CREATE INDEX "auction_listings_makeCanonical_idx" ON "auction_listings"("makeCanonical");
CREATE INDEX "auction_listings_modelCanonical_idx" ON "auction_listings"("modelCanonical");
CREATE INDEX "auction_listings_trimCanonical_idx" ON "auction_listings"("trimCanonical");
CREATE INDEX "auction_listings_colorCanonical_idx" ON "auction_listings"("colorCanonical");

-- CreateTable
CREATE TABLE "auction_value_aliases" (
    "id" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "aliasKey" TEXT NOT NULL,
    "canonical" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "assignedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auction_value_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auction_value_aliases_field_aliasKey_key" ON "auction_value_aliases"("field", "aliasKey");

-- CreateIndex
CREATE INDEX "auction_value_aliases_field_reviewed_idx" ON "auction_value_aliases"("field", "reviewed");

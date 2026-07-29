-- Derived auction attributes for the unified filter system.
-- Backfilled by scripts/backfill-auction-derived.ts and by the Copart import.

-- AlterTable
ALTER TABLE "auction_listings" ADD COLUMN "sellerCategory" TEXT;
ALTER TABLE "auction_listings" ADD COLUMN "engineSizeL" DECIMAL(4,1);
ALTER TABLE "auction_listings" ADD COLUMN "locationLat" DOUBLE PRECISION;
ALTER TABLE "auction_listings" ADD COLUMN "locationLng" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "auction_listings_sellerCategory_idx" ON "auction_listings"("sellerCategory");
CREATE INDEX "auction_listings_saleTitleType_idx" ON "auction_listings"("saleTitleType");
CREATE INDEX "auction_listings_locationLat_locationLng_idx" ON "auction_listings"("locationLat", "locationLng");

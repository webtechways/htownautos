-- AlterTable: staff-marked "discarded" lots (already evaluated, skip next time)
ALTER TABLE "auction_listings"
  ADD COLUMN "discarded" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "discardReason" TEXT,
  ADD COLUMN "discardedAt" TIMESTAMP(3),
  ADD COLUMN "discardedById" TEXT;

-- CreateIndex
CREATE INDEX "auction_listings_discarded_idx" ON "auction_listings"("discarded");

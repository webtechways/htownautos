-- Staff-curated seller trust + Source classification, managed from Settings → Sellers.
-- Replaces the fixed deriveSellerCategory heuristic for the Trusted Seller matching
-- filter and the Source facet. Rows are auto-seeded by the sync for new sellers.
-- CreateTable
CREATE TABLE "auction_seller_classifications" (
    "sellerKey" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "trusted" BOOLEAN NOT NULL DEFAULT false,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "assignedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auction_seller_classifications_pkey" PRIMARY KEY ("sellerKey")
);

-- CreateIndex
CREATE INDEX "auction_seller_classifications_reviewed_idx" ON "auction_seller_classifications"("reviewed");

-- CreateIndex
CREATE INDEX "auction_seller_classifications_trusted_idx" ON "auction_seller_classifications"("trusted");

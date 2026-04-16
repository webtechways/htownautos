-- CreateTable
CREATE TABLE "buyer_auction_bids" (
    "id" UUID NOT NULL,
    "tenantId" TEXT,
    "buyerId" TEXT NOT NULL,
    "lotNumber" BIGINT NOT NULL,
    "maxBid" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buyer_auction_bids_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "buyer_auction_bids_tenantId_idx" ON "buyer_auction_bids"("tenantId");

-- CreateIndex
CREATE INDEX "buyer_auction_bids_buyerId_idx" ON "buyer_auction_bids"("buyerId");

-- CreateIndex
CREATE INDEX "buyer_auction_bids_lotNumber_idx" ON "buyer_auction_bids"("lotNumber");

-- CreateIndex
CREATE UNIQUE INDEX "buyer_auction_bids_buyerId_lotNumber_key" ON "buyer_auction_bids"("buyerId", "lotNumber");

-- AddForeignKey
ALTER TABLE "buyer_auction_bids" ADD CONSTRAINT "buyer_auction_bids_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_auction_bids" ADD CONSTRAINT "buyer_auction_bids_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_auction_bids" ADD CONSTRAINT "buyer_auction_bids_lotNumber_fkey" FOREIGN KEY ("lotNumber") REFERENCES "auction_listings"("lotNumber") ON DELETE CASCADE ON UPDATE CASCADE;

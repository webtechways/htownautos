-- CreateEnum
CREATE TYPE "AuctionAnalysisType" AS ENUM ('MARKET_CHECK', 'COMPARABLES', 'AUCTION_HISTORY');

-- CreateTable
CREATE TABLE "auction_analysis_snapshots" (
    "id" TEXT NOT NULL,
    "auctionListingId" BIGINT NOT NULL,
    "type" "AuctionAnalysisType" NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auction_analysis_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auction_analysis_snapshots_auctionListingId_idx" ON "auction_analysis_snapshots"("auctionListingId");

-- CreateIndex
CREATE UNIQUE INDEX "auction_analysis_snapshots_auctionListingId_type_key" ON "auction_analysis_snapshots"("auctionListingId", "type");

-- AddForeignKey
ALTER TABLE "auction_analysis_snapshots" ADD CONSTRAINT "auction_analysis_snapshots_auctionListingId_fkey" FOREIGN KEY ("auctionListingId") REFERENCES "auction_listings"("lotNumber") ON DELETE CASCADE ON UPDATE CASCADE;

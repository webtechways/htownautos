-- Add status and finalAmount columns to buyer_auction_bids
ALTER TABLE "buyer_auction_bids" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "buyer_auction_bids" ADD COLUMN "finalAmount" DECIMAL(12,2);

-- Index on status for filtering
CREATE INDEX "buyer_auction_bids_status_idx" ON "buyer_auction_bids"("status");

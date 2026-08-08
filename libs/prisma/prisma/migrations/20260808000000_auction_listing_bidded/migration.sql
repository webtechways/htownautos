-- "bidded": set true when the post-sale scraper reports a final price for the lot
-- (it passed its auction). Powers the "final price" filter in the Auction Listing.
ALTER TABLE "auction_listings" ADD COLUMN "bidded" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "auction_listings_bidded_idx" ON "auction_listings"("bidded");

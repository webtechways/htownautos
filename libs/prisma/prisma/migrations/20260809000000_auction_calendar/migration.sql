-- Auction calendar scraped from AutoBidMaster + scraper config singleton.
CREATE TABLE "auction_calendar_entries" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "auctionGroup" TEXT NOT NULL,
    "locationSourceId" INTEGER NOT NULL,
    "catalogSourceId" INTEGER,
    "locationName" TEXT NOT NULL,
    "locationSlug" TEXT NOT NULL,
    "countryCode" TEXT,
    "region" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "startedAt" TIMESTAMP(3) NOT NULL,
    "saleDate" INTEGER NOT NULL,
    "inventoryAuction" TEXT,
    "totalAvailableItems" INTEGER NOT NULL DEFAULT 0,
    "url" TEXT NOT NULL,
    "raw" JSONB,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auction_calendar_entries_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "auction_calendar_entries_locationSourceId_startedAt_key" ON "auction_calendar_entries"("locationSourceId", "startedAt");
CREATE INDEX "auction_calendar_entries_status_idx" ON "auction_calendar_entries"("status");
CREATE INDEX "auction_calendar_entries_saleDate_idx" ON "auction_calendar_entries"("saleDate");
CREATE INDEX "auction_calendar_entries_auctionGroup_idx" ON "auction_calendar_entries"("auctionGroup");

CREATE TABLE "auction_calendar_config" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "refreshHours" INTEGER NOT NULL DEFAULT 6,
    "lastFetchedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "lastCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auction_calendar_config_pkey" PRIMARY KEY ("id")
);
INSERT INTO "auction_calendar_config" ("id","updatedAt") VALUES ('singleton', CURRENT_TIMESTAMP) ON CONFLICT ("id") DO NOTHING;

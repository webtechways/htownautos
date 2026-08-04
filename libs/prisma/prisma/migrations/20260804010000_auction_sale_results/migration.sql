-- Post-sale auction outcomes per lot (final bid / asking / reserve / sold),
-- ingested from an external scraper and MERGED with a frozen snapshot of the
-- vehicle from auction_listings at ingest time. Decoupled from auction_listings
-- (no FK) so history survives listing deletion; dedupe key is (lot, saleDate).
CREATE TABLE IF NOT EXISTS "auction_sale_results" (
    "id"                TEXT NOT NULL,
    "lot"               BIGINT NOT NULL,

    -- Incoming sale/auction data
    "saleDate"          INTEGER,
    "auctionSession"    TEXT,
    "saleLocationSlug"  TEXT,
    "finalBid"          DECIMAL(12,2),
    "askingPrice"       DECIMAL(12,2),
    "reserve"           BOOLEAN,
    "sold"              BOOLEAN,
    "ticks"             INTEGER,
    "round"             INTEGER,
    "saleOrder"         INTEGER,
    "event"             TEXT,
    "pageUrl"           TEXT,
    "receivedAt"        TIMESTAMP(3),

    -- Vehicle snapshot promoted from auction_listings
    "matched"           BOOLEAN NOT NULL DEFAULT false,
    "vin"               TEXT,
    "year"              INTEGER,
    "make"              TEXT,
    "model"             TEXT,
    "modelDetail"       TEXT,
    "trim"              TEXT,
    "bodyStyle"         TEXT,
    "color"             TEXT,
    "damageDescription" TEXT,
    "secondaryDamage"   TEXT,
    "saleTitleType"     TEXT,
    "saleTitleState"    TEXT,
    "odometer"          DECIMAL(12,1),
    "runsDrives"        TEXT,
    "engine"            TEXT,
    "transmission"      TEXT,
    "drive"             TEXT,
    "fuelType"          TEXT,
    "cylinders"         TEXT,
    "estRetailValue"    DECIMAL(12,2),
    "repairCost"        DECIMAL(12,2),
    "highBidAtSync"     DECIMAL(12,2),
    "yardNumber"        INTEGER,
    "yardName"          TEXT,
    "locationCity"      TEXT,
    "locationState"     TEXT,
    "locationZip"       TEXT,
    "sellerName"        TEXT,
    "sellerCategory"    TEXT,

    -- Full payloads
    "vehicleSnapshot"   JSONB,
    "raw"               JSONB,

    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auction_sale_results_pkey" PRIMARY KEY ("id")
);

-- Dedupe: one row per (lot, saleDate). A re-auction on another day is a new row.
CREATE UNIQUE INDEX IF NOT EXISTS "auction_sale_results_lot_saleDate_key"
    ON "auction_sale_results"("lot", "saleDate");

CREATE INDEX IF NOT EXISTS "auction_sale_results_lot_idx"            ON "auction_sale_results"("lot");
CREATE INDEX IF NOT EXISTS "auction_sale_results_saleDate_idx"       ON "auction_sale_results"("saleDate");
CREATE INDEX IF NOT EXISTS "auction_sale_results_sold_idx"           ON "auction_sale_results"("sold");
CREATE INDEX IF NOT EXISTS "auction_sale_results_make_idx"           ON "auction_sale_results"("make");
CREATE INDEX IF NOT EXISTS "auction_sale_results_year_idx"           ON "auction_sale_results"("year");
CREATE INDEX IF NOT EXISTS "auction_sale_results_yardNumber_idx"     ON "auction_sale_results"("yardNumber");
CREATE INDEX IF NOT EXISTS "auction_sale_results_saleTitleType_idx"  ON "auction_sale_results"("saleTitleType");
CREATE INDEX IF NOT EXISTS "auction_sale_results_sellerCategory_idx" ON "auction_sale_results"("sellerCategory");

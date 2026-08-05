-- Image scraping/caching subsystem: proactive S3 caching of Copart lot galleries.
-- Adds a work queue (image_cache_jobs), a singleton control row (image_scrape_config),
-- and non-destructive Webshare proxy inventory columns. Auction data is global.

-- AlterTable: keep historical proxy inventory instead of wiping on each sync
ALTER TABLE "proxies" ADD COLUMN     "lastSeenInFeedAt" TIMESTAMP(3);
ALTER TABLE "proxies" ADD COLUMN     "retiredAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "image_cache_jobs" (
    "lotNumber" BIGINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" INTEGER,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "failedSequences" JSONB,
    "lastError" TEXT,
    "lastAttemptAt" TIMESTAMP(3),
    "source" TEXT NOT NULL DEFAULT 'backfill',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "image_cache_jobs_pkey" PRIMARY KEY ("lotNumber")
);

-- CreateIndex
CREATE INDEX "image_cache_jobs_status_priority_idx" ON "image_cache_jobs"("status", "priority");

-- CreateTable
CREATE TABLE "image_scrape_config" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "paused" BOOLEAN NOT NULL DEFAULT false,
    "lotsPerTick" INTEGER NOT NULL DEFAULT 6,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "perSequenceDelayMs" INTEGER NOT NULL DEFAULT 0,
    "concurrency" INTEGER NOT NULL DEFAULT 4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "image_scrape_config_pkey" PRIMARY KEY ("id")
);

-- Seed the singleton control row
INSERT INTO "image_scrape_config" ("id", "updatedAt") VALUES ('singleton', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

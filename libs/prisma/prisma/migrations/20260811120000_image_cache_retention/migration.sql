-- Gallery retention: drop cached images N days after the auction ran.
-- 0 keeps the previous behaviour (never delete).
ALTER TABLE "image_scrape_config" ADD COLUMN "retentionDays" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "image_scrape_config" ADD COLUMN "retentionLastRunAt" TIMESTAMP(3);
ALTER TABLE "image_scrape_config" ADD COLUMN "retentionDeletedLots" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "image_scrape_config" ADD COLUMN "retentionLastError" TEXT;

-- Configurable Webshare proxy auto-resync (interval + last-sync timestamp),
-- controlled from Settings -> Image Cache -> Proxies.
ALTER TABLE "image_scrape_config" ADD COLUMN "proxyResyncHours" INTEGER NOT NULL DEFAULT 168;
ALTER TABLE "image_scrape_config" ADD COLUMN "proxyLastSyncAt" TIMESTAMP(3);

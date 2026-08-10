-- Visual debugging for the headless monitor: a capture of the last login check
-- and a capped tail of page captures per session (S3/CDN urls).

ALTER TABLE "auction_monitor_config" ADD COLUMN "loginScreenshotUrl" TEXT;

ALTER TABLE "auction_monitor_sessions" ADD COLUMN "screenshots" JSONB;
ALTER TABLE "auction_monitor_sessions" ADD COLUMN "screenshotRequestedAt" TIMESTAMP(3);

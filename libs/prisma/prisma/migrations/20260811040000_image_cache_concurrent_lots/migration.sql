-- How many lots the gallery-cache consumer processes at once (RabbitMQ prefetch).
-- Default 1 preserves the previous serial behaviour until it is raised from the UI.
ALTER TABLE "image_scrape_config" ADD COLUMN "concurrentLots" INTEGER NOT NULL DEFAULT 1;

-- Per-entry "monitor" toggle (preserved across calendar refreshes).
ALTER TABLE "auction_calendar_entries" ADD COLUMN "monitor" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "auction_calendar_entries_monitor_idx" ON "auction_calendar_entries"("monitor");

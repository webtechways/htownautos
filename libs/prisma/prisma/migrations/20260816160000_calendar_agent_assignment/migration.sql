-- Agente asignado a cada subasta del calendario. SET NULL al borrar el agente:
-- la subasta sigue existiendo y el job diario le asignará otro.
ALTER TABLE "auction_calendar_entries" ADD COLUMN "scraperAgentId" TEXT;
CREATE INDEX "auction_calendar_entries_scraperAgentId_idx" ON "auction_calendar_entries"("scraperAgentId");
ALTER TABLE "auction_calendar_entries"
  ADD CONSTRAINT "auction_calendar_entries_scraperAgentId_fkey"
  FOREIGN KEY ("scraperAgentId") REFERENCES "scraper_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

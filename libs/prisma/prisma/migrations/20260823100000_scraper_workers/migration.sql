-- Una VM con Chrome + Automa. La fila se crea sola en el primer poll, así que
-- esta tabla nace vacía y no hay nada que sembrar.
CREATE TABLE "scraper_workers" (
  "id"             TEXT NOT NULL,
  "label"          TEXT,
  "scraperAgentId" TEXT,
  "enabled"        BOOLEAN NOT NULL DEFAULT true,
  "maxAuctions"    INTEGER NOT NULL DEFAULT 5,
  "lastSeenAt"     TIMESTAMP(3),
  "lastClaimAt"    TIMESTAMP(3),
  "lastIp"         TEXT,
  "notes"          TEXT,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL,
  CONSTRAINT "scraper_workers_pkey" PRIMARY KEY ("id")
);

-- Una cuenta, una VM: la misma cuenta entrando desde dos IPs a la vez es el
-- patrón que hace saltar los bloqueos del portal, así que lo impide la BD.
CREATE UNIQUE INDEX "scraper_workers_scraperAgentId_key" ON "scraper_workers"("scraperAgentId");
CREATE INDEX "scraper_workers_enabled_idx" ON "scraper_workers"("enabled");

ALTER TABLE "scraper_workers"
  ADD CONSTRAINT "scraper_workers_scraperAgentId_fkey"
  FOREIGN KEY ("scraperAgentId") REFERENCES "scraper_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- La VM que se llevó cada subasta. SET NULL al borrar la VM: la subasta vuelve
-- al bote y el siguiente poll de otra máquina la recoge.
ALTER TABLE "auction_calendar_entries" ADD COLUMN "scraperWorkerId" TEXT;

ALTER TABLE "auction_calendar_entries"
  ADD CONSTRAINT "auction_calendar_entries_scraperWorkerId_fkey"
  FOREIGN KEY ("scraperWorkerId") REFERENCES "scraper_workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- El poll pregunta dos cosas y las dos van por aquí: "lo de esta VM hoy" y
-- "candidatos libres de hoy".
CREATE INDEX "auction_calendar_entries_saleDate_scraperWorkerId_idx"
  ON "auction_calendar_entries"("saleDate", "scraperWorkerId");

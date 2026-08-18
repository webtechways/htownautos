-- País de registro de la cuenta de agente.
ALTER TABLE "scraper_agents" ADD COLUMN "country" TEXT NOT NULL DEFAULT 'US';
CREATE INDEX "scraper_agents_country_idx" ON "scraper_agents"("country");

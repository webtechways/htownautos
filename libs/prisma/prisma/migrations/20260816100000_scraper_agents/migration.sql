-- Cuentas de agente para operar en los portales de subasta.
CREATE TABLE "scraper_agents" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "auction" TEXT NOT NULL DEFAULT 'copart',
    "password" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scraper_agents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "scraper_agents_auction_email_key" ON "scraper_agents"("auction", "email");
CREATE INDEX "scraper_agents_auction_idx" ON "scraper_agents"("auction");
CREATE INDEX "scraper_agents_active_idx" ON "scraper_agents"("active");

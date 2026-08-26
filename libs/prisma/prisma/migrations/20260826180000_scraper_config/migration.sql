-- Ajustes del reparto entre VMs. Fila unica creada aqui mismo para que el
-- servicio nunca tenga que decidir si existe.
CREATE TABLE "scraper_config" (
  "id"                 TEXT NOT NULL DEFAULT 'singleton',
  "saleDurationHours"  INTEGER NOT NULL DEFAULT 6,
  "deadWorkerMinutes"  INTEGER NOT NULL DEFAULT 15,
  "defaultMaxAuctions" INTEGER NOT NULL DEFAULT 5,
  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "scraper_config_pkey" PRIMARY KEY ("id")
);

INSERT INTO "scraper_config" ("id") VALUES ('singleton') ON CONFLICT DO NOTHING;

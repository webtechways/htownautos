-- Yards: canonical model for physical auction yards. Backfills from the
-- existing denormalized (yardNumber, yardName) columns on auction_listings
-- and links every listing + inspection to the new row.
--
-- Idempotency: this migration is applied via `prisma migrate deploy` which
-- only runs unmapped migrations once, so the backfill is safe as-is.

-- pgcrypto provides gen_random_uuid(); no-op if already enabled.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "YardSource" AS ENUM ('COPART', 'IAAI', 'OTHER');

-- CreateTable
CREATE TABLE "yards" (
    "id" TEXT NOT NULL,
    "source" "YardSource" NOT NULL,
    "yardNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT DEFAULT 'US',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phone" TEXT,
    "email" TEXT,
    "contactName" TEXT,
    "physicalInspectionAvailable" BOOLEAN NOT NULL DEFAULT false,
    "hours" JSONB,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "yards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "yards_source_yardNumber_key" ON "yards"("source", "yardNumber");
CREATE INDEX "yards_state_idx" ON "yards"("state");
CREATE INDEX "yards_physicalInspectionAvailable_idx" ON "yards"("physicalInspectionAvailable");
CREATE INDEX "yards_isActive_idx" ON "yards"("isActive");

-- AlterTable: nullable FK columns. Filled by the backfill below; existing
-- rows whose yard can't be resolved keep yardId = NULL.
ALTER TABLE "auction_listings" ADD COLUMN "yardId" TEXT;
ALTER TABLE "vehicle_inspections" ADD COLUMN "yardId" TEXT;

-- Backfill yards from the distinct (yardNumber, yardName) pairs already
-- in auction_listings. Source is hardcoded COPART because every existing
-- listing originates from the Copart import; IAAI / OTHER yards will be
-- inserted via the UI as they appear.
INSERT INTO "yards" ("id", "source", "yardNumber", "name", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  'COPART'::"YardSource",
  sub."yardNumber",
  -- Use the most common (or first) name for that yardNumber. yardName
  -- can drift between rows ("OH - DAYTON" vs "OH - DAYTON CENTRAL"); we
  -- pick one and a human can fix it from the UI later.
  MIN(sub."yardName") AS "name",
  NOW(),
  NOW()
FROM (
  SELECT DISTINCT "yardNumber", "yardName"
  FROM "auction_listings"
  WHERE "yardNumber" IS NOT NULL AND "yardName" IS NOT NULL
) sub
GROUP BY sub."yardNumber";

-- Wire every auction_listings row to its yard.
UPDATE "auction_listings" al
SET "yardId" = y."id"
FROM "yards" y
WHERE y."source" = 'COPART'::"YardSource"
  AND y."yardNumber" = al."yardNumber"
  AND al."yardNumber" IS NOT NULL;

-- Same for vehicle_inspections. yardNumber here is TEXT (the inspection
-- service copies it as string from the listing), so cast both sides.
UPDATE "vehicle_inspections" vi
SET "yardId" = y."id"
FROM "yards" y
WHERE y."source" = 'COPART'::"YardSource"
  AND y."yardNumber"::TEXT = vi."yardNumber"
  AND vi."yardNumber" IS NOT NULL;

-- FK constraints. SET NULL on delete so yards can be wiped without
-- losing listings / inspections (which is the safer policy — the yard
-- info is denormalized into yardName/yardNumber anyway).
ALTER TABLE "auction_listings"
  ADD CONSTRAINT "auction_listings_yardId_fkey"
  FOREIGN KEY ("yardId") REFERENCES "yards"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "vehicle_inspections"
  ADD CONSTRAINT "vehicle_inspections_yardId_fkey"
  FOREIGN KEY ("yardId") REFERENCES "yards"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "auction_listings_yardId_idx" ON "auction_listings"("yardId");
CREATE INDEX "vehicle_inspections_yardId_idx" ON "vehicle_inspections"("yardId");

-- Add the public catalog slug to yards (e.g. "tx-houston"). Additive + nullable
-- so existing rows are untouched; a one-off backfill (scripts/yard-locations/
-- backfill-yard-slugs.ts) fills it from the Copart/AutoBidMaster locations dump,
-- matched by (source, yardNumber). IF NOT EXISTS keeps this safe to re-run and
-- resilient to a shared DB where the column may already have been added.
ALTER TABLE "yards" ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- Partial-unique via a plain unique index; multiple NULLs are allowed in
-- Postgres, so yards without a slug don't collide.
CREATE UNIQUE INDEX IF NOT EXISTS "yards_slug_key" ON "yards"("slug");

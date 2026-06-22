-- AddColumn: aiSummary (nullable Text) to carfax_reports
-- Safe for 100k+ rows: ADD COLUMN with a default NULL requires only a metadata
-- change in modern Postgres (no table rewrite, no lock on existing rows).
-- Rollback: ALTER TABLE "carfax_reports" DROP COLUMN "aiSummary";

ALTER TABLE "carfax_reports" ADD COLUMN "aiSummary" TEXT;

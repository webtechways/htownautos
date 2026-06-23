-- Migration: add sync progress tracking fields to sync_runs
-- Safe: all columns are nullable or have defaults, no data loss, no locks on existing rows
-- Rollback: DROP COLUMN phase, progress, processedRows, totalRows (safe, additive only)

ALTER TABLE "sync_runs"
  ADD COLUMN IF NOT EXISTS "phase"          TEXT,
  ADD COLUMN IF NOT EXISTS "progress"       INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "processedRows"  INTEGER,
  ADD COLUMN IF NOT EXISTS "totalRows"      INTEGER;

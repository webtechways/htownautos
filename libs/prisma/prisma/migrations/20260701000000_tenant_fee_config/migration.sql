-- AlterTable: add nullable JSONB column for per-tenant auction fee configuration
-- Safe on a 100k-row table: ADD COLUMN ... NULL with no DEFAULT needs no table rewrite.
-- Rollback: ALTER TABLE "tenants" DROP COLUMN "fee_config";
ALTER TABLE "tenants" ADD COLUMN "fee_config" JSONB;

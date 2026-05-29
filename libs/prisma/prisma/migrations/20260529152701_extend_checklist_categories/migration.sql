-- AlterEnum: extend ChecklistCategory with sensory / mechanical categories.
-- These ALTER TYPE statements must run outside a transaction; Prisma's
-- migrate engine handles that automatically for enum-only migrations.
ALTER TYPE "ChecklistCategory" ADD VALUE IF NOT EXISTS 'FLUIDS';
ALTER TYPE "ChecklistCategory" ADD VALUE IF NOT EXISTS 'SENSORY';
ALTER TYPE "ChecklistCategory" ADD VALUE IF NOT EXISTS 'START_BEHAVIOR';

-- AlterTable: deadline for the inspection (set by the client when requesting)
ALTER TABLE "vehicle_inspections" ADD COLUMN     "dueAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "vehicle_inspections_dueAt_idx" ON "vehicle_inspections"("dueAt");

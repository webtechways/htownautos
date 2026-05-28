-- CreateEnum
CREATE TYPE "VehicleInspectionStatus" AS ENUM ('REQUESTED', 'IN_PROGRESS', 'DONE', 'REJECTED', 'CANCELED');

-- CreateEnum
CREATE TYPE "ChecklistCategory" AS ENUM ('FRONT_END', 'SIDE_PANELS', 'REAR_END', 'WHEELS_SUSPENSION', 'INTERIOR', 'ENGINE_BAY', 'UNDERBODY', 'LIGHTING_ELECTRICAL', 'REPAIR_BODYWORK', 'FLOOD_DAMAGE', 'OTHER');

-- AlterTable: report date for the existing CarfaxReport
ALTER TABLE "carfax_reports" ADD COLUMN     "date" TIMESTAMP(3);

-- AlterTable: new media FKs for inspection / checklist / carfax registry
ALTER TABLE "media" ADD COLUMN     "inspectionId" TEXT,
ADD COLUMN     "inspectionChecklistItemId" TEXT,
ADD COLUMN     "carfaxReportId" TEXT;

-- CreateTable
CREATE TABLE "vehicle_inspections" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "vin" TEXT NOT NULL,
    "lotNumber" TEXT,
    "yardName" TEXT,
    "yardNumber" TEXT,
    "vehicleId" TEXT,
    "buyerId" TEXT,
    "status" "VehicleInspectionStatus" NOT NULL DEFAULT 'REQUESTED',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inspectedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "inspectorId" TEXT,
    "specificRequest" TEXT,
    "overallRating" INTEGER,
    "marketPrice" DECIMAL(12,2),
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_checklist_items" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "category" "ChecklistCategory" NOT NULL,
    "part" TEXT NOT NULL,
    "quality" INTEGER,
    "notes" TEXT,
    "voiceNoteTranscription" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspection_checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "carfax_reports_date_idx" ON "carfax_reports"("date");

-- CreateIndex
CREATE INDEX "media_inspectionId_idx" ON "media"("inspectionId");

-- CreateIndex
CREATE INDEX "media_inspectionChecklistItemId_idx" ON "media"("inspectionChecklistItemId");

-- CreateIndex
CREATE INDEX "media_carfaxReportId_idx" ON "media"("carfaxReportId");

-- CreateIndex
CREATE INDEX "vehicle_inspections_tenantId_idx" ON "vehicle_inspections"("tenantId");

-- CreateIndex
CREATE INDEX "vehicle_inspections_vehicleId_idx" ON "vehicle_inspections"("vehicleId");

-- CreateIndex
CREATE INDEX "vehicle_inspections_buyerId_idx" ON "vehicle_inspections"("buyerId");

-- CreateIndex
CREATE INDEX "vehicle_inspections_vin_idx" ON "vehicle_inspections"("vin");

-- CreateIndex
CREATE INDEX "vehicle_inspections_lotNumber_idx" ON "vehicle_inspections"("lotNumber");

-- CreateIndex
CREATE INDEX "vehicle_inspections_status_idx" ON "vehicle_inspections"("status");

-- CreateIndex
CREATE INDEX "vehicle_inspections_requestedAt_idx" ON "vehicle_inspections"("requestedAt");

-- CreateIndex
CREATE INDEX "inspection_checklist_items_inspectionId_idx" ON "inspection_checklist_items"("inspectionId");

-- CreateIndex
CREATE INDEX "inspection_checklist_items_category_idx" ON "inspection_checklist_items"("category");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "vehicle_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_inspectionChecklistItemId_fkey" FOREIGN KEY ("inspectionChecklistItemId") REFERENCES "inspection_checklist_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_carfaxReportId_fkey" FOREIGN KEY ("carfaxReportId") REFERENCES "carfax_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_inspections" ADD CONSTRAINT "vehicle_inspections_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_inspections" ADD CONSTRAINT "vehicle_inspections_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_inspections" ADD CONSTRAINT "vehicle_inspections_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_checklist_items" ADD CONSTRAINT "inspection_checklist_items_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "vehicle_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "InspectionErrorLevel" AS ENUM ('GREEN', 'YELLOW', 'RED');

-- CreateTable
CREATE TABLE "inspection_error_codes" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "level" "InspectionErrorLevel" NOT NULL DEFAULT 'GREEN',
    "note" TEXT,
    "voiceNoteTranscription" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspection_error_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inspection_error_codes_inspectionId_idx" ON "inspection_error_codes"("inspectionId");

-- AlterTable
ALTER TABLE "media" ADD COLUMN "inspectionErrorCodeId" TEXT;

-- CreateIndex
CREATE INDEX "media_inspectionErrorCodeId_idx" ON "media"("inspectionErrorCodeId");

-- AddForeignKey
ALTER TABLE "inspection_error_codes" ADD CONSTRAINT "inspection_error_codes_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "vehicle_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_inspectionErrorCodeId_fkey" FOREIGN KEY ("inspectionErrorCodeId") REFERENCES "inspection_error_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

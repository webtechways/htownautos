-- AlterTable: link Media rows directly to a request item.
ALTER TABLE "media" ADD COLUMN     "inspectionRequestItemId" TEXT;

-- CreateTable
CREATE TABLE "inspection_request_items" (
    "id" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspection_request_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inspection_request_items_inspectionId_idx" ON "inspection_request_items"("inspectionId");

-- CreateIndex
CREATE INDEX "media_inspectionRequestItemId_idx" ON "media"("inspectionRequestItemId");

-- AddForeignKey
ALTER TABLE "inspection_request_items" ADD CONSTRAINT "inspection_request_items_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "vehicle_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_inspectionRequestItemId_fkey" FOREIGN KEY ("inspectionRequestItemId") REFERENCES "inspection_request_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

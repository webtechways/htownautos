-- AlterTable: tag buyer vehicle preferences created via the paid "Find a Car for Me" web flow
ALTER TABLE "buyer_vehicle_preferences"
  ADD COLUMN "paid" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "paidAt" TIMESTAMP(3),
  ADD COLUMN "source" TEXT,
  ADD COLUMN "portalOrderId" TEXT;

-- CreateIndex
CREATE INDEX "buyer_vehicle_preferences_paid_idx" ON "buyer_vehicle_preferences"("paid");

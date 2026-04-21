-- CreateTable
CREATE TABLE "buyer_vehicle_preferences" (
    "id" UUID NOT NULL,
    "tenantId" TEXT,
    "buyerId" TEXT NOT NULL,
    "yearFrom" INTEGER,
    "yearTo" INTEGER,
    "make" TEXT NOT NULL,
    "models" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "trims" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "maxMileage" INTEGER,
    "titleTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "colors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "maxCost" DECIMAL(12,2),
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buyer_vehicle_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "buyer_vehicle_preferences_tenantId_idx" ON "buyer_vehicle_preferences"("tenantId");

-- CreateIndex
CREATE INDEX "buyer_vehicle_preferences_buyerId_idx" ON "buyer_vehicle_preferences"("buyerId");

-- CreateIndex
CREATE INDEX "buyer_vehicle_preferences_make_idx" ON "buyer_vehicle_preferences"("make");

-- AddForeignKey
ALTER TABLE "buyer_vehicle_preferences" ADD CONSTRAINT "buyer_vehicle_preferences_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_vehicle_preferences" ADD CONSTRAINT "buyer_vehicle_preferences_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

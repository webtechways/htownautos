-- CreateTable
CREATE TABLE "buyer_favorites" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "buyerId" TEXT NOT NULL,
    "lotNumber" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "buyer_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "buyer_favorites_tenantId_buyerId_idx" ON "buyer_favorites"("tenantId", "buyerId");

-- CreateIndex
CREATE INDEX "buyer_favorites_lotNumber_idx" ON "buyer_favorites"("lotNumber");

-- CreateIndex
CREATE UNIQUE INDEX "buyer_favorites_buyerId_lotNumber_key" ON "buyer_favorites"("buyerId", "lotNumber");

-- AddForeignKey
ALTER TABLE "buyer_favorites" ADD CONSTRAINT "buyer_favorites_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buyer_favorites" ADD CONSTRAINT "buyer_favorites_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

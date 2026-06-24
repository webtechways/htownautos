-- CreateTable
CREATE TABLE "buyer_match_exclusions" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "tenantId" TEXT,
    "lotNumber" BIGINT NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "buyer_match_exclusions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "buyer_match_exclusions_buyerId_lotNumber_key" ON "buyer_match_exclusions"("buyerId", "lotNumber");

-- CreateIndex
CREATE INDEX "buyer_match_exclusions_buyerId_idx" ON "buyer_match_exclusions"("buyerId");

-- AddForeignKey
ALTER TABLE "buyer_match_exclusions" ADD CONSTRAINT "buyer_match_exclusions_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "investments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "source" TEXT NOT NULL,
    "sourceAccount" TEXT,
    "payBackAmount" DECIMAL(14,2),
    "payBackInterval" TEXT,
    "settleDeadline" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "investments_tenantId_idx" ON "investments"("tenantId");

-- CreateIndex
CREATE INDEX "investments_tenantId_source_idx" ON "investments"("tenantId", "source");

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

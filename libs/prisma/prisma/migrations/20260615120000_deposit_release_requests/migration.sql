-- CreateEnum
CREATE TYPE "DepositReleaseStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "deposit_release_requests" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "buyerId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "DepositReleaseStatus" NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "decisionNote" TEXT,
    "stripe_refund_id" TEXT,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deposit_release_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "deposit_release_requests_tenantId_buyerId_idx" ON "deposit_release_requests"("tenantId", "buyerId");

-- CreateIndex
CREATE INDEX "deposit_release_requests_buyerId_idx" ON "deposit_release_requests"("buyerId");

-- CreateIndex
CREATE INDEX "deposit_release_requests_status_idx" ON "deposit_release_requests"("status");

-- CreateIndex
CREATE INDEX "deposit_release_requests_tenantId_idx" ON "deposit_release_requests"("tenantId");

-- CreateIndex
CREATE INDEX "deposit_release_requests_decidedById_idx" ON "deposit_release_requests"("decidedById");

-- AddForeignKey
ALTER TABLE "deposit_release_requests" ADD CONSTRAINT "deposit_release_requests_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposit_release_requests" ADD CONSTRAINT "deposit_release_requests_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposit_release_requests" ADD CONSTRAINT "deposit_release_requests_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

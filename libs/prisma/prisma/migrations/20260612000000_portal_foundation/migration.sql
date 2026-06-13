-- CreateEnum
CREATE TYPE "CustomerLedgerEntryType" AS ENUM ('DEPOSIT', 'CHARGE', 'REFUND', 'APPLIED', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "CustomerLedgerEntryStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PortalOrderType" AS ENUM ('INSPECTION', 'SERVICE', 'DEPOSIT');

-- CreateEnum
CREATE TYPE "PortalOrderStatus" AS ENUM ('PENDING', 'PAID', 'FULFILLED', 'CANCELED', 'REFUNDED');

-- AlterTable
ALTER TABLE "buyers" ADD COLUMN     "clerk_user_id" TEXT;

-- CreateTable
CREATE TABLE "customer_ledger_entries" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "buyerId" TEXT NOT NULL,
    "type" "CustomerLedgerEntryType" NOT NULL,
    "status" "CustomerLedgerEntryStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "description" TEXT,
    "source" TEXT,
    "stripe_payment_intent_id" TEXT,
    "relatedInspectionId" TEXT,
    "relatedDealId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_orders" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "buyerId" TEXT NOT NULL,
    "type" "PortalOrderType" NOT NULL,
    "status" "PortalOrderStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "description" TEXT,
    "stripe_checkout_session_id" TEXT,
    "stripe_payment_intent_id" TEXT,
    "relatedInspectionId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portal_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customer_ledger_entries_tenantId_buyerId_idx" ON "customer_ledger_entries"("tenantId", "buyerId");

-- CreateIndex
CREATE INDEX "customer_ledger_entries_stripe_payment_intent_id_idx" ON "customer_ledger_entries"("stripe_payment_intent_id");

-- CreateIndex
CREATE INDEX "customer_ledger_entries_tenantId_idx" ON "customer_ledger_entries"("tenantId");

-- CreateIndex
CREATE INDEX "customer_ledger_entries_buyerId_idx" ON "customer_ledger_entries"("buyerId");

-- CreateIndex
CREATE INDEX "customer_ledger_entries_relatedInspectionId_idx" ON "customer_ledger_entries"("relatedInspectionId");

-- CreateIndex
CREATE INDEX "customer_ledger_entries_relatedDealId_idx" ON "customer_ledger_entries"("relatedDealId");

-- CreateIndex
CREATE INDEX "customer_ledger_entries_createdById_idx" ON "customer_ledger_entries"("createdById");

-- CreateIndex
CREATE INDEX "portal_orders_tenantId_buyerId_idx" ON "portal_orders"("tenantId", "buyerId");

-- CreateIndex
CREATE INDEX "portal_orders_status_idx" ON "portal_orders"("status");

-- CreateIndex
CREATE INDEX "portal_orders_stripe_checkout_session_id_idx" ON "portal_orders"("stripe_checkout_session_id");

-- CreateIndex
CREATE INDEX "portal_orders_tenantId_idx" ON "portal_orders"("tenantId");

-- CreateIndex
CREATE INDEX "portal_orders_buyerId_idx" ON "portal_orders"("buyerId");

-- CreateIndex
CREATE INDEX "portal_orders_relatedInspectionId_idx" ON "portal_orders"("relatedInspectionId");

-- CreateIndex
CREATE INDEX "portal_orders_stripe_payment_intent_id_idx" ON "portal_orders"("stripe_payment_intent_id");

-- CreateIndex
CREATE UNIQUE INDEX "buyers_clerk_user_id_key" ON "buyers"("clerk_user_id");

-- CreateIndex
CREATE INDEX "buyers_clerk_user_id_idx" ON "buyers"("clerk_user_id");

-- AddForeignKey
ALTER TABLE "customer_ledger_entries" ADD CONSTRAINT "customer_ledger_entries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_ledger_entries" ADD CONSTRAINT "customer_ledger_entries_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_ledger_entries" ADD CONSTRAINT "customer_ledger_entries_relatedInspectionId_fkey" FOREIGN KEY ("relatedInspectionId") REFERENCES "vehicle_inspections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_ledger_entries" ADD CONSTRAINT "customer_ledger_entries_relatedDealId_fkey" FOREIGN KEY ("relatedDealId") REFERENCES "deals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_ledger_entries" ADD CONSTRAINT "customer_ledger_entries_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_orders" ADD CONSTRAINT "portal_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_orders" ADD CONSTRAINT "portal_orders_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_orders" ADD CONSTRAINT "portal_orders_relatedInspectionId_fkey" FOREIGN KEY ("relatedInspectionId") REFERENCES "vehicle_inspections"("id") ON DELETE SET NULL ON UPDATE CASCADE;


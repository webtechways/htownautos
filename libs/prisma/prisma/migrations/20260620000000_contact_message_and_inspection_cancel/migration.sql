-- CreateTable
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "buyerId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_messages_tenantId_idx" ON "contact_messages"("tenantId");

-- CreateIndex
CREATE INDEX "contact_messages_status_idx" ON "contact_messages"("status");

-- CreateIndex
CREATE INDEX "contact_messages_createdAt_idx" ON "contact_messages"("createdAt");

-- AddForeignKey
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: add cancellation fields to vehicle_inspections (all nullable/defaulted — additive safe)
ALTER TABLE "vehicle_inspections"
    ADD COLUMN "cancelledAt" TIMESTAMP(3),
    ADD COLUMN "cancelReason" TEXT,
    ADD COLUMN "cancelledByCustomer" BOOLEAN NOT NULL DEFAULT false;

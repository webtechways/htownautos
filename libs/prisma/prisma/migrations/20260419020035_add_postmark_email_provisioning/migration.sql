-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "cloudflareDnsRecordIds" JSONB,
ADD COLUMN     "emailProvisionedAt" TIMESTAMP(3),
ADD COLUMN     "postmarkDkimVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "postmarkDomainId" INTEGER,
ADD COLUMN     "postmarkReturnPathVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "postmarkServerId" INTEGER,
ADD COLUMN     "postmarkServerToken" TEXT,
ADD COLUMN     "postmarkWebhookId" INTEGER;

-- CreateTable
CREATE TABLE "unmatched_inbound_emails" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT,
    "toEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT,
    "bodyText" TEXT,
    "messageId" TEXT,
    "headers" JSONB,
    "attachments" JSONB,
    "rawPayload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "linkedBuyerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unmatched_inbound_emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unmatched_inbound_emails_messageId_key" ON "unmatched_inbound_emails"("messageId");

-- CreateIndex
CREATE INDEX "unmatched_inbound_emails_tenantId_status_idx" ON "unmatched_inbound_emails"("tenantId", "status");

-- CreateIndex
CREATE INDEX "unmatched_inbound_emails_fromEmail_idx" ON "unmatched_inbound_emails"("fromEmail");

-- AddForeignKey
ALTER TABLE "unmatched_inbound_emails" ADD CONSTRAINT "unmatched_inbound_emails_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

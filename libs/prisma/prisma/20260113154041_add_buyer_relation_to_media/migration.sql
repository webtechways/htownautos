-- AlterTable
ALTER TABLE "media" ADD COLUMN     "buyerId" TEXT;

-- CreateIndex
CREATE INDEX "media_buyerId_idx" ON "media"("buyerId");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

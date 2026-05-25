-- AlterTable
ALTER TABLE "auction_listings" ADD COLUMN     "isStale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastSeenAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "sync_runs" (
    "id" UUID NOT NULL,
    "source" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'running',
    "bytesDownloaded" INTEGER,
    "rowsParsed" INTEGER NOT NULL DEFAULT 0,
    "rowsValid" INTEGER NOT NULL DEFAULT 0,
    "rowsInvalid" INTEGER NOT NULL DEFAULT 0,
    "rowsUpserted" INTEGER NOT NULL DEFAULT 0,
    "rowsStaleMarked" INTEGER NOT NULL DEFAULT 0,
    "rowsIndexed" INTEGER NOT NULL DEFAULT 0,
    "rowsIndexFailed" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER,
    "error" TEXT,

    CONSTRAINT "sync_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sync_runs_source_startedAt_idx" ON "sync_runs"("source", "startedAt" DESC);

-- CreateIndex
CREATE INDEX "sync_runs_status_idx" ON "sync_runs"("status");

-- CreateIndex
CREATE INDEX "auction_listings_isStale_idx" ON "auction_listings"("isStale");

-- CreateIndex
CREATE INDEX "auction_listings_lastSeenAt_idx" ON "auction_listings"("lastSeenAt");

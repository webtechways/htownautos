-- Headless live-sale monitor: singleton config + one row per browser session.

CREATE TABLE "auction_monitor_config" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "paused" BOOLEAN NOT NULL DEFAULT true,
    "leadMinutes" INTEGER NOT NULL DEFAULT 5,
    "maxConcurrentSessions" INTEGER NOT NULL DEFAULT 6,
    "idleStopMinutes" INTEGER NOT NULL DEFAULT 25,
    "maxDurationMinutes" INTEGER NOT NULL DEFAULT 300,
    "onlySold" BOOLEAN NOT NULL DEFAULT true,
    "eventNames" TEXT NOT NULL DEFAULT 'event',
    "wsUrlPattern" TEXT NOT NULL DEFAULT 'broadcast\.autobidmaster\.com',
    "includeRaw" BOOLEAN NOT NULL DEFAULT false,
    "forwardWebhookUrl" TEXT,
    "loginOk" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "loginError" TEXT,
    "loginTestRequestedAt" TIMESTAMP(3),
    "workerHeartbeatAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auction_monitor_config_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "auction_monitor_sessions" (
    "id" TEXT NOT NULL,
    "calendarEntryId" TEXT,
    "locationSourceId" INTEGER,
    "locationName" TEXT NOT NULL,
    "locationSlug" TEXT NOT NULL,
    "saleDate" INTEGER NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "lastEventAt" TIMESTAMP(3),
    "framesSeen" INTEGER NOT NULL DEFAULT 0,
    "eventsSold" INTEGER NOT NULL DEFAULT 0,
    "ingested" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "stopReason" TEXT,
    "error" TEXT,
    "log" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auction_monitor_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "auction_monitor_sessions_status_idx" ON "auction_monitor_sessions"("status");
CREATE INDEX "auction_monitor_sessions_saleDate_idx" ON "auction_monitor_sessions"("saleDate");
CREATE INDEX "auction_monitor_sessions_scheduledAt_idx" ON "auction_monitor_sessions"("scheduledAt");
CREATE INDEX "auction_monitor_sessions_calendarEntryId_idx" ON "auction_monitor_sessions"("calendarEntryId");

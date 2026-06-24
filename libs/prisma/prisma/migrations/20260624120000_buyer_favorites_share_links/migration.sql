-- Migration: 20260624120000_buyer_favorites_share_links
--
-- Creates the buyer_favorites_share_links table.
-- Additive only — no existing rows are touched.
-- Rollback: DROP TABLE buyer_favorites_share_links;

CREATE TABLE "buyer_favorites_share_links" (
    "id"             TEXT NOT NULL,
    "token"          TEXT NOT NULL,
    "buyerId"        TEXT NOT NULL,
    "tenantId"       TEXT,
    "expiresAt"      TIMESTAMP(3),
    "revoked"        BOOLEAN NOT NULL DEFAULT false,
    "createdBy"      TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAccessedAt" TIMESTAMP(3),
    "shortUrlCode"   TEXT,

    CONSTRAINT "buyer_favorites_share_links_pkey" PRIMARY KEY ("id")
);

-- Unique token constraint (used for O(1) lookups on the public endpoint).
CREATE UNIQUE INDEX "buyer_favorites_share_links_token_key"
    ON "buyer_favorites_share_links"("token");

-- Indexes: by buyer (staff list view) and by token (public resolve).
CREATE INDEX "buyer_favorites_share_links_buyerId_idx"
    ON "buyer_favorites_share_links"("buyerId");

CREATE INDEX "buyer_favorites_share_links_token_idx"
    ON "buyer_favorites_share_links"("token");

-- FK → buyers (cascade on buyer delete).
ALTER TABLE "buyer_favorites_share_links"
    ADD CONSTRAINT "buyer_favorites_share_links_buyerId_fkey"
    FOREIGN KEY ("buyerId") REFERENCES "buyers"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

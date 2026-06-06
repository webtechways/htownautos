-- Public read-only share links for inspections. Each row carries a
-- single URL-safe token bound to one inspection. Public endpoint
-- resolves token → inspection and double-checks the VIN from the URL.

CREATE TABLE "inspection_share_links" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "inspectionId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAccessedAt" TIMESTAMP(3),

    CONSTRAINT "inspection_share_links_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "inspection_share_links_token_key" ON "inspection_share_links"("token");
CREATE INDEX "inspection_share_links_inspectionId_idx" ON "inspection_share_links"("inspectionId");
CREATE INDEX "inspection_share_links_revoked_idx" ON "inspection_share_links"("revoked");

ALTER TABLE "inspection_share_links"
  ADD CONSTRAINT "inspection_share_links_inspectionId_fkey"
  FOREIGN KEY ("inspectionId") REFERENCES "vehicle_inspections"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

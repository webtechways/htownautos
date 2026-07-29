-- Learned Copart title-code → category mapping, populated by staff from the UI.
-- CreateTable
CREATE TABLE "auction_title_type_mappings" (
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "assignedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auction_title_type_mappings_pkey" PRIMARY KEY ("code")
);

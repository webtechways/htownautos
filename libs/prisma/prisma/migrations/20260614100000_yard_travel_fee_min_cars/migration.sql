-- AddColumn travelFeeCents to yards
-- Per-yard travel/transport fee in cents. Default 5000 = $50.
-- Safe additive: ADD COLUMN with default; never touches existing rows destructively.
ALTER TABLE "yards" ADD COLUMN "travelFeeCents" INTEGER NOT NULL DEFAULT 5000;

-- AddColumn minCars to yards
-- Minimum number of cars required per inspection visit to this yard. Default 1.
ALTER TABLE "yards" ADD COLUMN "minCars" INTEGER NOT NULL DEFAULT 1;

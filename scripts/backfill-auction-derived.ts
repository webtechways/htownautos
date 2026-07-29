/**
 * One-time backfill: recompute the derived auction filter attributes
 * (sellerCategory / engineSizeL / locationLat / locationLng) for ALL existing
 * Copart listings, using the same shared helpers the live import uses.
 *
 * Run once after applying the 20260728120000_auction_filter_fields migration:
 *   npx ts-node scripts/backfill-auction-derived.ts
 *
 * After this completes, reindex OpenSearch so the CRM picks up the new fields
 * (the sync's syncAllCopart / the recreate-index flow).
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import {
  deriveSellerCategory,
  parseEngineSizeL,
  geocodeZip,
} from '@htownautos/common';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const BATCH = 2000;

async function main() {
  let cursor: bigint | null = null;
  let processed = 0;

  for (;;) {
    const rows = await prisma.auctionListing.findMany({
      where: {
        auctionName: 'Copart',
        ...(cursor != null ? { lotNumber: { gt: cursor } } : {}),
      },
      select: {
        lotNumber: true,
        engine: true,
        rentals: true,
        sellerName: true,
        locationZip: true,
      },
      take: BATCH,
      orderBy: { lotNumber: 'asc' },
    });
    if (rows.length === 0) break;

    await prisma.$transaction(
      rows.map((r) => {
        const geo = geocodeZip(r.locationZip);
        const engineSizeL = parseEngineSizeL(r.engine);
        return prisma.auctionListing.update({
          where: { lotNumber: r.lotNumber },
          data: {
            sellerCategory: deriveSellerCategory(r.rentals, r.sellerName),
            engineSizeL: engineSizeL != null ? engineSizeL : null,
            locationLat: geo ? geo.lat : null,
            locationLng: geo ? geo.lon : null,
          },
        });
      }),
    );

    processed += rows.length;
    cursor = rows[rows.length - 1].lotNumber;
    console.log(`Backfilled ${processed} lots (cursor=${cursor})`);
    if (rows.length < BATCH) break;
  }

  console.log(`Done. Backfilled ${processed} auction listings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

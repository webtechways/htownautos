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
import {
  deriveSellerCategory,
  parseEngineSizeL,
  geocodeZip,
} from '@htownautos/common';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const BATCH = 5000;

// One bulk `UPDATE ... FROM (VALUES ...)` per batch — avoids Prisma's 5s
// interactive-transaction timeout that a per-row update loop hits at scale.
async function main() {
  let processed = 0;

  for (;;) {
    const { rows } = await pool.query<{
      lotNumber: string;
      engine: string | null;
      rentals: string | null;
      sellerName: string | null;
      locationZip: string | null;
    }>(
      `SELECT "lotNumber", "engine", "rentals", "sellerName", "locationZip"
       FROM auction_listings
       WHERE "auctionName" = 'Copart' AND "sellerCategory" IS NULL
       LIMIT ${BATCH}`,
    );
    if (rows.length === 0) break;

    const values: string[] = [];
    const params: Array<string | number | null> = [];
    let i = 1;
    for (const r of rows) {
      const geo = geocodeZip(r.locationZip);
      const engineSizeL = parseEngineSizeL(r.engine);
      params.push(
        r.lotNumber,
        deriveSellerCategory(r.rentals, r.sellerName),
        engineSizeL,
        geo ? geo.lat : null,
        geo ? geo.lon : null,
      );
      values.push(
        `($${i}::bigint,$${i + 1},$${i + 2}::numeric,$${i + 3}::double precision,$${i + 4}::double precision)`,
      );
      i += 5;
    }

    await pool.query(
      `UPDATE auction_listings a
       SET "sellerCategory" = v.cat, "engineSizeL" = v.el,
           "locationLat" = v.lat, "locationLng" = v.lng
       FROM (VALUES ${values.join(',')}) AS v("lotNumber", cat, el, lat, lng)
       WHERE a."lotNumber" = v."lotNumber"`,
      params,
    );

    processed += rows.length;
    console.log(`Backfilled ${processed} lots`);
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
    await pool.end();
  });

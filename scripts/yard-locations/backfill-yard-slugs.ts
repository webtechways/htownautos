/**
 * One-off backfill: enrich existing `yards` rows with the public Copart catalog
 * data (slug + address/city/state/zip/country/lat/lon/phone) from the
 * AutoBidMaster locations dump. Matches by (source = COPART, yardNumber = id)
 * — the JSON `id` equals the Copart yard number already seeded in the DB (see
 * migration 20260604190000_seed_copart_yards). lat/lon is used only as a
 * loose fallback because the seed coords are 2-decimal approximations.
 *
 *   npx tsx scripts/yard-locations/backfill-yard-slugs.ts          # apply
 *   npx tsx scripts/yard-locations/backfill-yard-slugs.ts --dry    # preview
 *
 * Gap-fill semantics ("añadir lo que le falte"): existing NON-EMPTY values are
 * kept — every column is written with COALESCE(NULLIF(existing,''), new), so we
 * only fill blanks. `slug` is the new column and is always filled. Yards with no
 * matching row are INSERTed so all 217 locations end up present.
 *
 * Requires DATABASE_URL (loaded from .env via dotenv/config).
 */
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';

interface Loc {
  catalogSourceId: number | null;
  id: number | null;
  name: string;
  slug: string | null;
  address: string | null;
  city: string | null;
  stateCode: string | null;
  stateName: string | null;
  countryCode: string | null; // "USA" | "CAN"
  zip: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
}

const DRY = process.argv.includes('--dry');

function loadLocations(): Loc[] {
  const file = path.join(__dirname, 'copart-locations.json');
  if (!fs.existsSync(file)) {
    throw new Error(`Missing ${file}. Run parse-yard-locations.ts or copy copart-locations.json here.`);
  }
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  const rows: Loc[] = Array.isArray(parsed) ? parsed : parsed.locations;
  if (!Array.isArray(rows)) throw new Error('Could not find a locations array in the JSON.');
  return rows;
}

// "USA" -> "US", "CAN" -> "CA"; anything else passed through untouched.
function country2(code: string | null): string | null {
  if (!code) return null;
  const m: Record<string, string> = { USA: 'US', CAN: 'CA' };
  return m[code] ?? code;
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const locations = loadLocations();

  let updated = 0;
  let created = 0;
  let slugFilled = 0;
  let skipped = 0;
  const problems: string[] = [];

  try {
    for (const l of locations) {
      if (l.id == null) {
        problems.push(`SKIP (no id): ${l.name}`);
        skipped++;
        continue;
      }
      const country = country2(l.countryCode);

      // 1) Find the target yard: primary by (COPART, yardNumber=id),
      //    fallback by loose lat/lon (~0.15° ≈ 15km, covers the rounded seed).
      const found = await pool.query<{ id: string; slug: string | null }>(
        `SELECT id, slug FROM yards WHERE source = 'COPART' AND "yardNumber" = $1 LIMIT 1`,
        [l.id],
      );
      let yardId = found.rows[0]?.id ?? null;
      let hadSlug = found.rows[0]?.slug != null && found.rows[0]?.slug !== '';

      if (!yardId && l.latitude != null && l.longitude != null) {
        const near = await pool.query<{ id: string; slug: string | null }>(
          `SELECT id, slug FROM yards
             WHERE source = 'COPART'
               AND latitude  IS NOT NULL AND longitude IS NOT NULL
               AND abs(latitude  - $1) < 0.15
               AND abs(longitude - $2) < 0.15
             ORDER BY abs(latitude - $1) + abs(longitude - $2) ASC
             LIMIT 1`,
          [l.latitude, l.longitude],
        );
        if (near.rows[0]) {
          yardId = near.rows[0].id;
          hadSlug = near.rows[0].slug != null && near.rows[0].slug !== '';
          problems.push(`MATCHED BY GEO (no yardNumber ${l.id}): ${l.name}`);
        }
      }

      if (yardId) {
        // 2) Gap-fill: keep existing non-empty values, fill only blanks.
        if (!DRY) {
          await pool.query(
            `UPDATE yards SET
               slug      = COALESCE(NULLIF(slug,''),      $2),
               address   = COALESCE(NULLIF(address,''),   $3),
               city      = COALESCE(NULLIF(city,''),      $4),
               state     = COALESCE(NULLIF(state,''),     $5),
               zip       = COALESCE(NULLIF(zip,''),       $6),
               country   = COALESCE(NULLIF(country,''),   $7),
               latitude  = COALESCE(latitude,             $8),
               longitude = COALESCE(longitude,            $9),
               phone     = COALESCE(NULLIF(phone,''),     $10),
               "updatedAt" = NOW()
             WHERE id = $1`,
            [yardId, l.slug, l.address, l.city, l.stateCode, l.zip, country, l.latitude, l.longitude, l.phone],
          );
        }
        updated++;
        if (!hadSlug && l.slug) slugFilled++;
      } else {
        // 3) No existing yard — insert it so all locations are present.
        if (!DRY) {
          await pool.query(
            `INSERT INTO yards
               (id, source, "yardNumber", name, slug, address, city, state, zip, country,
                latitude, longitude, phone, "physicalInspectionAvailable", "isActive", "createdAt", "updatedAt")
             VALUES
               (gen_random_uuid(), 'COPART', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false, true, NOW(), NOW())
             ON CONFLICT (source, "yardNumber") DO NOTHING`,
            [l.id, l.name, l.slug, l.address, l.city, l.stateCode, l.zip, country, l.latitude, l.longitude, l.phone],
          );
        }
        created++;
        if (l.slug) slugFilled++;
        problems.push(`CREATED (no existing yard #${l.id}): ${l.name}`);
      }
    }

    console.log(`\n${DRY ? '[DRY RUN] ' : ''}Yard slug/location backfill complete.`);
    console.log(`  locations processed: ${locations.length}`);
    console.log(`  yards updated:       ${updated}`);
    console.log(`  yards created:       ${created}`);
    console.log(`  slugs newly filled:  ${slugFilled}`);
    console.log(`  skipped (no id):     ${skipped}`);
    if (problems.length) {
      console.log(`\nNotes (${problems.length}):`);
      for (const p of problems) console.log('  - ' + p);
    }
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error('Backfill failed:', e);
  process.exit(1);
});

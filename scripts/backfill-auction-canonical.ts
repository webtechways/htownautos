/**
 * One-off backfill: recompute canonical make/model/trim/color for ALL auction
 * listings using the deterministic normalization + the staff alias overrides in
 * `auction_value_aliases`. The migration already seeds the deterministic values,
 * and setAlias() re-canonicalizes affected rows immediately — run this only to
 * re-apply everything (e.g. after bulk alias edits or a normalization change):
 *
 *   npx ts-node scripts/backfill-auction-canonical.ts
 *
 * Then reindex OpenSearch so the sidebar picks up the canonical fields.
 */
import 'dotenv/config';
import { Pool } from 'pg';
import { canonicalize, type AliasMap } from '@htownautos/common';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const BATCH = 5000;

async function loadAliasMaps(): Promise<{
  make: AliasMap;
  model: AliasMap;
  trim: AliasMap;
  color: AliasMap;
}> {
  const { rows } = await pool.query<{
    field: string;
    aliasKey: string;
    canonical: string;
  }>(`SELECT "field", "aliasKey", "canonical" FROM auction_value_aliases`);
  const maps = { make: {}, model: {}, trim: {}, color: {} } as Record<
    string,
    AliasMap
  >;
  for (const r of rows) {
    if (maps[r.field]) maps[r.field][r.aliasKey] = r.canonical;
  }
  return maps as { make: AliasMap; model: AliasMap; trim: AliasMap; color: AliasMap };
}

async function main() {
  const maps = await loadAliasMaps();
  let processed = 0;
  let cursor = '0'; // lotNumber cursor (bigint as string)

  for (;;) {
    const { rows } = await pool.query<{
      lotNumber: string;
      make: string | null;
      modelGroup: string | null;
      trim: string | null;
      color: string | null;
    }>(
      `SELECT "lotNumber", "make", "modelGroup", "trim", "color"
       FROM auction_listings
       WHERE "lotNumber" > $1
       ORDER BY "lotNumber" ASC
       LIMIT ${BATCH}`,
      [cursor],
    );
    if (rows.length === 0) break;

    const values: string[] = [];
    const params: Array<string | null> = [];
    let i = 1;
    for (const r of rows) {
      params.push(
        r.lotNumber,
        canonicalize(r.make, maps.make) ?? '(UNKNOWN)',
        canonicalize(r.modelGroup, maps.model),
        canonicalize(r.trim, maps.trim),
        canonicalize(r.color, maps.color),
      );
      values.push(
        `($${i}::bigint,$${i + 1}::text,$${i + 2}::text,$${i + 3}::text,$${i + 4}::text)`,
      );
      i += 5;
    }

    await pool.query(
      `UPDATE auction_listings a
       SET "makeCanonical" = v.mk, "modelCanonical" = v.mo,
           "trimCanonical" = v.tr, "colorCanonical" = v.co
       FROM (VALUES ${values.join(',')}) AS v("lotNumber", mk, mo, tr, co)
       WHERE a."lotNumber" = v."lotNumber"`,
      params,
    );

    cursor = rows[rows.length - 1].lotNumber;
    processed += rows.length;
    console.log(`Canonicalized ${processed} lots`);
    if (rows.length < BATCH) break;
  }

  console.log(`Done. Canonicalized ${processed} auction listings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });

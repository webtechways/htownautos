/**
 * Parse the AutoBidMaster `/search/locations` dump into a clean yard-location
 * file — WITHOUT touching the database. Reads either the full HTML page (with the
 * inline `window.__REACT_QUERY_STATE__`) or a raw JSON blob, extracts the
 * `locations` array, and writes normalized JSON + CSV next to the input.
 *
 *   npx tsx scripts/yard-locations/parse-yard-locations.ts <input-file> [out-basename]
 *
 * Defaults: input = scripts/yard-locations/autobidmaster-raw.txt,
 *           output = scripts/yard-locations/yard-locations.{json,csv}
 *
 * The extractor is tolerant of a truncated tail: it parses one location object
 * at a time and simply drops an incomplete final one, so a partial paste still
 * yields every complete entry. De-dupes by slug (fallback catalogSourceId).
 */
import * as fs from 'fs';
import * as path from 'path';

interface RawLocation {
  catalogSourceId?: number;
  id?: number;
  name?: string;
  slug?: string;
  inventoryAuction?: string;
  address?: string;
  city?: string;
  stateSlug?: string;
  stateCode?: string;
  stateName?: string;
  countryCode?: string;
  countrySlug?: string;
  zip?: string;
  phone?: string;
  fax?: string;
  physical?: boolean;
  ncs?: boolean;
  auxLocation?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  officeHours?: string;
}

interface CleanLocation {
  name: string;
  matchKey: string; // UPPERCASE(name) — for later name-based yard matching
  slug: string | null;
  auction: string | null;
  catalogSourceId: number | null;
  id: number | null;
  address: string | null;
  city: string | null;
  stateCode: string | null;
  stateName: string | null;
  countryCode: string | null;
  zip: string | null;
  phone: string | null;
  fax: string | null;
  latitude: number | null;
  longitude: number | null;
  physical: boolean;
  ncs: boolean;
  auxLocation: boolean;
  officeHours: string | null;
}

/**
 * Walk `raw` from the first `"locations":[` and yield each top-level `{...}`
 * object, JSON.parsing them individually. String-aware brace matching; stops at
 * the array's closing `]` or when the input ends (dropping a truncated tail).
 */
function extractLocations(raw: string): RawLocation[] {
  const marker = '"locations":[';
  const start = raw.indexOf(marker);
  if (start === -1) {
    // Maybe the input is already a bare JSON array of locations.
    try {
      const arr = JSON.parse(raw.trim());
      if (Array.isArray(arr)) return arr as RawLocation[];
    } catch {
      /* fall through */
    }
    throw new Error('Could not find a "locations":[ array in the input.');
  }

  const out: RawLocation[] = [];
  let i = raw.indexOf('[', start);
  let depth = 0;
  let objStart = -1;
  let inStr = false;
  let esc = false;

  for (; i < raw.length; i++) {
    const ch = raw[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === '{') {
      if (depth === 0) objStart = i;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0 && objStart !== -1) {
        const chunk = raw.slice(objStart, i + 1);
        try {
          out.push(JSON.parse(chunk) as RawLocation);
        } catch {
          /* skip malformed object */
        }
        objStart = -1;
      }
    } else if (ch === ']' && depth === 0) {
      break; // end of the locations array
    }
  }
  return out;
}

function clean(l: RawLocation): CleanLocation | null {
  const name = (l.name ?? '').trim();
  if (!name) return null;
  return {
    name,
    matchKey: name.replace(/\s+/g, ' ').trim().toUpperCase(),
    slug: l.slug ?? null,
    auction: l.inventoryAuction ?? null,
    catalogSourceId: l.catalogSourceId ?? null,
    id: l.id ?? null,
    address: l.address ?? null,
    city: l.city ?? null,
    stateCode: l.stateCode ?? null,
    stateName: l.stateName ?? null,
    countryCode: l.countryCode ?? null,
    zip: l.zip ?? null,
    phone: l.phone ?? null,
    fax: l.fax ?? null,
    latitude: l.latitude ?? null,
    longitude: l.longitude ?? null,
    physical: !!l.physical,
    ncs: !!l.ncs,
    auxLocation: !!l.auxLocation,
    officeHours: l.officeHours ?? null,
  };
}

function toCsv(rows: CleanLocation[]): string {
  const cols: (keyof CleanLocation)[] = [
    'name', 'matchKey', 'slug', 'auction', 'catalogSourceId', 'id', 'address',
    'city', 'stateCode', 'stateName', 'countryCode', 'zip', 'phone', 'fax',
    'latitude', 'longitude', 'physical', 'ncs', 'auxLocation', 'officeHours',
  ];
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [cols.join(',')];
  for (const r of rows) lines.push(cols.map((c) => esc(r[c])).join(','));
  return lines.join('\n') + '\n';
}

function main() {
  const here = __dirname;
  const input = process.argv[2] || path.join(here, 'autobidmaster-raw.txt');
  const outBase = process.argv[3] || path.join(here, 'yard-locations');

  if (!fs.existsSync(input)) {
    console.error(`Input not found: ${input}`);
    console.error('Save the AutoBidMaster page/JSON there, or pass a path as arg 1.');
    process.exit(1);
  }

  const raw = fs.readFileSync(input, 'utf8');
  const rawLocations = extractLocations(raw);

  // De-dupe by slug (fallback catalogSourceId, then matchKey).
  const seen = new Set<string>();
  const rows: CleanLocation[] = [];
  for (const rl of rawLocations) {
    const c = clean(rl);
    if (!c) continue;
    const key = c.slug || (c.catalogSourceId != null ? `id:${c.catalogSourceId}` : c.matchKey);
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(c);
  }
  rows.sort((a, b) => a.name.localeCompare(b.name));

  fs.writeFileSync(`${outBase}.json`, JSON.stringify(rows, null, 2) + '\n');
  fs.writeFileSync(`${outBase}.csv`, toCsv(rows));

  const withGeo = rows.filter((r) => r.latitude != null && r.longitude != null).length;
  const physical = rows.filter((r) => r.physical).length;
  console.log(`Parsed ${rawLocations.length} raw → ${rows.length} unique locations.`);
  console.log(`  with city/state: ${rows.filter((r) => r.city && r.stateCode).length}`);
  console.log(`  with geo:        ${withGeo}`);
  console.log(`  physical=true:   ${physical}`);
  console.log(`Wrote ${outBase}.json and ${outBase}.csv`);
}

main();

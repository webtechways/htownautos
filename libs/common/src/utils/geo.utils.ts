/**
 * ZIP-code geocoding + distance helpers backed by the `zipcodes` package
 * (bundled US ZIP centroid dataset — no network/API cost). Used for the
 * "Search near ZIP + radius" filter on both the CRM and the public portal.
 */

// The package has no bundled types; require lazily so a missing install never
// crashes module load (geocoding just returns null and the filter is skipped).
type ZipRecord = { latitude: number; longitude: number } | undefined;
interface ZipcodesLib {
  lookup: (zip: string) => ZipRecord;
}

let lib: ZipcodesLib | null | undefined;
function getLib(): ZipcodesLib | null {
  if (lib === undefined) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      lib = require('zipcodes') as ZipcodesLib;
    } catch {
      lib = null;
    }
  }
  return lib;
}

export interface LatLng {
  lat: number;
  lon: number;
}

/** Resolve a US ZIP code to its centroid coordinates, or null if unknown. */
export function geocodeZip(zip?: string | null): LatLng | null {
  if (!zip) return null;
  const clean = zip.trim().slice(0, 5);
  if (!/^\d{5}$/.test(clean)) return null;
  const rec = getLib()?.lookup(clean);
  if (!rec || typeof rec.latitude !== 'number' || typeof rec.longitude !== 'number') {
    return null;
  }
  return { lat: rec.latitude, lon: rec.longitude };
}

const EARTH_RADIUS_MILES = 3958.8;

/** Great-circle distance between two coordinates, in miles. */
export function haversineMiles(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}

/**
 * Latitude/longitude deltas (degrees) that bound a radius in miles — used to
 * build a cheap bounding-box pre-filter before an exact haversine refine.
 */
export function boundingBox(center: LatLng, radiusMiles: number): {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
} {
  const latDelta = radiusMiles / 69; // ~69 miles per degree latitude
  const lonDelta = radiusMiles / (69 * Math.max(Math.cos((center.lat * Math.PI) / 180), 0.01));
  return {
    minLat: center.lat - latDelta,
    maxLat: center.lat + latDelta,
    minLon: center.lon - lonDelta,
    maxLon: center.lon + lonDelta,
  };
}

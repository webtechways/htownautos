import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Pool, PoolClient } from 'pg';
import { Readable } from 'stream';
import csvParser = require('csv-parser');
import { PrismaService } from '@htownautos/prisma';
import { AuctionSyncService } from '@htownautos/opensearch';
import { WantedMatchNotifierService } from './wanted-match-notifier.service';

// Maps CSV header names → staging column names
const CSV_HEADER_MAP: Record<string, string> = {
  'Id':                          'copartId',
  'Yard number':                 'yardNumber',
  'Yard name':                   'yardName',
  'Sale Date M/D/CY':            'saleDate',
  'Day of Week':                 'dayOfWeek',
  'Sale time (HHMM)':            'saleTime',
  'Time Zone':                   'timeZone',
  'Item#':                       'itemNumber',
  'Lot number':                  'lotNumber',
  'Vehicle Type':                'vehicleType',
  'Year':                        'year',
  'Make':                        'make',
  'Model Group':                 'modelGroup',
  'Model Detail':                'modelDetail',
  'Body Style':                  'bodyStyle',
  'Color':                       'color',
  'Damage Description':          'damageDescription',
  'Secondary Damage':            'secondaryDamage',
  'Sale Title State':            'saleTitleState',
  'Sale Title Type':             'saleTitleType',
  'Has Keys-Yes or No':          'hasKeys',
  'Lot Cond. Code':              'lotCondCode',
  'VIN':                         'vin',
  'Odometer':                    'odometer',
  'Odometer Brand':              'odometerBrand',
  'Est. Retail Value':           'estRetailValue',
  'Repair cost':                 'repairCost',
  'Engine':                      'engine',
  'Drive':                       'drive',
  'Transmission':                'transmission',
  'Fuel Type':                   'fuelType',
  'Cylinders':                   'cylinders',
  'Runs/Drives':                 'runsDrives',
  'Sale Status':                 'saleStatus',
  'High Bid =non-vix,Sealed=Vix':'highBid',
  'Special Note':                'specialNote',
  'Location city':               'locationCity',
  'Location state':              'locationState',
  'Location ZIP':                'locationZip',
  'Location country':            'locationCountry',
  'Currency Code':               'currencyCode',
  'Image Thumbnail':             'imageThumbnail',
  'Create Date/Time':            'createDateTime',
  'Grid/Row':                    'gridRow',
  'Make-an-Offer Eligible':      'makeOfferEligible',
  'Buy-It-Now Price':            'buyItNowPrice',
  'Image URL':                   'imageUrl',
  'Trim':                        'trim',
  'Last Updated Time':           'lastUpdatedTime',
  'Rentals':                     'rentals',
  'Wholesale':                   'wholesale',
  'Seller Name':                 'sellerName',
  'Offsite Address1':            'offsiteAddress1',
  'Offsite State':               'offsiteState',
  'Offsite City':                'offsiteCity',
  'Offsite Zip':                 'offsiteZip',
  'Sale Light':                  'saleLight',
  'AutoGrade':                   'autoGrade',
  'Announcements':               'announcements',
};

const STAGING_COLUMNS = Object.values(CSV_HEADER_MAP);
const BATCH_SIZE = 500;

// ── Resilience tuning knobs ─────────────────────────────────────────────
const DOWNLOAD_TIMEOUT_MS = 90_000;          // 90s per attempt
const DOWNLOAD_MAX_ATTEMPTS = 4;             // total tries (1 + 3 retries)
const DOWNLOAD_BACKOFF_BASE_MS = 2_000;      // 2s, then 4s, 8s, 16s…
const MIN_ROWS_SANITY = 1_000;               // feed below this is clearly broken
const STALENESS_THRESHOLD_HOURS = 6;         // unseen lots become "stale" after 6h
const REQUIRED_HEADERS = ['lotNumber', 'vin', 'make', 'year'] as const;

// Above this many brand-new lots in a single run we skip wanted-match
// notifications: it's almost certainly an initial load or a recreate, and
// matching/notifying tens of thousands of lots would flood the notification
// center. Normal incremental runs add at most a few hundred new lots.
const NEW_LOT_NOTIFY_LIMIT = 5_000;

/** pg_try_advisory_lock key — constant hash of "copart_sync". */
const LOCK_KEY_SQL = `hashtext('copart_sync')`;

interface SyncMetrics {
  bytesDownloaded: number | null;
  rowsParsed: number;
  rowsValid: number;
  rowsInvalid: number;
  rowsUpserted: number;
  rowsStaleMarked: number;
  rowsIndexed: number;
  rowsIndexFailed: number;
}

function makeEmptyMetrics(): SyncMetrics {
  return {
    bytesDownloaded: null,
    rowsParsed: 0,
    rowsValid: 0,
    rowsInvalid: 0,
    rowsUpserted: 0,
    rowsStaleMarked: 0,
    rowsIndexed: 0,
    rowsIndexFailed: 0,
  };
}

@Injectable()
export class CopartImportService {
  private readonly logger = new Logger(CopartImportService.name);
  private readonly pool: Pool;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly syncService: AuctionSyncService,
    private readonly wantedMatchNotifier: WantedMatchNotifierService,
  ) {
    this.pool = new Pool({
      connectionString: this.configService.get<string>('DATABASE_URL'),
    });
  }

  @Cron('9,39 5-22 * * *')
  async handleCopartSyncCron(): Promise<void> {
    await this.runSync();
  }

  /**
   * Top-level orchestrator. Acquires a DB-level advisory lock so two
   * containers (or a manual trigger concurrent with the cron) can't race.
   * Records a SyncRun audit row for every invocation.
   */
  async runSync(): Promise<void> {
    const lockClient = await this.pool.connect();
    let gotLock = false;
    let syncRunId: string | null = null;

    try {
      // 1. Try to acquire the advisory lock (non-blocking)
      const lockRes = await lockClient.query<{ got: boolean }>(
        `SELECT pg_try_advisory_lock(${LOCK_KEY_SQL}) AS got`,
      );
      gotLock = lockRes.rows[0]?.got === true;

      if (!gotLock) {
        this.logger.warn('Copart sync lock held by another worker; logging skipped run');
        await this.prisma.syncRun.create({
          data: {
            source: 'copart',
            status: 'skipped',
            finishedAt: new Date(),
            durationMs: 0,
          },
        });
        return;
      }

      // 2. Open the SyncRun row in "running" state
      const runRow = await this.prisma.syncRun.create({
        data: { source: 'copart', status: 'running' },
      });
      syncRunId = runRow.id;
      const startTs = Date.now();
      const syncStart = runRow.startedAt;

      this.logger.log(`Starting Copart sync (runId=${syncRunId})`);
      const metrics = makeEmptyMetrics();

      try {
        await this.importFromCopartUrl(metrics, syncStart);

        await this.prisma.syncRun.update({
          where: { id: syncRunId },
          data: {
            status: 'success',
            finishedAt: new Date(),
            durationMs: Date.now() - startTs,
            ...metrics,
          },
        });
        this.logger.log(
          `Copart sync OK in ${Date.now() - startTs}ms — parsed=${metrics.rowsParsed}, ` +
          `valid=${metrics.rowsValid}, invalid=${metrics.rowsInvalid}, ` +
          `upserted=${metrics.rowsUpserted}, stale=${metrics.rowsStaleMarked}, ` +
          `indexed=${metrics.rowsIndexed}/${metrics.rowsIndexed + metrics.rowsIndexFailed}`,
        );
      } catch (error) {
        const err = error as Error;
        this.logger.error(`Copart sync failed (runId=${syncRunId})`, err?.stack ?? err?.message);
        await this.prisma.syncRun.update({
          where: { id: syncRunId },
          data: {
            status: 'failed',
            finishedAt: new Date(),
            durationMs: Date.now() - startTs,
            error: (err?.message || 'unknown').slice(0, 4000),
            ...metrics,
          },
        });
      }
    } finally {
      if (gotLock) {
        await lockClient
          .query(`SELECT pg_advisory_unlock(${LOCK_KEY_SQL})`)
          .catch((e: Error) => this.logger.warn(`Failed to release lock: ${e.message}`));
      }
      lockClient.release();
    }
  }

  /**
   * The actual sync pipeline. Mutates `metrics` as it progresses so that
   * even a partial failure leaves trace in the SyncRun row.
   */
  private async importFromCopartUrl(
    metrics: SyncMetrics,
    syncStart: Date,
  ): Promise<void> {
    const url = this.configService.get<string>('COPART_DATA');
    if (!url) throw new Error('COPART_DATA environment variable is not set');

    // Step 1: Download CSV (retry with backoff)
    const csvBuffer = await this.downloadCsvWithRetry(url);
    metrics.bytesDownloaded = csvBuffer.length;
    this.logger.log(`Downloaded ${csvBuffer.length} bytes from Copart`);

    // Step 2: Parse CSV
    const rows = await this.parseCsv(csvBuffer);
    metrics.rowsParsed = rows.length;
    this.logger.log(`Parsed ${rows.length} rows`);

    // Step 3: Sanity-check the parsed result — refuse to truncate if feed looks wrong
    this.assertFeedSanity(rows);

    // Step 4: Filter out malformed rows (bad lotNumber, missing required fields)
    const { valid, invalid } = this.validateRows(rows);
    metrics.rowsValid = valid.length;
    metrics.rowsInvalid = invalid;
    if (invalid > 0) {
      this.logger.warn(`Skipped ${invalid} invalid rows (kept ${valid.length})`);
    }

    // Step 5: Truncate staging (only after we know the feed is OK)
    await this.truncateStaging();

    // Step 6: Batch INSERT into staging
    await this.insertIntoStaging(valid);

    // Step 7: Staging → auction_listings (upsert + mark lastSeenAt)
    const { total: upserted, newLotNumbers } =
      await this.mapStagingToAuctionListings();
    metrics.rowsUpserted = upserted;
    this.logger.log(
      `Upserted ${upserted} into auction_listings (${newLotNumbers.length} brand-new lots)`,
    );

    // Step 7b: Notify staff about brand-new lots that match a buyer's wanted
    // list. Guarded against bulk/initial loads (see NEW_LOT_NOTIFY_LIMIT) and
    // wrapped so a notification failure never aborts the sync.
    if (newLotNumbers.length === 0) {
      // nothing new this run
    } else if (newLotNumbers.length > NEW_LOT_NOTIFY_LIMIT) {
      this.logger.warn(
        `Skipping wanted-match notifications: ${newLotNumbers.length} new lots ` +
          `exceeds threshold of ${NEW_LOT_NOTIFY_LIMIT} (treating as bulk/initial load)`,
      );
    } else {
      try {
        const created = await this.wantedMatchNotifier.notifyNewListings(
          newLotNumbers,
        );
        if (created > 0) {
          this.logger.log(`Created ${created} wanted-match notification(s)`);
        }
      } catch (err) {
        const e = err as Error;
        this.logger.error(
          `Wanted-match notification step failed (non-fatal): ${e?.message}`,
          e?.stack,
        );
      }
    }

    // Step 8: Mark as stale any listings not seen in this run (after the grace period)
    metrics.rowsStaleMarked = await this.markStaleListings();
    if (metrics.rowsStaleMarked > 0) {
      this.logger.log(`Marked ${metrics.rowsStaleMarked} listings as stale`);
    }

    // Step 9: Truncate staging
    await this.truncateStaging();

    // Step 10: Reindex OpenSearch
    const { success, failed } = await this.syncService.syncAllCopart();
    metrics.rowsIndexed = success;
    metrics.rowsIndexFailed = failed;
    this.logger.log(`OpenSearch: ${success} indexed, ${failed} failed`);

    // Silence unused-param warning; kept for future signature stability.
    void syncStart;
  }

  // ────────────────────────────────────────────────────────────────────
  // Download with timeout + exponential backoff retry
  // ────────────────────────────────────────────────────────────────────

  private async downloadCsvWithRetry(url: string): Promise<Buffer> {
    let lastErr: Error | null = null;
    for (let attempt = 1; attempt <= DOWNLOAD_MAX_ATTEMPTS; attempt++) {
      try {
        return await this.downloadCsvOnce(url, attempt);
      } catch (err) {
        lastErr = err as Error;
        if (attempt === DOWNLOAD_MAX_ATTEMPTS) break;
        const backoff = DOWNLOAD_BACKOFF_BASE_MS * Math.pow(2, attempt - 1);
        this.logger.warn(
          `Download attempt ${attempt}/${DOWNLOAD_MAX_ATTEMPTS} failed: ${lastErr.message}. Retrying in ${backoff}ms`,
        );
        await this.sleep(backoff);
      }
    }
    throw new Error(
      `Copart download failed after ${DOWNLOAD_MAX_ATTEMPTS} attempts: ${lastErr?.message}`,
    );
  }

  private async downloadCsvOnce(url: string, attempt: number): Promise<Buffer> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);
    try {
      this.logger.log(`Downloading Copart CSV (attempt ${attempt}/${DOWNLOAD_MAX_ATTEMPTS})`);
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      const buf = Buffer.from(await response.arrayBuffer());
      if (buf.length === 0) {
        throw new Error('Empty response body');
      }
      return buf;
    } finally {
      clearTimeout(timeout);
    }
  }

  // ────────────────────────────────────────────────────────────────────
  // Parsing + sanity checks
  // ────────────────────────────────────────────────────────────────────

  private parseCsv(csvBuffer: Buffer): Promise<Record<string, string>[]> {
    return new Promise((resolve, reject) => {
      const rows: Record<string, string>[] = [];
      Readable.from(csvBuffer)
        .pipe(
          csvParser({
            mapHeaders: ({ header }) => CSV_HEADER_MAP[header.trim()] ?? header.trim(),
            skipLines: 0,
          }),
        )
        .on('data', (row: Record<string, string>) => rows.push(row))
        .on('end', () => resolve(rows))
        .on('error', reject);
    });
  }

  /** Aborts the run if the parsed feed looks wrong (tiny / missing columns). */
  private assertFeedSanity(rows: Record<string, string>[]): void {
    if (rows.length < MIN_ROWS_SANITY) {
      throw new Error(
        `Feed sanity failed: parsed ${rows.length} rows but expected >=${MIN_ROWS_SANITY}. ` +
          `Refusing to sync to avoid wiping good data.`,
      );
    }
    const firstRow = rows[0];
    const missing = REQUIRED_HEADERS.filter((h) => !(h in firstRow));
    if (missing.length > 0) {
      throw new Error(
        `Feed sanity failed: CSV is missing required columns: ${missing.join(', ')}. ` +
          `Copart may have changed its schema.`,
      );
    }
  }

  /** Drops rows that can't possibly upsert (invalid/missing lotNumber). */
  private validateRows(rows: Record<string, string>[]): {
    valid: Record<string, string>[];
    invalid: number;
  } {
    const valid: Record<string, string>[] = [];
    let invalid = 0;
    for (const row of rows) {
      const raw = (row['lotNumber'] ?? '').trim();
      // Positive integer only; Copart sometimes has blank or textual placeholder rows
      if (!/^\d+$/.test(raw)) {
        invalid++;
        continue;
      }
      valid.push(row);
    }
    return { valid, invalid };
  }

  // ────────────────────────────────────────────────────────────────────
  // Staging + upsert
  // ────────────────────────────────────────────────────────────────────

  private async insertIntoStaging(rows: Record<string, string>[]): Promise<number> {
    if (rows.length === 0) return 0;

    const client = await this.pool.connect();
    let total = 0;

    try {
      const colList = STAGING_COLUMNS.map((c) => `"${c}"`).join(', ');

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const valuePlaceholders: string[] = [];
        const values: (string | null)[] = [];
        let paramIdx = 1;

        for (const row of batch) {
          const rowPlaceholders = STAGING_COLUMNS.map(() => `$${paramIdx++}`);
          valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
          for (const col of STAGING_COLUMNS) {
            values.push(row[col] ?? null);
          }
        }

        const sql = `INSERT INTO copart_staging (${colList}) VALUES ${valuePlaceholders.join(', ')}`;
        await client.query(sql, values);
        total += batch.length;
      }
      this.logger.log(`Staged ${total} rows`);
    } finally {
      client.release();
    }

    return total;
  }

  private async mapStagingToAuctionListings(): Promise<{
    total: number;
    newLotNumbers: string[];
  }> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<{ lotNumber: string; inserted: boolean }>(`
        -- Sanitizes a free-form numeric string from the Copart CSV.
        --   * strips anything that isn't a digit or '.'
        --   * trims leading/trailing dots
        --   * collapses multiple dots (treats them as thousands separators)
        --   * returns NULL when the integer part exceeds max_int_digits, so
        --     the INSERT never trips Decimal(p,s) overflow on garbage values.
        CREATE OR REPLACE FUNCTION pg_temp.safe_numeric(val text, max_int_digits int DEFAULT 10) RETURNS numeric AS $$
        DECLARE
          cleaned  text;
          int_part text;
        BEGIN
          cleaned := REGEXP_REPLACE(TRIM(COALESCE(val, '')), '[^0-9.]', '', 'g');
          cleaned := REGEXP_REPLACE(cleaned, '^\\.+|\\.+$', '', 'g');
          IF cleaned ~ '\\.' AND LENGTH(cleaned) - LENGTH(REPLACE(cleaned, '.', '')) > 1 THEN
            cleaned := REPLACE(cleaned, '.', '');
          END IF;
          IF cleaned = '' THEN RETURN NULL; END IF;
          int_part := SPLIT_PART(cleaned, '.', 1);
          IF LENGTH(int_part) > max_int_digits THEN
            RETURN NULL;
          END IF;
          RETURN cleaned::numeric;
        EXCEPTION WHEN OTHERS THEN
          RETURN NULL;
        END;
        $$ LANGUAGE plpgsql;

        INSERT INTO auction_listings (
          "auctionName", "copartId", "yardNumber", "yardName", "saleDate",
          "dayOfWeek", "saleTime", "timeZone", "itemNumber", "lotNumber",
          "vehicleType", "year", "make", "modelGroup", "modelDetail",
          "bodyStyle", "color", "damageDescription", "secondaryDamage",
          "saleTitleState", "saleTitleType", "hasKeys", "lotCondCode",
          "vin", "odometer", "odometerBrand", "estRetailValue", "repairCost",
          "engine", "drive", "transmission", "fuelType", "cylinders",
          "runsDrives", "saleStatus", "highBid", "specialNote",
          "locationCity", "locationState", "locationZip", "locationCountry",
          "currencyCode", "images", "createDateTime", "gridRow",
          "makeOfferEligible", "buyItNowPrice", "trim", "lastUpdatedTime",
          "rentals", "wholesale", "sellerName", "offsiteAddress1",
          "offsiteState", "offsiteCity", "offsiteZip", "saleLight",
          "autoGrade", "announcements", "lastSeenAt", "isStale",
          "createdAt", "updatedAt"
        )
        SELECT
          'Copart',
          NULLIF(TRIM("copartId"), '')::integer,
          NULLIF(TRIM("yardNumber"), '')::integer,
          NULLIF(TRIM("yardName"), ''),
          CASE
            -- YYYYMMDD integer (e.g. 20260227)
            WHEN TRIM("saleDate") ~ '^\\d{8}$' AND TRIM("saleDate")::bigint > 20000000 THEN
              TRIM("saleDate")::integer
            -- M/D/YYYY with slashes
            WHEN TRIM("saleDate") ~ '^\\d{1,2}/\\d{1,2}/\\d{4}$' THEN
              (SPLIT_PART(TRIM("saleDate"), '/', 3) ||
               LPAD(SPLIT_PART(TRIM("saleDate"), '/', 1), 2, '0') ||
               LPAD(SPLIT_PART(TRIM("saleDate"), '/', 2), 2, '0'))::integer
            ELSE NULL
          END,
          NULLIF(TRIM("dayOfWeek"), ''),
          NULLIF(TRIM("saleTime"), ''),
          NULLIF(TRIM("timeZone"), ''),
          NULLIF(TRIM("itemNumber"), '')::integer,
          TRIM("lotNumber")::bigint,
          NULLIF(TRIM("vehicleType"), ''),
          NULLIF(TRIM("year"), '')::integer,
          NULLIF(TRIM("make"), ''),
          NULLIF(TRIM("modelGroup"), ''),
          NULLIF(TRIM("modelDetail"), ''),
          NULLIF(TRIM("bodyStyle"), ''),
          NULLIF(TRIM("color"), ''),
          NULLIF(TRIM("damageDescription"), ''),
          NULLIF(TRIM("secondaryDamage"), ''),
          NULLIF(TRIM("saleTitleState"), ''),
          NULLIF(TRIM("saleTitleType"), ''),
          NULLIF(TRIM("hasKeys"), ''),
          NULLIF(TRIM("lotCondCode"), ''),
          NULLIF(TRIM("vin"), ''),
          pg_temp.safe_numeric("odometer", 11),       -- Decimal(12,1) → 11 int digits
          NULLIF(TRIM("odometerBrand"), ''),
          pg_temp.safe_numeric("estRetailValue", 10), -- Decimal(12,2) → 10 int digits
          pg_temp.safe_numeric("repairCost", 10),     -- Decimal(12,2)
          NULLIF(TRIM("engine"), ''),
          NULLIF(TRIM("drive"), ''),
          NULLIF(TRIM("transmission"), ''),
          NULLIF(TRIM("fuelType"), ''),
          NULLIF(TRIM("cylinders"), ''),
          NULLIF(TRIM("runsDrives"), ''),
          NULLIF(TRIM("saleStatus"), ''),
          pg_temp.safe_numeric("highBid", 10),         -- Decimal(12,2)
          NULLIF(TRIM("specialNote"), ''),
          NULLIF(TRIM("locationCity"), ''),
          NULLIF(TRIM("locationState"), ''),
          NULLIF(TRIM("locationZip"), ''),
          NULLIF(TRIM("locationCountry"), ''),
          NULLIF(TRIM("currencyCode"), ''),
          NULLIF(TRIM("imageThumbnail"), ''),
          NULLIF(TRIM("createDateTime"), ''),
          NULLIF(TRIM("gridRow"), ''),
          NULLIF(TRIM("makeOfferEligible"), ''),
          pg_temp.safe_numeric("buyItNowPrice", 10),  -- Decimal(12,2)
          NULLIF(TRIM("trim"), ''),
          NOW(),
          NULLIF(TRIM("rentals"), ''),
          NULLIF(TRIM("wholesale"), ''),
          NULLIF(TRIM("sellerName"), ''),
          NULLIF(TRIM("offsiteAddress1"), ''),
          NULLIF(TRIM("offsiteState"), ''),
          NULLIF(TRIM("offsiteCity"), ''),
          NULLIF(TRIM("offsiteZip"), ''),
          NULLIF(TRIM("saleLight"), ''),
          NULLIF(TRIM("autoGrade"), ''),
          NULLIF(TRIM("announcements"), ''),
          NOW(),  -- lastSeenAt
          false,  -- isStale
          NOW(),
          NOW()
        FROM (
          SELECT DISTINCT ON (TRIM("lotNumber")) *
          FROM copart_staging
          WHERE NULLIF(TRIM("lotNumber"), '') IS NOT NULL
            AND TRIM("lotNumber") ~ '^[0-9]+$'
          ORDER BY TRIM("lotNumber"), ctid DESC
        ) AS copart_staging
        ON CONFLICT ("lotNumber") DO UPDATE SET
          "auctionName"       = EXCLUDED."auctionName",
          "yardNumber"        = EXCLUDED."yardNumber",
          "yardName"          = EXCLUDED."yardName",
          "saleDate"          = EXCLUDED."saleDate",
          "dayOfWeek"         = EXCLUDED."dayOfWeek",
          "saleTime"          = EXCLUDED."saleTime",
          "timeZone"          = EXCLUDED."timeZone",
          "itemNumber"        = EXCLUDED."itemNumber",
          "vehicleType"       = EXCLUDED."vehicleType",
          "year"              = EXCLUDED."year",
          "make"              = EXCLUDED."make",
          "modelGroup"        = EXCLUDED."modelGroup",
          "modelDetail"       = EXCLUDED."modelDetail",
          "bodyStyle"         = EXCLUDED."bodyStyle",
          "color"             = EXCLUDED."color",
          "damageDescription" = EXCLUDED."damageDescription",
          "secondaryDamage"   = EXCLUDED."secondaryDamage",
          "saleTitleState"    = EXCLUDED."saleTitleState",
          "saleTitleType"     = EXCLUDED."saleTitleType",
          "hasKeys"           = EXCLUDED."hasKeys",
          "lotCondCode"       = EXCLUDED."lotCondCode",
          "vin"               = EXCLUDED."vin",
          "odometer"          = EXCLUDED."odometer",
          "odometerBrand"     = EXCLUDED."odometerBrand",
          "estRetailValue"    = EXCLUDED."estRetailValue",
          "repairCost"        = EXCLUDED."repairCost",
          "engine"            = EXCLUDED."engine",
          "drive"             = EXCLUDED."drive",
          "transmission"      = EXCLUDED."transmission",
          "fuelType"          = EXCLUDED."fuelType",
          "cylinders"         = EXCLUDED."cylinders",
          "runsDrives"        = EXCLUDED."runsDrives",
          "saleStatus"        = EXCLUDED."saleStatus",
          "highBid"           = EXCLUDED."highBid",
          "specialNote"       = EXCLUDED."specialNote",
          "locationCity"      = EXCLUDED."locationCity",
          "locationState"     = EXCLUDED."locationState",
          "locationZip"       = EXCLUDED."locationZip",
          "locationCountry"   = EXCLUDED."locationCountry",
          "currencyCode"      = EXCLUDED."currencyCode",
          "images"            = EXCLUDED."images",
          "createDateTime"    = EXCLUDED."createDateTime",
          "gridRow"           = EXCLUDED."gridRow",
          "makeOfferEligible" = EXCLUDED."makeOfferEligible",
          "buyItNowPrice"     = EXCLUDED."buyItNowPrice",
          "trim"              = EXCLUDED."trim",
          "lastUpdatedTime"   = NOW(),
          "rentals"           = EXCLUDED."rentals",
          "wholesale"         = EXCLUDED."wholesale",
          "sellerName"        = EXCLUDED."sellerName",
          "offsiteAddress1"   = EXCLUDED."offsiteAddress1",
          "offsiteState"      = EXCLUDED."offsiteState",
          "offsiteCity"       = EXCLUDED."offsiteCity",
          "offsiteZip"        = EXCLUDED."offsiteZip",
          "saleLight"         = EXCLUDED."saleLight",
          "autoGrade"         = EXCLUDED."autoGrade",
          "announcements"     = EXCLUDED."announcements",
          -- A lot reappearing in the feed is de-facto fresh again
          "lastSeenAt"        = NOW(),
          "isStale"           = false,
          "updatedAt"         = NOW()
        -- xmax = 0 on a row touched by INSERT ... ON CONFLICT means it was
        -- freshly INSERTED (not updated): the hook for "a brand-new lot".
        RETURNING "lotNumber"::text AS "lotNumber", (xmax = 0) AS inserted
      `);

      const newLotNumbers = result.rows
        .filter((r) => r.inserted)
        .map((r) => r.lotNumber);

      return { total: result.rowCount ?? 0, newLotNumbers };
    } finally {
      client.release();
    }
  }

  /**
   * Mark as stale any Copart listing whose lastSeenAt is older than the
   * threshold (and wasn't already flagged). This catches both lots sold/
   * removed from Copart's inventory and pre-existing listings that never
   * had lastSeenAt populated (migrated data).
   */
  private async markStaleListings(): Promise<number> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `
        UPDATE auction_listings
        SET "isStale" = true, "updatedAt" = NOW()
        WHERE "auctionName" = 'Copart'
          AND "isStale" = false
          AND (
            "lastSeenAt" IS NULL
            OR "lastSeenAt" < NOW() - INTERVAL '${STALENESS_THRESHOLD_HOURS} hours'
          )
        `,
      );
      return result.rowCount ?? 0;
    } finally {
      client.release();
    }
  }

  private async truncateStaging(): Promise<void> {
    const client: PoolClient = await this.pool.connect();
    try {
      await client.query('TRUNCATE TABLE copart_staging RESTART IDENTITY');
    } finally {
      client.release();
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Pool } from 'pg';
import { Readable } from 'stream';
import csvParser = require('csv-parser');
import { AuctionSyncService } from './auction-sync.service';

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

@Injectable()
export class CopartImportService {
  private readonly logger = new Logger(CopartImportService.name);
  private readonly pool: Pool;
  private isSyncing = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly syncService: AuctionSyncService,
  ) {
    this.pool = new Pool({
      connectionString: this.configService.get<string>('DATABASE_URL'),
    });
  }

  @Cron('9,39 5-22 * * *')
  async handleCopartSyncCron(): Promise<void> {
    if (this.isSyncing) {
      this.logger.warn('Copart sync already in progress, skipping scheduled run');
      return;
    }

    this.isSyncing = true;
    try {
      this.logger.log('Starting scheduled Copart sync...');
      const result = await this.importFromCopartUrl();
      this.logger.log(
        `Scheduled Copart sync completed: ${result.staged} staged, ${result.inserted} upserted, ${result.indexed} indexed`,
      );
    } catch (error) {
      this.logger.error('Scheduled Copart sync failed', error?.stack ?? error);
    } finally {
      this.isSyncing = false;
    }
  }

  async importFromCopartUrl(): Promise<{
    downloaded: number;
    staged: number;
    inserted: number;
    indexed: number;
    failed: number;
  }> {
    const url = this.configService.get<string>('COPART_DATA');
    if (!url) throw new Error('COPART_DATA environment variable is not set');

    // Step 1: Download CSV
    this.logger.log(`Downloading Copart CSV from ${url}`);
    const csvBuffer = await this.downloadCsv(url);
    this.logger.log(`Downloaded ${csvBuffer.length} bytes`);

    // Step 2: Parse CSV → rows
    this.logger.log('Parsing CSV...');
    const rows = await this.parseCsv(csvBuffer);
    this.logger.log(`Parsed ${rows.length} rows`);

    // Step 3: Truncate staging before inserting (prevents duplicates if previous sync failed mid-way)
    this.logger.log('Truncating copart_staging before insert...');
    await this.truncateStaging();

    // Step 4: Batch INSERT into staging
    this.logger.log('Inserting into copart_staging...');
    const staged = await this.insertIntoStaging(rows);
    this.logger.log(`Staged ${staged} rows`);

    // Step 5: INSERT SELECT staging → auction_listings
    this.logger.log('Mapping staging → auction_listings...');
    const inserted = await this.mapStagingToAuctionListings();
    this.logger.log(`Upserted ${inserted} rows into auction_listings`);

    // Step 6: Truncate staging (cleanup)
    this.logger.log('Truncating copart_staging...');
    await this.truncateStaging();

    // Step 7: Reindex OpenSearch
    this.logger.log('Reindexing OpenSearch...');
    const { success, failed } = await this.syncService.syncAllCopart();
    this.logger.log(`OpenSearch: ${success} indexed, ${failed} failed`);

    return {
      downloaded: csvBuffer.length,
      staged,
      inserted,
      indexed: success,
      failed,
    };
  }

  private async downloadCsv(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download CSV: ${response.status} ${response.statusText}`);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  private parseCsv(csvBuffer: Buffer): Promise<Record<string, string>[]> {
    return new Promise((resolve, reject) => {
      const rows: Record<string, string>[] = [];
      Readable.from(csvBuffer)
        .pipe(csvParser({
          mapHeaders: ({ header }) => CSV_HEADER_MAP[header.trim()] ?? header.trim(),
          skipLines: 0,
        }))
        .on('data', (row: Record<string, string>) => rows.push(row))
        .on('end', () => resolve(rows))
        .on('error', reject);
    });
  }

  private async insertIntoStaging(rows: Record<string, string>[]): Promise<number> {
    if (rows.length === 0) return 0;

    const client = await this.pool.connect();
    let total = 0;

    try {
      const colList = STAGING_COLUMNS.map(c => `"${c}"`).join(', ');

      for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        const valuePlaceholders: string[] = [];
        const values: string[] = [];
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
        this.logger.log(`Staging progress: ${total}/${rows.length}`);
      }
    } finally {
      client.release();
    }

    return total;
  }

  private async mapStagingToAuctionListings(): Promise<number> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(`
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
          "autoGrade", "announcements", "createdAt", "updatedAt"
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
          NULLIF(REGEXP_REPLACE(TRIM("odometer"), '[^0-9.]', '', 'g'), '')::numeric,
          NULLIF(TRIM("odometerBrand"), ''),
          NULLIF(REGEXP_REPLACE(TRIM("estRetailValue"), '[^0-9.]', '', 'g'), '')::numeric,
          NULLIF(REGEXP_REPLACE(TRIM("repairCost"), '[^0-9.]', '', 'g'), '')::numeric,
          NULLIF(TRIM("engine"), ''),
          NULLIF(TRIM("drive"), ''),
          NULLIF(TRIM("transmission"), ''),
          NULLIF(TRIM("fuelType"), ''),
          NULLIF(TRIM("cylinders"), ''),
          NULLIF(TRIM("runsDrives"), ''),
          NULLIF(TRIM("saleStatus"), ''),
          NULLIF(REGEXP_REPLACE(TRIM("highBid"), '[^0-9.]', '', 'g'), '')::numeric,
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
          NULLIF(REGEXP_REPLACE(TRIM("buyItNowPrice"), '[^0-9.]', '', 'g'), '')::numeric,
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
          NOW(),
          NOW()
        FROM (
          SELECT DISTINCT ON (TRIM("lotNumber")) *
          FROM copart_staging
          WHERE NULLIF(TRIM("lotNumber"), '') IS NOT NULL
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
          "updatedAt"         = NOW()
      `);

      return result.rowCount ?? 0;
    } finally {
      client.release();
    }
  }

  private async truncateStaging(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('TRUNCATE TABLE copart_staging RESTART IDENTITY');
    } finally {
      client.release();
    }
  }
}

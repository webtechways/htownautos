"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CopartImportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopartImportService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const pg_1 = require("pg");
const csv_parse_1 = require("csv-parse");
const prisma_1 = require("@htownautos/prisma");
const opensearch_1 = require("@htownautos/opensearch");
const common_2 = require("@htownautos/common");
const wanted_match_notifier_service_1 = require("./wanted-match-notifier.service");
const CSV_HEADER_MAP = {
    'Id': 'copartId',
    'Yard number': 'yardNumber',
    'Yard name': 'yardName',
    'Sale Date M/D/CY': 'saleDate',
    'Day of Week': 'dayOfWeek',
    'Sale time (HHMM)': 'saleTime',
    'Time Zone': 'timeZone',
    'Item#': 'itemNumber',
    'Lot number': 'lotNumber',
    'Vehicle Type': 'vehicleType',
    'Year': 'year',
    'Make': 'make',
    'Model Group': 'modelGroup',
    'Model Detail': 'modelDetail',
    'Body Style': 'bodyStyle',
    'Color': 'color',
    'Damage Description': 'damageDescription',
    'Secondary Damage': 'secondaryDamage',
    'Sale Title State': 'saleTitleState',
    'Sale Title Type': 'saleTitleType',
    'Has Keys-Yes or No': 'hasKeys',
    'Lot Cond. Code': 'lotCondCode',
    'VIN': 'vin',
    'Odometer': 'odometer',
    'Odometer Brand': 'odometerBrand',
    'Est. Retail Value': 'estRetailValue',
    'Repair cost': 'repairCost',
    'Engine': 'engine',
    'Drive': 'drive',
    'Transmission': 'transmission',
    'Fuel Type': 'fuelType',
    'Cylinders': 'cylinders',
    'Runs/Drives': 'runsDrives',
    'Sale Status': 'saleStatus',
    'High Bid =non-vix,Sealed=Vix': 'highBid',
    'Special Note': 'specialNote',
    'Location city': 'locationCity',
    'Location state': 'locationState',
    'Location ZIP': 'locationZip',
    'Location country': 'locationCountry',
    'Currency Code': 'currencyCode',
    'Image Thumbnail': 'imageThumbnail',
    'Create Date/Time': 'createDateTime',
    'Grid/Row': 'gridRow',
    'Make-an-Offer Eligible': 'makeOfferEligible',
    'Buy-It-Now Price': 'buyItNowPrice',
    'Image URL': 'imageUrl',
    'Trim': 'trim',
    'Last Updated Time': 'lastUpdatedTime',
    'Rentals': 'rentals',
    'Wholesale': 'wholesale',
    'Seller Name': 'sellerName',
    'Offsite Address1': 'offsiteAddress1',
    'Offsite State': 'offsiteState',
    'Offsite City': 'offsiteCity',
    'Offsite Zip': 'offsiteZip',
    'Sale Light': 'saleLight',
    'AutoGrade': 'autoGrade',
    'Announcements': 'announcements',
};
const STAGING_COLUMNS = Object.values(CSV_HEADER_MAP);
const BATCH_SIZE = 500;
const DOWNLOAD_TIMEOUT_MS = 90_000;
const DOWNLOAD_MAX_ATTEMPTS = 4;
const DOWNLOAD_BACKOFF_BASE_MS = 2_000;
const MIN_ROWS_SANITY = 1_000;
const STALENESS_THRESHOLD_HOURS = 6;
const REQUIRED_HEADERS = ['lotNumber', 'vin', 'make', 'year'];
const NEW_LOT_NOTIFY_LIMIT = 5_000;
const LOCK_KEY_SQL = `hashtext('copart_sync')`;
function makeEmptyMetrics() {
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
let CopartImportService = CopartImportService_1 = class CopartImportService {
    configService;
    prisma;
    syncService;
    wantedMatchNotifier;
    async onModuleInit() {
        try {
            const res = await this.prisma.syncRun.updateMany({
                where: { status: 'running' },
                data: {
                    status: 'failed',
                    finishedAt: new Date(),
                    error: 'Marked failed on worker startup (orphaned/incomplete run)',
                },
            });
            if (res.count > 0) {
                this.logger.warn(`Reconciled ${res.count} orphaned "running" SyncRun row(s) on startup`);
            }
        }
        catch (e) {
            this.logger.warn(`Startup SyncRun reconciliation failed (non-fatal): ${e.message}`);
        }
    }
    logger = new common_1.Logger(CopartImportService_1.name);
    pool;
    activeSyncRunId = null;
    lastWrittenProgress = -1;
    lastProgressWriteTs = 0;
    constructor(configService, prisma, syncService, wantedMatchNotifier) {
        this.configService = configService;
        this.prisma = prisma;
        this.syncService = syncService;
        this.wantedMatchNotifier = wantedMatchNotifier;
        this.pool = new pg_1.Pool({
            connectionString: this.configService.get('DATABASE_URL'),
        });
    }
    async updateProgress(phase, progress, extra) {
        const id = this.activeSyncRunId;
        if (!id)
            return;
        const intProgress = Math.min(100, Math.max(0, Math.round(progress)));
        const now = Date.now();
        const phaseChanged = phase !== this._lastPhase;
        const progressChanged = intProgress !== this.lastWrittenProgress;
        const enoughTimeElapsed = now - this.lastProgressWriteTs >= 1_000;
        if (!phaseChanged && !progressChanged && !enoughTimeElapsed)
            return;
        this._lastPhase = phase;
        this.lastWrittenProgress = intProgress;
        this.lastProgressWriteTs = now;
        try {
            await this.prisma.syncRun.update({
                where: { id },
                data: {
                    phase,
                    progress: intProgress,
                    ...(extra?.processedRows !== undefined ? { processedRows: extra.processedRows } : {}),
                    ...(extra?.totalRows !== undefined ? { totalRows: extra.totalRows } : {}),
                },
            });
        }
        catch (err) {
            const e = err;
            this.logger.warn(`Progress update failed (non-fatal): ${e?.message}`);
        }
    }
    _lastPhase = '';
    async notifySyncFailure(reason) {
        try {
            const tenantId = process.env.SYNC_FAILURE_NOTIFY_TENANT_ID ||
                '50197477-9e89-4465-bed5-99c638c435a0';
            const staff = await this.prisma.tenantUser.findMany({
                where: { tenantId, status: 'active', isActive: true },
                select: { userId: true },
            });
            const userIds = [...new Set(staff.map((s) => s.userId))];
            if (userIds.length === 0)
                return;
            const cleanReason = (reason || 'Motivo desconocido').replace(/\s+/g, ' ').trim().slice(0, 300);
            await this.prisma.notification.createMany({
                data: userIds.map((userId) => ({
                    tenantId,
                    userId,
                    title: 'Sincronización de Copart falló',
                    message: `La sincronización no se completó: ${cleanReason}`,
                    type: 'SYNC_FAILED',
                    priority: 'high',
                    actionUrl: '/dashboard/auction',
                    metaValue: { reason: cleanReason, source: 'copart' },
                })),
            });
        }
        catch (e) {
            this.logger.warn(`Failed to create sync-failure notifications: ${e.message}`);
        }
    }
    async handleCopartSyncCron() {
        await this.runSync();
    }
    async runSync() {
        const lockClient = await this.pool.connect();
        let gotLock = false;
        let syncRunId = null;
        try {
            const rawLock = await lockClient.query(`SELECT pg_try_advisory_lock(${LOCK_KEY_SQL}) AS got`);
            const lockRes = this.assertSingleResult(rawLock, 'advisory lock SELECT');
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
            const runRow = await this.prisma.syncRun.create({
                data: { source: 'copart', status: 'running', phase: 'downloading', progress: 0 },
            });
            syncRunId = runRow.id;
            this.activeSyncRunId = syncRunId;
            this.lastWrittenProgress = -1;
            this.lastProgressWriteTs = 0;
            this._lastPhase = '';
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
                        phase: 'done',
                        progress: 100,
                        finishedAt: new Date(),
                        durationMs: Date.now() - startTs,
                        ...metrics,
                    },
                });
                this.logger.log(`Copart sync OK in ${Date.now() - startTs}ms — parsed=${metrics.rowsParsed}, ` +
                    `valid=${metrics.rowsValid}, invalid=${metrics.rowsInvalid}, ` +
                    `upserted=${metrics.rowsUpserted}, stale=${metrics.rowsStaleMarked}, ` +
                    `indexed=${metrics.rowsIndexed}/${metrics.rowsIndexed + metrics.rowsIndexFailed}`);
            }
            catch (error) {
                const err = error;
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
                await this.notifySyncFailure(err?.message || 'Motivo desconocido');
            }
            finally {
                this.activeSyncRunId = null;
            }
        }
        finally {
            if (gotLock) {
                await lockClient
                    .query(`SELECT pg_advisory_unlock(${LOCK_KEY_SQL})`)
                    .catch((e) => this.logger.warn(`Failed to release lock: ${e.message}`));
            }
            lockClient.release();
        }
    }
    async importFromCopartUrl(metrics, syncStart) {
        const url = this.configService.get('COPART_DATA');
        if (!url)
            throw new Error('COPART_DATA environment variable is not set');
        await this.updateProgress('downloading', 0);
        const csvBuffer = await this.downloadCsvWithRetry(url);
        metrics.bytesDownloaded = csvBuffer.length;
        this.logger.log(`Downloaded ${csvBuffer.length} bytes from Copart`);
        await this.updateProgress('downloading', 20);
        await this.updateProgress('parsing', 20);
        const rows = await this.parseCsv(csvBuffer);
        metrics.rowsParsed = rows.length;
        this.logger.log(`Parsed ${rows.length} rows`);
        await this.updateProgress('parsing', 45, { totalRows: rows.length });
        this.assertFeedSanity(rows);
        await this.updateProgress('validating', 45);
        const { valid, invalid } = this.validateRows(rows);
        metrics.rowsValid = valid.length;
        metrics.rowsInvalid = invalid;
        if (invalid > 0) {
            this.logger.warn(`Skipped ${invalid} invalid rows (kept ${valid.length})`);
        }
        await this.updateProgress('validating', 55);
        await this.updateProgress('saving', 55);
        await this.truncateStaging();
        await this.insertIntoStaging(valid);
        await this.updateProgress('saving', 75, { processedRows: valid.length, totalRows: rows.length });
        const { total: upserted, newLotNumbers } = await this.mapStagingToAuctionListings();
        metrics.rowsUpserted = upserted;
        this.logger.log(`Upserted ${upserted} into auction_listings (${newLotNumbers.length} brand-new lots)`);
        await this.updateProgress('saving', 88);
        if (newLotNumbers.length === 0) {
        }
        else if (newLotNumbers.length > NEW_LOT_NOTIFY_LIMIT) {
            this.logger.warn(`Skipping wanted-match notifications: ${newLotNumbers.length} new lots ` +
                `exceeds threshold of ${NEW_LOT_NOTIFY_LIMIT} (treating as bulk/initial load)`);
        }
        else {
            try {
                const created = await this.wantedMatchNotifier.notifyNewListings(newLotNumbers);
                if (created > 0) {
                    this.logger.log(`Created ${created} wanted-match notification(s)`);
                }
            }
            catch (err) {
                const e = err;
                this.logger.error(`Wanted-match notification step failed (non-fatal): ${e?.message}`, e?.stack);
            }
        }
        try {
            const derived = await this.deriveAuctionAttributes();
            if (derived > 0) {
                this.logger.log(`Derived filter attributes for ${derived} lot(s)`);
            }
        }
        catch (err) {
            this.logger.error(`Derive-attributes step failed (non-fatal): ${err?.message}`);
        }
        metrics.rowsStaleMarked = await this.markStaleListings();
        if (metrics.rowsStaleMarked > 0) {
            this.logger.log(`Marked ${metrics.rowsStaleMarked} listings as stale`);
        }
        await this.updateProgress('saving', 90);
        await this.truncateStaging();
        await this.updateProgress('indexing', 90);
        const { success, failed } = await this.syncService.syncAllCopart();
        metrics.rowsIndexed = success;
        metrics.rowsIndexFailed = failed;
        this.logger.log(`OpenSearch: ${success} indexed, ${failed} failed`);
        await this.updateProgress('indexing', 99);
        void syncStart;
    }
    async downloadCsvWithRetry(url) {
        let lastErr = null;
        for (let attempt = 1; attempt <= DOWNLOAD_MAX_ATTEMPTS; attempt++) {
            try {
                return await this.downloadCsvOnce(url, attempt);
            }
            catch (err) {
                lastErr = err;
                if (attempt === DOWNLOAD_MAX_ATTEMPTS)
                    break;
                const backoff = DOWNLOAD_BACKOFF_BASE_MS * Math.pow(2, attempt - 1);
                this.logger.warn(`Download attempt ${attempt}/${DOWNLOAD_MAX_ATTEMPTS} failed: ${lastErr.message}. Retrying in ${backoff}ms`);
                await this.sleep(backoff);
            }
        }
        throw new Error(`Copart download failed after ${DOWNLOAD_MAX_ATTEMPTS} attempts: ${lastErr?.message}`);
    }
    async downloadCsvOnce(url, attempt) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);
        try {
            this.logger.log(`Downloading Copart CSV (attempt ${attempt}/${DOWNLOAD_MAX_ATTEMPTS})`);
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }
            const total = Number(response.headers.get('content-length')) || 0;
            const body = response.body;
            if (!body || typeof body.getReader !== 'function') {
                const buf = Buffer.from(await response.arrayBuffer());
                if (buf.length === 0)
                    throw new Error('Empty response body');
                return buf;
            }
            const reader = body.getReader();
            const chunks = [];
            let received = 0;
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                if (value) {
                    chunks.push(Buffer.from(value));
                    received += value.length;
                    if (total > 0) {
                        await this.updateProgress('downloading', Math.min(20, Math.round((received / total) * 20)));
                    }
                }
            }
            const buf = Buffer.concat(chunks);
            if (buf.length === 0) {
                throw new Error('Empty response body');
            }
            return buf;
        }
        finally {
            clearTimeout(timeout);
        }
    }
    parseCsv(csvBuffer) {
        return new Promise((resolve, reject) => {
            const rows = [];
            const parser = (0, csv_parse_1.parse)({
                columns: (rawHeaders) => rawHeaders.map((h) => CSV_HEADER_MAP[h.trim()] ?? h.trim()),
                relax_quotes: true,
                relax_column_count: true,
                skip_records_with_error: true,
                bom: true,
                cast: (value) => (value ?? '').trim(),
            });
            parser.on('readable', () => {
                let record;
                while ((record = parser.read()) !== null) {
                    rows.push(record);
                }
            });
            parser.on('error', (err) => {
                this.logger.warn(`csv-parse stream error (skipping): ${err.message}`);
            });
            parser.on('end', () => resolve(rows));
            parser.write(csvBuffer);
            parser.end();
        });
    }
    assertFeedSanity(rows) {
        if (rows.length < MIN_ROWS_SANITY) {
            throw new Error(`Feed sanity failed: parsed ${rows.length} rows but expected >=${MIN_ROWS_SANITY}. ` +
                `Refusing to sync to avoid wiping good data.`);
        }
        const firstRow = rows[0];
        const missing = REQUIRED_HEADERS.filter((h) => !(h in firstRow));
        if (missing.length > 0) {
            throw new Error(`Feed sanity failed: CSV is missing required columns: ${missing.join(', ')}. ` +
                `Copart may have changed its schema.`);
        }
    }
    validateRows(rows) {
        const valid = [];
        let invalid = 0;
        for (const row of rows) {
            const raw = (row['lotNumber'] ?? '').trim();
            if (!/^\d+$/.test(raw)) {
                invalid++;
                continue;
            }
            valid.push(row);
        }
        return { valid, invalid };
    }
    async insertIntoStaging(rows) {
        if (rows.length === 0)
            return 0;
        const client = await this.pool.connect();
        let total = 0;
        try {
            await client.query("SET statement_timeout = '1200000'");
            const colList = STAGING_COLUMNS.map((c) => `"${c}"`).join(', ');
            for (let i = 0; i < rows.length; i += BATCH_SIZE) {
                const batch = rows.slice(i, i + BATCH_SIZE);
                const valuePlaceholders = [];
                const values = [];
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
                await this.updateProgress('saving', 55 + Math.round((total / rows.length) * 20), { processedRows: total, totalRows: rows.length });
            }
            this.logger.log(`Staged ${total} rows`);
        }
        finally {
            client.release();
        }
        return total;
    }
    assertSingleResult(result, label) {
        if (Array.isArray(result)) {
            throw new Error(`Multi-statement query in ${label} returned an array; split it into ` +
                `single statements. This is a programmer error — each client.query() ` +
                `call must contain exactly one SQL statement.`);
        }
        return result;
    }
    async mapStagingToAuctionListings() {
        const client = await this.pool.connect();
        try {
            await client.query("SET statement_timeout = '1200000'");
            await client.query(`
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
      `);
            const rawInsert = await client.query(`
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
            const insertResult = this.assertSingleResult(rawInsert, 'mapStagingToAuctionListings INSERT');
            const newLotNumbers = insertResult.rows
                .filter((r) => r.inserted)
                .map((r) => r.lotNumber);
            return { total: insertResult.rowCount ?? 0, newLotNumbers };
        }
        finally {
            client.release();
        }
    }
    async markStaleListings() {
        const client = await this.pool.connect();
        try {
            await client.query("SET statement_timeout = '1200000'");
            const rawResult = await client.query(`
        UPDATE auction_listings
        SET "isStale" = true, "updatedAt" = NOW()
        WHERE "auctionName" = 'Copart'
          AND "isStale" = false
          AND (
            "lastSeenAt" IS NULL
            OR "lastSeenAt" < NOW() - INTERVAL '${STALENESS_THRESHOLD_HOURS} hours'
          )
        `);
            const result = this.assertSingleResult(rawResult, 'markStaleListings UPDATE');
            return result.rowCount ?? 0;
        }
        finally {
            client.release();
        }
    }
    async deriveAuctionAttributes() {
        const BATCH = 5000;
        let processed = 0;
        for (;;) {
            const { rows } = await this.pool.query(`SELECT "lotNumber", "engine", "rentals", "sellerName", "locationZip"
         FROM auction_listings
         WHERE "auctionName" = 'Copart' AND "sellerCategory" IS NULL
         LIMIT ${BATCH}`);
            if (rows.length === 0)
                break;
            const values = [];
            const params = [];
            let i = 1;
            for (const r of rows) {
                const geo = (0, common_2.geocodeZip)(r.locationZip);
                const engineSizeL = (0, common_2.parseEngineSizeL)(r.engine);
                params.push(r.lotNumber, (0, common_2.deriveSellerCategory)(r.rentals, r.sellerName), engineSizeL, geo ? geo.lat : null, geo ? geo.lon : null);
                values.push(`($${i}::bigint,$${i + 1},$${i + 2}::numeric,$${i + 3}::double precision,$${i + 4}::double precision)`);
                i += 5;
            }
            await this.pool.query(`UPDATE auction_listings a
         SET "sellerCategory" = v.cat,
             "engineSizeL"    = v.el,
             "locationLat"    = v.lat,
             "locationLng"    = v.lng
         FROM (VALUES ${values.join(',')}) AS v("lotNumber", cat, el, lat, lng)
         WHERE a."lotNumber" = v."lotNumber"`, params);
            processed += rows.length;
            if (rows.length < BATCH)
                break;
        }
        return processed;
    }
    async truncateStaging() {
        const client = await this.pool.connect();
        try {
            await client.query('TRUNCATE TABLE copart_staging RESTART IDENTITY');
        }
        finally {
            client.release();
        }
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.CopartImportService = CopartImportService;
__decorate([
    (0, schedule_1.Cron)('9,39 5-22 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CopartImportService.prototype, "handleCopartSyncCron", null);
exports.CopartImportService = CopartImportService = CopartImportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_1.PrismaService,
        opensearch_1.AuctionSyncService,
        wanted_match_notifier_service_1.WantedMatchNotifierService])
], CopartImportService);
//# sourceMappingURL=copart-import.service.js.map
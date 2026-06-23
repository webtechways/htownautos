---
name: copart-sync-patterns
description: Copart CSV import pipeline patterns — parser, progress tracking, SyncRun model, status endpoint location
metadata:
  type: project
---

## csv-parse (not csv-parser) for Copart feed
- `csv-parse` (v7) is installed and used. `csv-parser` was removed from the import.
- Key options: `relax_quotes: true, relax_column_count: true, skip_records_with_error: true, bom: true, trim: true`
- Column mapping via `columns: (rawHeaders: string[]) => rawHeaders.map(h => CSV_HEADER_MAP[h.trim()] ?? h.trim())`
- Parser is used as a push stream: `parser.write(buffer); parser.end();` with `readable` event to drain.

## SyncRun progress fields (added migration 20260622100000_sync_run_progress)
- New fields: `phase String?`, `progress Int? @default(0)`, `processedRows Int?`, `totalRows Int?`
- Phase progression: downloading (0→20) → parsing (20→45) → validating (45→55) → saving (55→90) → indexing (90→99) → done (100 on success)
- `progress=100, phase='done'` set in the final success update block in `runSync()`, NOT in `importFromCopartUrl`

## Progress throttling in CopartImportService
- `activeSyncRunId: string | null` — set at sync start, cleared in inner `finally`
- `updateProgress(phase, progress, extra?)` — best-effort (try/catch, never throws)
- Throttle: skips DB write if phase unchanged AND progress int unchanged AND <1s since last write
- Phase change always bypasses throttle (immediate write)

## Status endpoint
- Route: `GET /auctions/sync/status` (full path: `/auctions/sync/status`)
- Lives in `apps/api/src/opensearch/auction-search.controller.ts`
- Prefers running SyncRun over completed; falls back to most recent; returns `{ status: 'idle', progress: 0 }` if no rows
- PrismaService injected directly into the controller (PrismaModule already imported in opensearch.module.ts)
- No `@Public()` → protected by global ClerkJwtGuard (staff-only)

**Why:** csv-parser silently desyncs on Copart's 88MB feed with unescaped quotes, emitting only ~15k of 140k rows.
**How to apply:** Never go back to csv-parser for Copart. If Copart feed changes structure, update CSV_HEADER_MAP.

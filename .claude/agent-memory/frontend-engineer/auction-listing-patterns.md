---
name: auction-listing-patterns
description: Auction listing page architecture, sync status polling, i18n namespace, key component locations
metadata:
  type: project
---

## File locations

- `src/pages/dashboard/auction/index.tsx` — monolithic ~3260-line file; all auction listing logic, filters, table, cards, dialogs
- `src/pages/dashboard/auction/api.ts` — all auction API methods; `auctionApi`, `favoritesApi`, `carfaxApi`, `listingGroupsApi`, etc.
- `src/pages/dashboard/auction/types.ts` — `AuctionListing`, `QueryAuctionDto`, `PaginatedResponse`, aggregation types
- `src/i18n/locales/{en,es}/auction.json` — i18n namespace `"auction"`

## Component tree

- `AuctionPage` (default export, ~line 3188) — owns `syncing`/`recreating` state, calls `auctionApi.importCopart()` / `auctionApi.recreateAndImport()`, renders `<AuctionListings>`
- `AuctionListings` (~line 1499) — owns all filter/search/pagination state, lastSyncAt polling, sync status polling, table/cards view
- `AuctionFiltersSidebar` — shared between inline desktop and mobile Sheet drawer
- `SyncStatusIndicator` (~line 1361 after changes) — thin progress bar + phase label when `status === 'running'`, falls back to "Synced X ago"

## Sync status polling (added 2026-06)

- `GET /auctions/sync/status` → `CopartSyncStatus` type in `api.ts`
- Adaptive cadence: 2s while `status === 'running'`, 15s while idle
- Lives inside `AuctionListings` via `scheduleSyncPoll` callback + `syncPollTimer` ref
- `syncStatusRef` holds the previous value to detect run transitions (wasRunning → finished → triggers `fetchLastSync`)
- Button disabled when `syncStatus?.status === 'running'` in addition to `syncing || recreating`

## i18n phase keys (auction namespace)

Phase raw strings from the backend map to: `sync.progress.phases.{downloading|parsing|validating|saving|indexing}`
Unknown phases fall back to the raw `phase` string from the API.
Row count (`processedRows/totalRows`) is shown only during `saving` phase.

## Polling pattern used in this codebase

Self-scheduling `setTimeout` (not `setInterval`) stored in a `useRef`. Cleanup via `clearTimeout` in useEffect return. This avoids the double-fire problem of setInterval with async callbacks.

## URL filter persistence

Filters are round-tripped through URL search params via `parseUrlToFilters` / `filtersToUrlParams`. Three typed const arrays drive both directions: `ARRAY_FILTERS`, `NUMBER_FILTERS`, `STRING_FILTERS`, `BOOLEAN_FILTERS`.

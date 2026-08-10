# Auction Monitor

Server-side replacement for the `chromescraperextension` Chrome extension. Instead of a
person keeping a tab open on every live sale, a headless Chromium opens each auction flagged
in **Settings → Auction Calendar** a few minutes before it starts, reads its Socket.IO frames,
and posts the sold lots to `/auction-sale-results/ingest`.

Runs as its **own container** (`Dockerfile.auction-monitor`), so Chromium's memory use and
crashes stay away from the API.

## Flow

1. `MonitorSchedulerService` ticks every 30s.
2. Calendar entries with `monitor = true` starting within `leadMinutes` become `pending`
   rows in `auction_monitor_sessions`.
3. `AbmSessionService` guarantees a logged-in browser: it loads
   `/en/myaccount/contact-information/` first, and only if AutoBidMaster bounces it to
   `/en/login/` does it sign in with `ABM_USER` / `ABM_PASS`. Cookies live in a persistent
   `userDataDir`, so restarts usually skip the login.
4. `SessionRunner` opens the entry's URL (`.../search/sale-location-id-<slug>/sale-date-<YYYYMMDD>`)
   in its own page and taps the socket over CDP (`Network.webSocketFrameReceived`) — nothing
   is injected into the page, unlike the extension's `window.WebSocket` proxy.
5. `sio-decoder.ts` is a 1:1 port of the extension's `ws-bridge.js`: only `42`/`43` frames,
   namespace support, event-name allow-list, `onlySold`, and the `sold:<lot>` /
   `<lot>:<order>:<bid>` dedupe keys.
6. `SaleEventSinkService` POSTs batches to `${API_BASE_URL}/auction-sale-results/ingest` with
   `X-API-Key`, retries 3× and optionally mirrors to the old n8n webhook. Dedupe is global
   across pages, so overlapping sale pages can never post the same lot twice.

Sessions stop on: `stopping` requested from the UI, `idleStopMinutes` with no frames (only
counted after the scheduled start), `maxDurationMinutes`, the calendar toggle going off, or
container shutdown.

## Control (Settings → Auction Monitor)

The API runs in a different container, so **the database is the control bus** — every UI
action is a DB write the worker picks up within one tick (≤30s):

| Action | Write |
|---|---|
| Pause / resume | `auction_monitor_config.paused` |
| Stop a session | session row → `status = 'stopping'` |
| Watch a sale now | new session row with `status = 'pending'` |
| Test the login | `config.loginTestRequestedAt` |

`config.workerHeartbeatAt` is stamped every tick; the UI shows "Worker offline" when it is
older than 3 minutes.

## Environment

| Var | Notes |
|---|---|
| `ABM_USER` / `ABM_PASS` | AutoBidMaster account. |
| `API_BASE_URL` | Where the ingest endpoint lives. |
| `AUCTION_INGEST_API_KEY` | Shared secret for that endpoint. |
| `DATABASE_URL` | Same DB as the API. |
| `PUPPETEER_EXECUTABLE_PATH` | `/usr/bin/chromium` in the image. |
| `MONITOR_PROFILE_DIR` | Persistent Chromium profile — mount `/data` as a volume or you re-login on every deploy. |
| `MONITOR_HEADLESS` | `false` to watch it work locally. |

**What gets monitored is not an env var:** the per-row `monitor` toggle in Settings → Auction
Calendar picks which sale dates are watched, and `config.paused` is the master switch. Running a
second worker (e.g. locally) is safe by construction — Chromium only launches when a monitored
sale is due, and the ingest endpoint upserts on `(lot, saleDate)`, so a duplicate post is a
no-op rather than a duplicated row.

Egress must be the host's normal IP: do **not** route this through the Webshare proxy pool —
signing into the account from rotating datacenter IPs invites a block.

This container must not run `prisma migrate deploy`; the API container already does.

## Local run

```bash
export MONITOR_HEADLESS=false
export PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
npx nx serve auction-monitor
```

Capture chain without AutoBidMaster (fake sale page + fake socket + fake ingest API):

```bash
npx nx build auction-monitor && node scripts/verify-auction-monitor.js
```

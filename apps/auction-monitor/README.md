# Auction Monitor

> **Superseded (2026-08-24).** The live sales are now covered by VMs running Chrome + Automa,
> which pull their share of the day from `POST /api/v1/scraper/poll` — see
> `apps/api/src/scraper-workers/README.md`. This worker stays in the tree but must be left
> paused (`auction_monitor_config.paused = true`), or it opens the same sales in parallel with
> the fleet. Everything below still describes how it works if it is ever switched back on.

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
| Capture the live page | session row → `screenshotRequestedAt` |

`config.workerHeartbeatAt` is stamped every tick; the UI shows "Worker offline" when it is
older than 3 minutes.

## Seeing what Chromium sees

Headless containers are blind, so the worker takes JPEG captures and pushes them to
`POST /auction-monitor/screenshot` (ingest-secret guarded). The **API** owns the S3 credentials
and stores them — the worker never needs any. Captures happen on every login check (`logged-in`
/ `login-failed` / `login-error` — this is how you spot a captcha), when a sale page is opened
(`opened`), and on demand from the UI (`manual`). The login card shows the latest login shot;
each session keeps a tail of the last 6.

Locally, `MONITOR_HEADLESS=false` opens a real window instead — the login check runs even while
the monitor is paused, so pressing "Test login" is enough to watch the whole flow.

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

### Cloudflare and the User-Agent (learned the hard way)

AutoBidMaster sits behind Cloudflare, and the **only** signal that got the container blocked was
the `HeadlessChrome` token Chromium puts in its User-Agent: every request answered `403 Attention
Required`, while plain `curl` from the same host got `200`. `newPage()` therefore reports the
running browser's UA with that token rewritten to `Chrome` (override with `MONITOR_USER_AGENT`),
plus `--disable-blink-features=AutomationControlled`, no `--enable-automation`, and the usual
`navigator.webdriver` patch.

A challenge page keeps the requested URL, so "we were not redirected to /login" read as a healthy
session and the worker reported `loginOk: true` while seeing nothing but a block page.
`assertNotBlocked()` now fails on 403/429/4xx/5xx and on challenge titles; `verify-auction-monitor.js`
covers it.

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

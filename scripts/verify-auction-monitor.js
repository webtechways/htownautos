/**
 * End-to-end check of the auction-monitor capture chain WITHOUT AutoBidMaster:
 *
 *   fake sale page  →  fake Socket.IO server  →  CDP tap (SessionRunner)
 *                   →  SaleEventSinkService   →  fake ingest API
 *
 * Asserts the same behaviours the Chrome extension had: only 42/43 frames,
 * namespace support, ping/pong ignored, onlySold filter, and dedupe.
 */
const http = require('node:http');

const ROOT = require('node:path').resolve(__dirname, '..');
const { WebSocketServer } = require(`${ROOT}/node_modules/ws`);
const DIST = `${ROOT}/dist/apps/auction-monitor/apps/auction-monitor/src`;
const { SessionRunner } = require(`${DIST}/session-runner`);
const { SaleEventSinkService } = require(`${DIST}/sale-event-sink.service`);
const { ScreenshotService } = require(`${DIST}/screenshot.service`);
const puppeteer = require(`${ROOT}/node_modules/puppeteer-core`);

const CHROME =
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const FRAMES = [
  '0{"sid":"abc","upgrades":[],"pingInterval":25000}',        // handshake — ignored
  '40',                                                        // connect — ignored
  '2',                                                         // ping — ignored
  '42["event",{"auction":"copart-110-a","lot":57600736,"bid":3200,"order":38,"asking":3250,"reserve":true,"sold":true,"round":1,"ticks":0}]',
  '42["event",{"auction":"copart-110-a","lot":57600736,"bid":3200,"order":38,"asking":3250,"reserve":true,"sold":true,"round":1,"ticks":0}]', // duplicate
  '42["event",{"auction":"copart-110-a","lot":57600737,"bid":900,"order":39,"asking":950,"sold":false}]',        // live bid, filtered by onlySold
  '42/live,["event",{"auction":"copart-882-a","lot":62813626,"bid":1650,"order":1,"asking":1700,"sold":true}]',  // namespaced
  '42["other",{"lot":1,"sold":true}]',                         // event name not allowed
  '3',                                                         // pong — ignored
];

async function main() {
  const received = [];
  const shots = [];

  // 1. Fake API: the sale-results ingest plus the screenshot upload. Paths are
  //    asserted with the api/v1 prefix the real API mounts everything under.
  const ingest = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      if (req.headers['x-api-key'] !== 'test-key') {
        res.writeHead(401).end('bad key');
        return;
      }
      if (req.url === '/api/v1/auction-monitor/screenshot') {
        const shot = JSON.parse(body);
        shots.push({ ...shot, bytes: Buffer.from(shot.imageBase64, 'base64') });
        res
          .writeHead(200, { 'Content-Type': 'application/json' })
          .end('{"url":"https://cdn.test/shot.jpg"}');
        return;
      }
      if (req.url !== '/api/v1/auction-sale-results/ingest') {
        res.writeHead(404).end('wrong path: ' + req.url);
        return;
      }
      received.push(...JSON.parse(body));
      res.writeHead(200, { 'Content-Type': 'application/json' }).end('{"ok":true}');
    });
  });
  await new Promise((r) => ingest.listen(0, r));
  process.env.API_BASE_URL = `http://127.0.0.1:${ingest.address().port}`;
  process.env.AUCTION_INGEST_API_KEY = 'test-key';

  // 2. Fake sale page + its socket.
  const page = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' }).end(
      `<!doctype html><title>fake sale</title><script>
         const ws = new WebSocket("ws://" + location.host + "/socket.io/?EIO=4&transport=websocket");
         ws.onmessage = (e) => { window.__last = e.data; };
       </script>`,
    );
  });
  const wss = new WebSocketServer({ server: page });
  wss.on('connection', (socket) => {
    let i = 0;
    const timer = setInterval(() => {
      if (i >= FRAMES.length) return clearInterval(timer);
      socket.send(FRAMES[i++]);
    }, 60);
  });
  await new Promise((r) => page.listen(0, r));
  const url = `http://127.0.0.1:${page.address().port}/`;

  // 3. Real Chromium + the real runner, with a stub session service.
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  const session = {
    ensureLoggedIn: async () => ({ ok: true }),
    invalidateLogin() {},
    newPage: async () => browser.newPage(),
  };

  const sink = new SaleEventSinkService();
  const screenshots = new ScreenshotService();
  const runner = new SessionRunner(
    { sessionId: 'test-session', url, locationName: 'TEST - Lab' },
    session,
    sink,
    screenshots,
    { onlySold: true, eventNames: 'event', wsUrlPattern: '', includeRaw: false },
  );

  await runner.start();
  await new Promise((r) => setTimeout(r, 3_000));
  await runner.capture('manual');
  await runner.stop();
  await browser.close();
  await new Promise((r) => setTimeout(r, 500));
  ingest.close();
  page.close();
  wss.close();

  // 4. Assertions.
  const lots = received.map((e) => e.lot).sort();
  const checks = [
    ['frames passing filters', runner.framesSeen, 2],
    ['sold events', runner.eventsSold, 2],
    ['rows posted to ingest', received.length, 2],
    ['lots captured', JSON.stringify(lots), JSON.stringify([57600736, 62813626])],
    ['counters reported to scheduler', sink.takeCounters('test-session').ingested, 2],
    ['sold flag preserved', received.every((e) => e.sold === true), true],
    ['page url attached', received.every((e) => e.pageUrl === url), true],
    ['screenshots uploaded', shots.length, 2],
    ['capture labels', JSON.stringify(shots.map((s) => s.label)), JSON.stringify(['opened', 'manual'])],
    ['captures are jpeg', shots.every((s) => s.bytes[0] === 0xff && s.bytes[1] === 0xd8), true],
    ['captures carry the session id', shots.every((s) => s.sessionId === 'test-session'), true],
  ];

  let failed = 0;
  for (const [name, got, want] of checks) {
    const ok = got === want;
    if (!ok) failed++;
    console.log(`${ok ? '✅' : '❌'} ${name}: got ${got}${ok ? '' : ` — expected ${want}`}`);
  }
  console.log('\nsample payload:', JSON.stringify(received[0]));
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error('verification crashed:', err);
  process.exit(1);
});

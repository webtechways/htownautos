/**
 * Comprueba el reparto de subastas entre VM contra un Postgres de verdad.
 *
 * Lo que importa aquí es la exclusividad, y eso depende de la semántica real de
 * Postgres bajo concurrencia: un mock de Prisma no demostraría nada. Por eso el
 * script habla con la base de datos apuntada por DATABASE_URL.
 *
 * Siembra sus propias subastas (prefijo VERIFY-) y las borra al terminar, así
 * que es seguro contra la base de datos de desarrollo. Contra producción no:
 * usa una VM inventada y podría llevarse subastas reales durante unos segundos.
 *
 *   npx nx build api && node scripts/verify-scraper-workers.js
 */
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
require(`${ROOT}/node_modules/dotenv/config`);

const DIST = `${ROOT}/dist/apps/api`;
const { PrismaService } = require(`${DIST}/libs/prisma/src/prisma.service`);
const {
  ScraperWorkersService,
} = require(`${DIST}/apps/api/src/scraper-workers/scraper-workers.service`);

const TAG = 'VERIFY-';
const WORKERS = ['verify-vm-a', 'verify-vm-b'];
const SEEDED = 12;

let failures = 0;
function check(label, ok, detail = '') {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
}

/** El día de hoy en Houston como YYYYMMDD, igual que el servicio. */
function saleDateToday() {
  const s = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  return parseInt(s.replace(/-/g, ''), 10);
}

async function cleanup(prisma) {
  await prisma.auctionCalendarEntry.deleteMany({ where: { locationName: { startsWith: TAG } } });
  await prisma.auctionCalendarEntry.updateMany({
    where: { scraperWorkerId: { in: WORKERS } },
    data: { scraperWorkerId: null },
  });
  await prisma.scraperWorker.deleteMany({ where: { id: { in: WORKERS } } });
}

async function main() {
  const prisma = new PrismaService();
  const svc = new ScraperWorkersService(prisma);
  const saleDate = saleDateToday();

  await cleanup(prisma);

  // Todas empiezan en el futuro: el reclamo descarta lo que arrancó hace más de
  // media hora, porque llegar tarde a una venta no sirve de nada.
  const base = Date.now() + 60 * 60_000;
  await prisma.auctionCalendarEntry.createMany({
    data: Array.from({ length: SEEDED }, (_, i) => ({
      status: 'upcoming',
      auctionGroup: 'usa',
      locationSourceId: 990_000 + i,
      locationName: `${TAG}Lot ${i}`,
      locationSlug: `verify-${i}`,
      startedAt: new Date(base + i * 15 * 60_000),
      saleDate,
      totalAvailableItems: 100 + i,
      url: `https://example.test/verify/${i}`,
    })),
  });

  try {
    // 1. Exclusividad bajo concurrencia — la propiedad que sostiene todo.
    const [a, b] = await Promise.all([
      svc.poll({ worker: WORKERS[0], wait: false }),
      svc.poll({ worker: WORKERS[1], wait: false }),
    ]);
    const idsA = a.auctions.map((x) => x.id);
    const idsB = b.auctions.map((x) => x.id);
    const overlap = idsA.filter((id) => idsB.includes(id));
    check('dos VM en paralelo no comparten ninguna subasta', overlap.length === 0,
      `${idsA.length} + ${idsB.length}, solapan ${overlap.length}`);

    // 2. Cupo.
    check('ninguna pasa del cupo de 5', idsA.length <= 5 && idsB.length <= 5,
      `${idsA.length} y ${idsB.length}`);

    // 3. Idempotencia — un reinicio de Automa no debe repartir de nuevo.
    const again = await svc.poll({ worker: WORKERS[0], wait: false });
    const same =
      again.auctions.length === idsA.length &&
      again.auctions.every((x) => idsA.includes(x.id));
    check('repetir el poll devuelve exactamente las mismas', same,
      `${again.auctions.length} vs ${idsA.length}`);

    // 4. La respuesta trae lo que Automa necesita para abrir la pestaña.
    const shaped = a.auctions.every((x) => x.url && x.startsAt && x.locationName);
    check('cada subasta trae url, hora y ubicación', shaped);

    // 5. Apagar una VM devuelve su día al bote.
    await svc.update(WORKERS[1], { enabled: false });
    const freed = await prisma.auctionCalendarEntry.count({
      where: { scraperWorkerId: WORKERS[1] },
    });
    check('desactivar una VM suelta sus subastas', freed === 0, `quedan ${freed}`);

    // 6. Y otra las puede recoger.
    await svc.update(WORKERS[1], { enabled: true });
    const c = await svc.poll({ worker: WORKERS[1], wait: false });
    check('otra VM recoge lo liberado', c.auctions.length > 0, `${c.auctions.length}`);

    // 7. Bajar el cupo suelta el excedente en vez de dejarlo retenido sin abrir.
    await svc.update(WORKERS[0], { maxAuctions: 2 });
    const held = await prisma.auctionCalendarEntry.count({
      where: { scraperWorkerId: WORKERS[0] },
    });
    check('bajar el cupo suelta el excedente', held === 2, `retiene ${held}`);
  } finally {
    await cleanup(prisma);
    await prisma.onModuleDestroy?.();
  }

  console.log(failures === 0 ? '\nTodo correcto.' : `\n${failures} comprobación(es) fallidas.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('El script falló:', err.message);
  process.exit(1);
});

/**
 * Comprueba que cada faceta de Stats se cuenta sin su propio filtro.
 *
 * Es lo que permite multiseleccion: con la marca ya filtrada, elegir FORD
 * borraba el resto de marcas y no habia forma de anadir una segunda.
 *
 *   npx nx build api && node scripts/verify-stats-facets.mjs
 */
const { StatsService } = await import('../dist/apps/api/apps/api/src/auction-sale-results/stats.service.js');

// Prisma de mentira: devuelve el `where` que recibio para poder inspeccionarlo.
const vistos = {};
const prisma = {
  auctionSaleResult: {
    groupBy: async ({ by, where }) => { vistos[by[0]] = where; return []; },
    findMany: async () => [], count: async () => 0,
  },
};
const svc = new StatsService(prisma, { getOverrides: async () => ({}) });

const dto = { make: ['FORD'], model: ['F150'], color: ['RED'], yearMin: 2015 };
await svc.getFilters(dto);

const json = (w) => JSON.stringify(w ?? {});
const contiene = (campo, valor) => json(vistos[campo]).includes(valor);

let fail = 0;
const ok = (l, c, d = '') => { console.log(`${c ? '  ok  ' : ' FAIL '} ${l}${d ? ' — ' + d : ''}`); if (!c) fail++; };

ok('la faceta make ignora el filtro de make', !contiene('make', 'FORD'));
ok('...pero si respeta model', contiene('make', 'F150'));
ok('...y respeta color', contiene('make', 'RED'));

ok('la faceta model ignora el filtro de model', !contiene('model', 'F150'));
ok('...pero respeta make (de ahi la cascada)', contiene('model', 'FORD'));

ok('la faceta trim respeta make y model', contiene('trim', 'FORD') && contiene('trim', 'F150'));
ok('la faceta color ignora color pero respeta make', !contiene('color', 'RED') && contiene('color', 'FORD'));
ok('la faceta year ignora yearMin', !contiene('year', '2015'));
ok('las demas facetas si aplican year', contiene('make', '2015'));

console.log(fail === 0 ? '\nTODO CORRECTO' : `\n${fail} fallo(s)`);
process.exitCode = fail ? 1 : 0;

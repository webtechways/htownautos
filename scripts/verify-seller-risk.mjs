// Comprueba el clasificador de riesgo contra vendedores reales y trampas.
// npx nx build api && node scripts/verify-seller-risk.mjs
const { explainSellerRisk } = await import('../dist/apps/api/libs/common/src/utils/seller-risk.utils.js');

const casos = [
  // Los de tu captura
  ['BRIDGECREST ACCEPTANCE', 'low'], ['CarBrain', 'high'], ['AT&T SERVICES', 'medium'],
  ['ESC CORPORATE SERVICES', 'medium'], ['ACC RESERVICES', 'high'],
  ['CONSUMER PORTFOLIO SERVICES', 'low'], ['VERVENT', 'low'],
  ['FLEET RESPONSE', 'medium'], ['FOX RENT A CAR', 'low'],
  ['ARI FINANCIAL SERVICES INC', 'low'], ['UNITED AUTO CREDIT CORPORATION', 'low'],
  ['Trusted Dealer', 'high'], ['CHRYSLER CAPITAL', 'low'], ['CRESCENT AUTO FINANCE', 'low'],
  // Trampas: el revendedor debe ganar aunque el nombre suene formal
  ['ABC MOTORS FINANCIAL LLC', 'high'], ['SUNSHINE AUTO SALES', 'high'],
  ['JOES TOWING AND RECOVERY', 'high'], ['PULL A PART', 'high'],
  ['STATE FARM MUTUAL', 'low'], ['CITY OF HOUSTON', 'medium'],
  ['KARS4KIDS', 'medium'], ['', 'high'], ['XYZ HOLDINGS', 'high'],
];

let fail = 0;
for (const [nombre, esperado] of casos) {
  const { risk, reason } = explainSellerRisk(nombre, null);
  const ok = risk === esperado;
  if (!ok) fail++;
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${(nombre || '(vacio)').padEnd(31)} ${risk.padEnd(7)} ${ok ? '' : `esperaba ${esperado}  `}(${reason})`);
}
console.log(fail === 0 ? '\nTODO CORRECTO' : `\n${fail} fallo(s)`);
process.exitCode = fail ? 1 : 0;

/**
 * Nivel de riesgo de un vendedor de subasta.
 *
 * Sustituye al booleano `trusted`, que obligaba a meter en el mismo saco a una
 * aseguradora y a un desguace solo porque ninguno de los dos era "de fiar".
 *
 * El criterio es de dónde viene el coche y qué se sabe de su historia:
 *
 * - **low**    Aseguradoras, alquiladoras y financieras (repos). Son la fuente
 *              original del vehículo: hay papeles, hay historial y no hay nadie
 *              en medio que se haya llevado las piezas buenas.
 * - **medium** Flotas de empresa, administraciones y donaciones. Vendedor
 *              conocido y coche con mantenimiento documentado, pero uso
 *              comercial, kilometraje alto y a veces procedencia irregular.
 * - **high**   Revendedores, desguaces, grúas e impounds, y **todo lo
 *              desconocido**. Si no se sabe quién vende, se asume lo peor.
 *
 * El desconocido cae en `high` a propósito: es el caso más común y el que más
 * cuesta si se acierta por optimismo.
 */
export type SellerRisk = 'low' | 'medium' | 'high';

export const SELLER_RISKS: SellerRisk[] = ['low', 'medium', 'high'];

/** Aseguradoras: la fuente original tras un siniestro. */
const INSURANCE = [
  'insurance', 'insur', 'assurance', 'casualty', 'mutual', 'underwriters',
  'geico', 'progressive', 'allstate', 'state farm', 'statefarm', 'usaa',
  'nationwide', 'liberty mutual', 'farmers', 'esurance', 'travelers',
  'hartford', 'safeco', 'american family', 'erie ', 'mercury ', 'kemper',
  'root ', 'lemonade', 'clearcover', 'infinity ',
];

/** Alquiladoras y car sharing: flota propia, mantenimiento reglado. */
const RENTAL = [
  'rental', 'rent a car', 'rent-a-car', 'rentacar', 'car rental',
  'enterprise', 'hertz', 'avis', 'budget rent', 'sixt', 'national car',
  'alamo', 'dollar thrifty', 'thrifty', 'payless car', 'fox rent',
  'turo', 'zipcar', 'u-haul', 'uhaul', 'penske',
];

/** Financieras y bancos: repos con papeles y titularidad limpia. */
const FINANCE = [
  'financial', 'finance', 'acceptance', 'credit', 'capital', 'lending',
  'loan', 'bank', 'bancorp', 'credit union', 'federal cu', ' fcu', ' cu ',
  'leasing', 'lease', 'repo', 'recovery', 'santander', 'ally ', 'exeter',
  'westlake', 'carvana', 'bridgecrest', 'chrysler capital', 'gm financial',
  'ford motor credit', 'toyota financial', 'honda financial', 'vw credit',
  'nissan motor acceptance', 'hyundai capital', 'consumer portfolio',
  'united auto credit', 'ari ', 'vervent', 'crescent auto',
];

/**
 * Flotas de empresa, administraciones e instituciones. Vendedor conocido, pero
 * el coche ha trabajado: es lo que justifica un escalón intermedio en vez de
 * meterlos con las aseguradoras.
 */
const FLEET = [
  'fleet', 'corporate services', 'corporation services', 'services inc',
  'utilities', 'utility', 'electric co', 'energy', 'telecom', 'communications',
  'at&t', 'verizon', 'comcast', 'waste management', 'pepsi', 'coca-cola',
  'frito', 'sysco', 'cintas', 'terminix', 'orkin', 'adt ',
  'city of', 'county of', 'state of', 'department of', 'municipal', 'police',
  'sheriff', 'fire district', 'school district', 'university', 'college',
  'transit authority', 'housing authority', 'government',
  'donation', 'donate', 'charity', 'charities', 'goodwill', 'salvation army',
  'kars4kids', 'wheels for wishes', 'purple heart', 'veterans ',
];

/**
 * Señales de revendedor y de coche con historia turbia. Todo esto es `high`
 * aunque el nombre suene formal.
 */
const RESELLER = [
  'auto sales', 'autosales', 'motors', 'motor co', 'auto group', 'auto mall',
  'dealer', 'dealership', 'wholesale', 'wholesalers', 'export', 'exports',
  'trading', 'traders', 'liquidat', 'remarketing', 'auction', 'brokers',
  'broker ', 'resale', 'resell', 'flip', 'buy here', 'pay here',
  'salvage', 'dismantl', 'wrecking', 'wreckers', 'junk', 'scrap', 'parts',
  'pick a part', 'pull a part', 'u pull', 'core supply',
  'towing', 'tow ', 'impound', 'storage lien', 'lien sale', 'abandoned',
  'body shop', 'collision center', 'repair',
];

const norm = (s: string) => ` ${s.toLowerCase().replace(/[^a-z0-9&]+/g, ' ').trim()} `;
const hit = (name: string, patterns: string[]) => patterns.some((p) => name.includes(p));

/**
 * Riesgo a partir del nombre del vendedor y, si se conoce, de su categoría.
 *
 * El orden importa: **revendedor gana a todo lo demás**. "ABC MOTORS FINANCIAL"
 * lleva `financial`, pero `motors` delata que hay un intermediario, y ése es
 * justo el caso que no queremos colar como riesgo bajo.
 */
export function deriveSellerRisk(
  sellerName?: string | null,
  category?: string | null,
): SellerRisk {
  const name = norm(sellerName ?? '');
  if (!name.trim()) return 'high'; // sin nombre no hay nada que valorar

  if (hit(name, RESELLER)) return 'high';
  if (hit(name, INSURANCE) || hit(name, RENTAL) || hit(name, FINANCE)) return 'low';
  if (hit(name, FLEET)) return 'medium';

  // La categoría ya calculada es el último recurso: llega de la bandera
  // `rentals` de Copart, que no depende del nombre.
  const cat = (category ?? '').toLowerCase();
  if (cat === 'insurance' || cat === 'rental' || cat === 'repo') return 'low';

  return 'high'; // desconocido
}

/** Por qué salió ese nivel, para poder enseñarlo en la tabla. */
export function explainSellerRisk(
  sellerName?: string | null,
  category?: string | null,
): { risk: SellerRisk; reason: string } {
  const name = norm(sellerName ?? '');
  if (!name.trim()) return { risk: 'high', reason: 'no name' };
  if (hit(name, RESELLER)) return { risk: 'high', reason: 'likely reseller, salvage or tow' };
  if (hit(name, INSURANCE)) return { risk: 'low', reason: 'insurance carrier' };
  if (hit(name, RENTAL)) return { risk: 'low', reason: 'rental fleet' };
  if (hit(name, FINANCE)) return { risk: 'low', reason: 'lender or repo' };
  if (hit(name, FLEET)) return { risk: 'medium', reason: 'corporate fleet, government or charity' };
  const cat = (category ?? '').toLowerCase();
  if (cat === 'insurance' || cat === 'rental' || cat === 'repo') {
    return { risk: 'low', reason: `category ${cat}` };
  }
  return { risk: 'high', reason: 'unknown company' };
}

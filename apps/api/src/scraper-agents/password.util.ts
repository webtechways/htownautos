import { randomInt } from 'node:crypto';

const LOWER = 'abcdefghijkmnopqrstuvwxyz'; // sin l
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sin I, O
const DIGITS = '23456789'; // sin 0, 1
/** Solo los símbolos que Copart declara válidos en su formulario. */
const SYMBOLS = '!@#$%^&*';

/**
 * Contraseña que cumple a la vez las DOS reglas que muestra Copart, que se
 * contradicen entre sí: el encabezado dice "5-10 caracteres" y la lista de
 * criterios dice "mínimo 8 / máximo 25". La intersección es 8-10, así que se
 * generan de 10 — el máximo que satisface ambas.
 *
 * Garantiza minúscula, mayúscula, número y símbolo, y evita caracteres que se
 * confunden al leerlos en voz alta o copiarlos a mano (l, I, O, 0, 1).
 */
export function generateAgentPassword(length = 10): string {
  const pools = [LOWER, UPPER, DIGITS, SYMBOLS];
  const chars: string[] = pools.map((p) => p[randomInt(p.length)]);

  const all = pools.join('');
  while (chars.length < length) {
    chars.push(all[randomInt(all.length)]);
  }

  // Fisher-Yates con entropía criptográfica: si no se barajara, las cuatro
  // primeras posiciones serían siempre del mismo tipo.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

/** Nombres de relleno para dar de alta cuentas; el email se pone después. */
const FIRST_NAMES = [
  'James', 'Robert', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas',
  'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Steven', 'Andrew', 'Kenneth',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Susan', 'Jessica', 'Sarah',
  'Karen', 'Nancy', 'Lisa', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly',
];
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
];

export function generateAgentName(): { firstName: string; lastName: string } {
  return {
    firstName: FIRST_NAMES[randomInt(FIRST_NAMES.length)],
    lastName: LAST_NAMES[randomInt(LAST_NAMES.length)],
  };
}

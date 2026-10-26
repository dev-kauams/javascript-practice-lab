// Dinheiro em CENTAVOS INTEIROS.
//
// Por que? Em ponto flutuante, 0.1 + 0.2 === 0.30000000000000004. Somar preços como
// decimais acumula erros; somar centavos inteiros (10 + 20 === 30) é exato.
// Só convertemos para "reais" na hora de exibir, com Intl.NumberFormat.

const MAX_INTEGER_DIGITS = 9; // até 999.999.999,99: seguro dentro de Number.MAX_SAFE_INTEGER

/** Converte um texto decimal com ponto ("19.9", "5") em centavos; null se inválido. */
function decimalToCents(text) {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(text);
  if (!match || match[1].length > MAX_INTEGER_DIGITS) return null;
  const [, integer, fraction = ''] = match;
  return Number(integer) * 100 + Number(fraction.padEnd(2, '0'));
}

/**
 * Converte "19,90", "19.90", "R$ 1.234,56" ou 19.9 em centavos (1990, 1990, 123456, 1990).
 * Retorna null para entradas inválidas, negativas ou com mais de 2 casas decimais.
 */
export function parsePriceToCents(input) {
  if (typeof input === 'number') {
    if (!Number.isFinite(input) || input < 0) return null;
    // Números JS já são decimais com ponto: nada de heurística pt-BR aqui.
    // Também evitamos Math.round(n * 100): 1.005 * 100 = 100.49999...
    return decimalToCents(String(input));
  }
  if (typeof input !== 'string') return null;

  let text = input.replace(/R\$|\s/g, '');
  if (text === '' || text.startsWith('-')) return null;

  if (text.includes(',')) {
    // pt-BR: ponto separa milhares, vírgula separa decimais
    text = text.replaceAll('.', '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(text)) {
    text = text.replaceAll('.', ''); // "1.234" digitado como texto = mil duzentos e trinta e quatro
  }
  return decimalToCents(text);
}

export function formatCents(cents, { locale = 'pt-BR', currency = 'BRL' } = {}) {
  if (!Number.isSafeInteger(cents)) return '—';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
    cents / 100,
  );
}

export const multiplyCents = (cents, quantity) => cents * quantity;
export const sumCents = (values) => values.reduce((total, value) => total + value, 0);

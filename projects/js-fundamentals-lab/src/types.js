// Conversão e validação de tipos.

/** typeof não distingue null e array; esta função distingue. */
export function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? 'invalid-date' : 'date';
  return typeof value;
}

/**
 * Converte texto em número rejeitando entradas ambíguas.
 * Aceita "1234,56" e "1.234,56" (formato pt-BR). Retorna null se inválido.
 */
export function toNumberStrict(input) {
  if (typeof input === 'number') return Number.isFinite(input) ? input : null;
  if (typeof input !== 'string') return null;
  const text = input.trim();
  if (text === '') return null;
  const normalized = text.includes(',')
    ? text.replaceAll('.', '').replace(',', '.')
    : text;
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;
  return Number(normalized);
}

export function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === '';
}

/** "sim", "true", "1", "on" -> true; "não", "false", "0", "off" -> false; resto -> null */
export function parseBoolean(value) {
  const text = String(value).trim().toLowerCase();
  if (['sim', 'true', '1', 'on', 's'].includes(text)) return true;
  if (['não', 'nao', 'false', '0', 'off', 'n'].includes(text)) return false;
  return null;
}

/** Inteiro positivo seguro (para quantidades, páginas etc.). */
export function toPositiveInt(value) {
  const number = toNumberStrict(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

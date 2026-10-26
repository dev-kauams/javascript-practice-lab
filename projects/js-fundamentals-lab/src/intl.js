// Formatação com Intl: moedas, números, datas e listas.

export function formatCurrency(value, currency = 'BRL', locale = 'pt-BR') {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
}

export function formatNumber(value, locale = 'pt-BR', options = {}) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatPercent(ratio, locale = 'pt-BR') {
  return formatNumber(ratio, locale, { style: 'percent', maximumFractionDigits: 1 });
}

/** Aceita Date, timestamp ou string ISO; entrada inválida retorna "—". */
export function formatDate(input, locale = 'pt-BR', options = { dateStyle: 'long' }) {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...options }).format(date);
}

/** "há 3 dias", "daqui a 2 horas" a partir da diferença em segundos. */
export function relativeTime(diffSeconds, locale = 'pt-BR') {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const units = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, seconds] of units) {
    if (Math.abs(diffSeconds) >= seconds)
      return rtf.format(Math.round(diffSeconds / seconds), unit);
  }
  return rtf.format(Math.round(diffSeconds), 'second');
}

export function formatList(items, locale = 'pt-BR') {
  return new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(
    items,
  );
}

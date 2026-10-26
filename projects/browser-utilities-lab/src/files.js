// Validação de arquivos escolhidos pelo usuário. Recebe só { name, type, size },
// então funciona com File no navegador e com objetos simples nos testes.

export const DEFAULT_RULES = {
  maxBytes: 2 * 1024 * 1024, // 2 MB
  allowedTypes: [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'text/plain',
    'application/json',
  ],
};

const EXTENSION_TYPES = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  txt: 'text/plain',
  json: 'application/json',
};

/** Alguns sistemas deixam `file.type` vazio; nesse caso inferimos pela extensão. */
export function effectiveType({ name = '', type = '' }) {
  if (type) return type;
  const extension = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
  return EXTENSION_TYPES[extension] ?? '';
}

export function formatBytes(bytes, locale = 'pt-BR') {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)} ${units[unit]}`;
}

export function validateFile(file, rules = DEFAULT_RULES) {
  if (!file) return { ok: false, error: 'Nenhum arquivo selecionado.' };
  if (file.size === 0) return { ok: false, error: 'O arquivo está vazio.' };
  const type = effectiveType(file);
  if (!rules.allowedTypes.includes(type)) {
    return {
      ok: false,
      error: `Tipo não permitido${type ? ` (${type})` : ''}. Use PNG, JPEG, WebP, GIF, TXT ou JSON.`,
    };
  }
  if (file.size > rules.maxBytes) {
    return {
      ok: false,
      error: `O arquivo tem ${formatBytes(file.size)}; o limite é ${formatBytes(rules.maxBytes)}.`,
    };
  }
  return { ok: true, type };
}

export function previewKind(type) {
  if (type.startsWith('image/')) return 'image';
  if (type === 'text/plain' || type === 'application/json') return 'text';
  return null;
}

/** Formata JSON válido; para qualquer outra coisa, devolve o texto original. */
export function prettyText(text, type) {
  if (type !== 'application/json') return text;
  try {
    return JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    return text; // JSON inválido: mostra como está
  }
}

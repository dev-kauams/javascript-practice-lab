// Validação e transformação de dados: entradas sujas entram, dados limpos saem.

/** "25", " 25 " e 25 viram 25; "abc", "", "-1", "25.5" e 200 viram null. */
export function parseAge(input) {
  if (typeof input === 'string' && !/^\s*\d+\s*$/.test(input)) return null;
  const age = typeof input === 'string' ? Number(input) : input;
  return Number.isInteger(age) && age >= 0 && age <= 130 ? age : null;
}

export function normalizeEmail(input) {
  const email = String(input ?? '')
    .trim()
    .toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : null;
}

/** Normaliza um cadastro vindo de um formulário ou API; devolve valor limpo e erros por campo. */
export function normalizeUser(raw) {
  const errors = {};
  const source = raw !== null && typeof raw === 'object' ? raw : {};

  const name = String(source.name ?? '')
    .trim()
    .replace(/\s+/g, ' ');
  if (name.length < 2) errors.name = 'Nome muito curto.';

  const email = normalizeEmail(source.email);
  if (!email) errors.email = 'E-mail inválido.';

  const age = parseAge(source.age);
  if (age === null) errors.age = 'Idade inválida.';

  const tags = [
    ...new Set(
      (Array.isArray(source.tags) ? source.tags : [])
        .map((tag) => String(tag).trim().toLowerCase())
        .filter(Boolean),
    ),
  ];

  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, value: { name, email, age, tags } };
}

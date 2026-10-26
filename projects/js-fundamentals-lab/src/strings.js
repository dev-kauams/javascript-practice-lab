// Desafios de strings e expressões regulares.

/** "Olá, Mundo! Ação" -> "ola-mundo-acao" */
export function slugify(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "maria da silva" -> "Maria da Silva" (preposições curtas ficam minúsculas) */
export function capitalizeWords(text) {
  const small = new Set(['da', 'de', 'do', 'das', 'dos', 'e']);
  return String(text ?? '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) =>
      index > 0 && small.has(word) ? word : word[0].toUpperCase() + word.slice(1),
    )
    .join(' ');
}

/** Encontra e-mails em um texto livre, sem repetir. */
export function extractEmails(text) {
  const matches = String(text ?? '').match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g) ?? [];
  return [...new Set(matches.map((email) => email.toLowerCase()))];
}

/** Ignora maiúsculas, acentos, espaços e pontuação. */
export function isPalindrome(text) {
  const clean = slugify(text).replaceAll('-', '');
  return clean.length > 0 && clean === [...clean].reverse().join('');
}

/** Conta palavras, tratando espaços múltiplos e texto vazio. */
export function countWords(text) {
  const words = String(text ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.length;
}

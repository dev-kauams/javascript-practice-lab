// Desafios com map, filter, reduce, find, some e every.

/** filter + map: nomes de maiores de idade em ordem alfabética. */
export function adultNames(people) {
  return people
    .filter((person) => person.age >= 18)
    .map((person) => person.name)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/** reduce: soma valores por categoria. */
export function totalByCategory(items) {
  return items.reduce((totals, { category, value }) => {
    totals[category] = (totals[category] ?? 0) + value;
    return totals;
  }, {});
}

/** find: retorna o item ou null (nunca undefined). */
export function findById(items, id) {
  return items.find((item) => item.id === id) ?? null;
}

/** some / every: validação de listas. */
export function hasNegative(numbers) {
  return numbers.some((n) => n < 0);
}
export function allNumbers(values) {
  return values.every((v) => typeof v === 'number' && Number.isFinite(v));
}

/** reduce: agrupa itens por chave sem mutar a entrada. */
export function groupBy(items, getKey) {
  return items.reduce((groups, item) => {
    const key = getKey(item);
    (groups[key] ??= []).push(item);
    return groups;
  }, {});
}

/** Média segura: lista vazia retorna null em vez de NaN. */
export function average(numbers) {
  const valid = numbers.filter((n) => Number.isFinite(n));
  if (valid.length === 0) return null;
  return valid.reduce((sum, n) => sum + n, 0) / valid.length;
}

/** Divide em blocos de tamanho fixo. */
export function chunk(items, size) {
  if (!Number.isInteger(size) || size < 1)
    throw new RangeError('size deve ser inteiro >= 1');
  const result = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

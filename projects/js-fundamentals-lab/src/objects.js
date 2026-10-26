// Desafios com objetos: desestruturação, spread/rest e optional chaining.

/** Desestruturação com valores padrão e renomeação. */
export function describeUser({
  name = 'Anônimo',
  age,
  address: { city = 'cidade desconhecida' } = {},
} = {}) {
  const ageText = Number.isFinite(age) ? `${age} anos` : 'idade não informada';
  return `${name}, ${ageText}, de ${city}`;
}

/** Optional chaining + nullish coalescing: nunca lança erro. */
export function getCity(user) {
  return user?.address?.city ?? 'não informada';
}

/** Spread: mescla configurações sem mutar as originais (nível raso). */
export function mergeSettings(defaults, overrides) {
  return { ...defaults, ...overrides };
}

/** Mesclagem profunda simples para objetos comuns. */
export function deepMerge(base, extra) {
  const result = { ...base };
  for (const [key, value] of Object.entries(extra ?? {})) {
    const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
    result[key] =
      isObject(value) && isObject(result[key]) ? deepMerge(result[key], value) : value;
  }
  return result;
}

/** Rest: separa uma chave do restante. */
export function omit(object, ...keys) {
  return Object.fromEntries(
    Object.entries(object).filter(([key]) => !keys.includes(key)),
  );
}

export function pick(object, ...keys) {
  return Object.fromEntries(
    keys.filter((key) => key in object).map((key) => [key, object[key]]),
  );
}

/** Rest em parâmetros. */
export function sumAll(...numbers) {
  return numbers.reduce((sum, n) => sum + (Number.isFinite(n) ? n : 0), 0);
}

/** Caminho com ponto: getPath(obj, 'a.b.c'). */
export function getPath(object, path, fallback = undefined) {
  const value = String(path)
    .split('.')
    .reduce((current, key) => current?.[key], object);
  return value === undefined ? fallback : value;
}

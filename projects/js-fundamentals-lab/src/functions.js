// Desafios de funções, escopo, closures e callbacks.

/** Closure: o estado `count` fica privado dentro da função. */
export function createCounter(start = 0, step = 1) {
  let count = start;
  return {
    increment: () => (count += step),
    decrement: () => (count -= step),
    value: () => count,
    reset: () => (count = start),
  };
}

/** Closure + HOF: executa a função apenas na primeira chamada. */
export function once(fn) {
  let called = false;
  let result;
  return (...args) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}

/** Closure: guarda resultados já calculados. */
export function memoize(fn) {
  const cache = new Map();
  return (arg) => {
    if (!cache.has(arg)) cache.set(arg, fn(arg));
    return cache.get(arg);
  };
}

/** Composição da esquerda para a direita. */
export function pipe(...fns) {
  return (input) => fns.reduce((value, fn) => fn(value), input);
}

/** Callback: o chamador decide o que fazer com cada elemento. */
export function forEachWithIndex(list, callback) {
  for (let i = 0; i < list.length; i += 1) callback(list[i], i, list);
}

/** Aplicação parcial: fixa os primeiros argumentos. */
export function partial(fn, ...fixed) {
  return (...rest) => fn(...fixed, ...rest);
}

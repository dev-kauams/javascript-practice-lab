// Comparação entre implementações: primeiro CORREÇÃO (mesma saída), depois desempenho.

export const implementations = {
  unique: {
    Set: (items) => [...new Set(items)],
    'filter + indexOf': (items) =>
      items.filter((item, index) => items.indexOf(item) === index),
    'reduce + includes': (items) =>
      items.reduce((acc, item) => (acc.includes(item) ? acc : [...acc, item]), []),
  },
  sum: {
    for: (numbers) => {
      let total = 0;
      for (let i = 0; i < numbers.length; i += 1) total += numbers[i];
      return total;
    },
    reduce: (numbers) => numbers.reduce((total, n) => total + n, 0),
    'for...of': (numbers) => {
      let total = 0;
      for (const n of numbers) total += n;
      return total;
    },
  },
};

export function makeInput(size, { distinct = 100 } = {}) {
  return Array.from({ length: size }, (_, i) => (i * 7919) % distinct);
}

/**
 * Executa cada implementação `runs` vezes, confere se todas produzem o mesmo resultado
 * e mede o tempo médio. `now` é injetável para testar sem depender do relógio real.
 */
export function compareImplementations(
  impls,
  input,
  { runs = 20, now = () => performance.now() } = {},
) {
  const entries = Object.entries(impls);
  const outputs = entries.map(([, fn]) => JSON.stringify(fn(input)));
  const agree = outputs.every((output) => output === outputs[0]);

  const results = entries.map(([name, fn]) => {
    const start = now();
    for (let i = 0; i < runs; i += 1) fn(input);
    return { name, averageMs: (now() - start) / runs };
  });
  return { agree, results: results.sort((a, b) => a.averageMs - b.averageMs) };
}

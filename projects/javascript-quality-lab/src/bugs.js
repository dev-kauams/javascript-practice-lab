// Erros comuns de JavaScript: cada item executa a versão com bug e a corrigida
// com a MESMA entrada, para que a diferença fique visível.
// Este arquivo é a única exceção às regras de lint (eqeqeq, no-var, prefer-const),
// justamente porque demonstra o que elas previnem.

/* 1. sort() sem comparador ordena como texto */
export const sortNumbersBuggy = (numbers) => [...numbers].sort();
export const sortNumbersFixed = (numbers) => [...numbers].sort((a, b) => a - b);

/* 2. == faz coerção de tipos */
export const isZeroBuggy = (value) => value == 0;
export const isZeroFixed = (value) => value === 0;

/* 3. Ponto flutuante não é exato */
export const sumEqualsBuggy = (a, b, target) => a + b === target;
export const sumEqualsFixed = (a, b, target) => Math.abs(a + b - target) < 1e-9;

/* 4. var tem escopo de função: todas as closures enxergam o mesmo i */
export function makeCountersBuggy(count) {
  var fns = [];
  for (var i = 0; i < count; i++) fns.push(() => i);
  return fns;
}
export function makeCountersFixed(count) {
  const fns = [];
  for (let i = 0; i < count; i += 1) fns.push(() => i);
  return fns;
}

/* 5. NaN nunca é igual a nada, nem a ele mesmo */
// eslint-disable-next-line use-isnan
export const isNotANumberBuggy = (value) => value === NaN;
export const isNotANumberFixed = (value) => Number.isNaN(value);

/* 6. || trata 0, '' e false como "ausente"; ?? só trata null e undefined */
export const getVolumeBuggy = (settings) => settings.volume || 50;
export const getVolumeFixed = (settings) => settings.volume ?? 50;

/* 7. Mutar o argumento recebido causa efeitos colaterais para quem chamou */
export function addTagBuggy(tags, tag) {
  tags.push(tag);
  return tags;
}
export const addTagFixed = (tags, tag) => [...tags, tag];

export const bugs = [
  {
    id: 'sort',
    title: 'sort() sem comparador',
    explanation:
      'Sem função de comparação, sort() converte os elementos em texto: "10" vem antes de "9".',
    demo: () => {
      const input = [10, 9, 1, 100];
      return {
        entrada: input,
        comBug: sortNumbersBuggy(input),
        corrigido: sortNumbersFixed(input),
      };
    },
    buggy: sortNumbersBuggy,
    fixed: sortNumbersFixed,
  },
  {
    id: 'equals',
    title: '== em vez de ===',
    explanation:
      'O operador == converte tipos antes de comparar. Use === para comparar valor e tipo.',
    demo: () => {
      const input = ['', '0', false, [], 0];
      return {
        entrada: input.map(String),
        comBug: input.map(isZeroBuggy),
        corrigido: input.map(isZeroFixed),
      };
    },
    buggy: isZeroBuggy,
    fixed: isZeroFixed,
  },
  {
    id: 'float',
    title: 'Comparar decimais com ===',
    explanation:
      '0.1 + 0.2 resulta em 0.30000000000000004. Compare com tolerância ou use inteiros (centavos).',
    demo: () => ({
      entrada: '0.1 + 0.2 = 0.3 ?',
      comBug: sumEqualsBuggy(0.1, 0.2, 0.3),
      corrigido: sumEqualsFixed(0.1, 0.2, 0.3),
    }),
    buggy: sumEqualsBuggy,
    fixed: sumEqualsFixed,
  },
  {
    id: 'closure',
    title: 'var dentro de loop com closures',
    explanation:
      'Com var existe uma única variável i; quando as funções rodam, o loop já terminou. let cria um i por iteração.',
    demo: () => ({
      entrada: 'três funções que devolvem i',
      comBug: makeCountersBuggy(3).map((fn) => fn()),
      corrigido: makeCountersFixed(3).map((fn) => fn()),
    }),
    buggy: makeCountersBuggy,
    fixed: makeCountersFixed,
  },
  {
    id: 'nan',
    title: 'Comparar com NaN',
    explanation: 'NaN === NaN é false. Use Number.isNaN(valor).',
    demo: () => {
      const value = Number('abc');
      return {
        entrada: "Number('abc')",
        comBug: isNotANumberBuggy(value),
        corrigido: isNotANumberFixed(value),
      };
    },
    buggy: isNotANumberBuggy,
    fixed: isNotANumberFixed,
  },
  {
    id: 'nullish',
    title: '|| em vez de ??',
    explanation:
      'Um volume 0 é válido, mas || o trata como ausente e devolve 50. ?? só substitui null e undefined.',
    demo: () => {
      const settings = { volume: 0 };
      return {
        entrada: settings,
        comBug: getVolumeBuggy(settings),
        corrigido: getVolumeFixed(settings),
      };
    },
    buggy: getVolumeBuggy,
    fixed: getVolumeFixed,
  },
  {
    id: 'mutation',
    title: 'Mutação do argumento',
    explanation:
      'push() altera a lista original de quem chamou. Crie uma cópia e devolva a nova lista.',
    demo: () => {
      const original = ['js'];
      addTagBuggy(original, 'css');
      const safeOriginal = ['js'];
      addTagFixed(safeOriginal, 'css');
      return {
        entrada: "['js'] + 'css'",
        comBug: `lista original ficou ${JSON.stringify(original)}`,
        corrigido: `lista original ficou ${JSON.stringify(safeOriginal)}`,
      };
    },
    buggy: addTagBuggy,
    fixed: addTagFixed,
  },
];

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as strings from '../projects/js-fundamentals-lab/src/strings.js';
import * as arrays from '../projects/js-fundamentals-lab/src/arrays.js';
import * as objects from '../projects/js-fundamentals-lab/src/objects.js';
import * as functions from '../projects/js-fundamentals-lab/src/functions.js';
import * as types from '../projects/js-fundamentals-lab/src/types.js';
import * as intl from '../projects/js-fundamentals-lab/src/intl.js';
import { groups } from '../projects/js-fundamentals-lab/src/challenges.js';

describe('strings', () => {
  test('slugify remove acentos e símbolos', () => {
    assert.equal(strings.slugify('Ação & Reação: Olá, Mundo!'), 'acao-reacao-ola-mundo');
    assert.equal(strings.slugify(null), '');
    assert.equal(strings.slugify('---'), '');
  });
  test('capitalizeWords preserva preposições', () => {
    assert.equal(
      strings.capitalizeWords('  maria  DA silva e souza '),
      'Maria da Silva e Souza',
    );
    assert.equal(strings.capitalizeWords(''), '');
  });
  test('extractEmails remove duplicados e ignora caixa', () => {
    const found = strings.extractEmails('Ana@x.com, ana@x.com e bob@loja.com.br.');
    assert.deepEqual(found, ['ana@x.com', 'bob@loja.com.br']);
    assert.deepEqual(strings.extractEmails('sem e-mails'), []);
  });
  test('isPalindrome ignora acentos e pontuação', () => {
    assert.equal(strings.isPalindrome('Socorram-me, subi no ônibus em Marrocos'), true);
    assert.equal(strings.isPalindrome('JavaScript'), false);
    assert.equal(strings.isPalindrome(''), false);
  });
  test('countWords trata espaços múltiplos e vazio', () => {
    assert.equal(strings.countWords('  um   dois\ttrês\n'), 3);
    assert.equal(strings.countWords('   '), 0);
  });
});

describe('arrays', () => {
  test('adultNames filtra, mapeia e ordena', () => {
    const people = [
      { name: 'Bia', age: 17 },
      { name: 'Caio', age: 30 },
      { name: 'Ana', age: 18 },
    ];
    assert.deepEqual(arrays.adultNames(people), ['Ana', 'Caio']);
  });
  test('totalByCategory soma por categoria', () => {
    const items = [
      { category: 'a', value: 1 },
      { category: 'b', value: 2 },
      { category: 'a', value: 3 },
    ];
    assert.deepEqual(arrays.totalByCategory(items), { a: 4, b: 2 });
    assert.deepEqual(arrays.totalByCategory([]), {});
  });
  test('findById devolve null quando não existe', () => {
    assert.equal(arrays.findById([{ id: 1 }], 9), null);
    assert.deepEqual(arrays.findById([{ id: 1 }], 1), { id: 1 });
  });
  test('some e every', () => {
    assert.equal(arrays.hasNegative([1, -1]), true);
    assert.equal(arrays.hasNegative([]), false);
    assert.equal(arrays.allNumbers([1, 2]), true);
    assert.equal(arrays.allNumbers([1, '2']), false);
    assert.equal(arrays.allNumbers([1, NaN]), false);
  });
  test('groupBy não muta a entrada', () => {
    const input = ['maçã', 'abacate', 'banana'];
    const copy = [...input];
    assert.deepEqual(
      arrays.groupBy(input, (w) => w[0]),
      { m: ['maçã'], a: ['abacate'], b: ['banana'] },
    );
    assert.deepEqual(input, copy);
  });
  test('average ignora valores inválidos e trata lista vazia', () => {
    assert.equal(arrays.average([10, null, 8]), 9);
    assert.equal(arrays.average([]), null);
  });
  test('chunk divide e valida o tamanho', () => {
    assert.deepEqual(arrays.chunk([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
    assert.throws(() => arrays.chunk([1], 0), RangeError);
    assert.throws(() => arrays.chunk([1], 1.5), RangeError);
  });
});

describe('objects', () => {
  test('describeUser aplica padrões', () => {
    assert.equal(
      objects.describeUser(),
      'Anônimo, idade não informada, de cidade desconhecida',
    );
    assert.equal(
      objects.describeUser({ name: 'Lia', age: 29, address: { city: 'Santos' } }),
      'Lia, 29 anos, de Santos',
    );
  });
  test('getCity nunca lança erro', () => {
    assert.equal(objects.getCity(null), 'não informada');
    assert.equal(objects.getCity({ address: { city: 'Rio' } }), 'Rio');
  });
  test('deepMerge e mergeSettings não mutam as originais', () => {
    const base = { a: { x: 1, y: 2 }, b: 1 };
    const merged = objects.deepMerge(base, { a: { y: 9 }, c: 3 });
    assert.deepEqual(merged, { a: { x: 1, y: 9 }, b: 1, c: 3 });
    assert.deepEqual(base, { a: { x: 1, y: 2 }, b: 1 });
    assert.deepEqual(objects.mergeSettings({ a: 1 }, { b: 2 }), { a: 1, b: 2 });
  });
  test('omit, pick, sumAll e getPath', () => {
    assert.deepEqual(objects.omit({ a: 1, b: 2 }, 'a'), { b: 2 });
    assert.deepEqual(objects.pick({ a: 1, b: 2 }, 'a', 'z'), { a: 1 });
    assert.equal(objects.sumAll(1, 2, 'x', NaN, 4), 7);
    assert.equal(objects.getPath({ a: { b: 5 } }, 'a.b'), 5);
    assert.equal(objects.getPath({ a: null }, 'a.b.c', 'padrão'), 'padrão');
    assert.equal(objects.getPath({ a: 0 }, 'a', 'padrão'), 0);
  });
});

describe('functions', () => {
  test('createCounter mantém estado privado', () => {
    const counter = functions.createCounter(5, 2);
    counter.increment();
    counter.decrement();
    counter.increment();
    assert.equal(counter.value(), 7);
    assert.equal(counter.reset(), 5);
  });
  test('once executa uma única vez', () => {
    let calls = 0;
    const fn = functions.once((x) => ((calls += 1), x));
    assert.equal(fn('a'), 'a');
    assert.equal(fn('b'), 'a');
    assert.equal(calls, 1);
  });
  test('memoize reaproveita resultados', () => {
    let calls = 0;
    const square = functions.memoize((n) => ((calls += 1), n * n));
    assert.deepEqual([square(3), square(3), square(4)], [9, 9, 16]);
    assert.equal(calls, 2);
  });
  test('pipe, partial e forEachWithIndex', () => {
    assert.equal(
      functions.pipe(
        (x) => x + 1,
        (x) => x * 2,
      )(3),
      8,
    );
    assert.equal(functions.partial((a, b, c) => a + b + c, 1, 2)(3), 6);
    const seen = [];
    functions.forEachWithIndex(['a', 'b'], (v, i) => seen.push(`${i}${v}`));
    assert.deepEqual(seen, ['0a', '1b']);
  });
});

describe('types', () => {
  test('typeOf distingue null, array e data', () => {
    assert.equal(types.typeOf(null), 'null');
    assert.equal(types.typeOf([]), 'array');
    assert.equal(types.typeOf(new Date('x')), 'invalid-date');
    assert.equal(types.typeOf(new Date()), 'date');
    assert.equal(types.typeOf(1), 'number');
  });
  test('toNumberStrict aceita pt-BR e rejeita ambíguos', () => {
    assert.equal(types.toNumberStrict('12,5'), 12.5);
    assert.equal(types.toNumberStrict('1.234,56'), 1234.56);
    assert.equal(types.toNumberStrict(' 7 '), 7);
    assert.equal(types.toNumberStrict('abc'), null);
    assert.equal(types.toNumberStrict(''), null);
    assert.equal(types.toNumberStrict('1e3'), null);
    assert.equal(types.toNumberStrict(NaN), null);
    assert.equal(types.toNumberStrict(null), null);
  });
  test('isBlank, parseBoolean e toPositiveInt', () => {
    assert.equal(types.isBlank('  '), true);
    assert.equal(types.isBlank(0), false);
    assert.equal(types.parseBoolean('Sim'), true);
    assert.equal(types.parseBoolean('off'), false);
    assert.equal(types.parseBoolean('talvez'), null);
    assert.equal(types.toPositiveInt('5'), 5);
    assert.equal(types.toPositiveInt('-3'), null);
    assert.equal(types.toPositiveInt('2.5'), null);
  });
});

describe('intl', () => {
  test('formatCurrency em BRL (espaço inseparável) e entrada inválida', () => {
    assert.equal(intl.formatCurrency(1234.5).replace(/\s/g, ' '), 'R$ 1.234,50');
    assert.equal(intl.formatCurrency(NaN), '—');
  });
  test('formatDate usa UTC e trata data inválida', () => {
    assert.equal(
      intl.formatDate('2026-10-24', 'pt-BR', { dateStyle: 'short' }),
      '24/10/2026',
    );
    assert.equal(intl.formatDate('lixo'), '—');
  });
  test('formatPercent, relativeTime e formatList', () => {
    assert.equal(intl.formatPercent(0.4275).replace(/\s/g, ' '), '42,8%');
    assert.equal(intl.relativeTime(-259200), 'há 3 dias');
    assert.equal(intl.formatList(['HTML', 'CSS', 'JS']), 'HTML, CSS e JS');
  });
});

describe('registro de desafios', () => {
  test('todo exemplo executa sem lançar erro', () => {
    for (const group of groups) {
      for (const challenge of group.challenges) {
        assert.doesNotThrow(
          () => challenge.run(challenge.example),
          `${challenge.title} falhou`,
        );
      }
    }
  });
});

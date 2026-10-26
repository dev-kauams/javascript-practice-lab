import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ValidationError,
  assertPositiveInteger,
  parseConfig,
  safeJsonParse,
  withFallback,
} from '../projects/javascript-quality-lab/src/errors.js';
import {
  normalizeEmail,
  normalizeUser,
  parseAge,
} from '../projects/javascript-quality-lab/src/validation.js';
import {
  formatPerson,
  legacy,
  refactored,
} from '../projects/javascript-quality-lab/src/refactor.js';
import {
  compareImplementations,
  implementations,
  makeInput,
} from '../projects/javascript-quality-lab/src/compare.js';
import * as bugModule from '../projects/javascript-quality-lab/src/bugs.js';

const { bugs } = bugModule;

describe('validação e transformação', () => {
  test('parseAge', () => {
    assert.equal(parseAge('25'), 25);
    assert.equal(parseAge(' 25 '), 25);
    assert.equal(parseAge(0), 0);
    for (const bad of [
      '',
      'abc',
      '-1',
      '25.5',
      '1e2',
      200,
      -3,
      2.5,
      null,
      undefined,
      NaN,
      [],
      {},
    ]) {
      assert.equal(parseAge(bad), null, `${JSON.stringify(bad)} deveria ser inválido`);
    }
  });
  test('normalizeEmail', () => {
    assert.equal(normalizeEmail('  ANA@Exemplo.COM '), 'ana@exemplo.com');
    assert.equal(normalizeEmail('sem-arroba'), null);
    assert.equal(normalizeEmail(null), null);
  });
  test('normalizeUser limpa dados válidos', () => {
    const result = normalizeUser({
      name: '  Ana   Souza ',
      email: 'ANA@x.com',
      age: '29',
      tags: ['JS', ' js ', '', 'CSS'],
    });
    assert.deepEqual(result, {
      ok: true,
      value: { name: 'Ana Souza', email: 'ana@x.com', age: 29, tags: ['js', 'css'] },
    });
  });
  test('normalizeUser reporta todos os erros e aceita entrada inesperada', () => {
    const result = normalizeUser({ name: 'A', email: 'x', age: 'dez' });
    assert.deepEqual(Object.keys(result.errors).sort(), ['age', 'email', 'name']);
    for (const raw of [null, undefined, 'texto', 42, []])
      assert.equal(normalizeUser(raw).ok, false);
  });
});

describe('tratamento de exceções', () => {
  test('safeJsonParse devolve Result sem lançar e preserva a causa', () => {
    assert.deepEqual(safeJsonParse('{"a":1}'), { ok: true, value: { a: 1 } });
    const bad = safeJsonParse('{a');
    assert.equal(bad.ok, false);
    assert.ok(bad.error instanceof ValidationError);
    assert.ok(bad.error.cause instanceof SyntaxError);
  });
  test('assertPositiveInteger lança ValidationError com o campo', () => {
    assert.equal(assertPositiveInteger(3, 'porta'), 3);
    for (const bad of [0, -1, 1.5, '3', NaN, null]) {
      assert.throws(
        () => assertPositiveInteger(bad, 'porta'),
        (error) => error instanceof ValidationError && error.field === 'porta',
      );
    }
  });
  test('withFallback usa o valor de reserva e avisa o erro', () => {
    const seen = [];
    assert.equal(
      withFallback(
        () => JSON.parse('x'),
        'reserva',
        (e) => seen.push(e.name),
      ),
      'reserva',
    );
    assert.deepEqual(seen, ['SyntaxError']);
    assert.equal(
      withFallback(() => 1, 0),
      1,
    );
  });
  test('parseConfig valida formato, porta e host', () => {
    assert.deepEqual(parseConfig('{"host":" localhost ","porta":3000}'), {
      ok: true,
      value: { host: 'localhost', porta: 3000 },
    });
    assert.match(parseConfig('{quebrado').error.message, /JSON inválido/);
    assert.match(parseConfig('[]').error.message, /objeto/);
    assert.match(parseConfig('null').error.message, /objeto/);
    assert.match(parseConfig('{"host":"a","porta":-1}').error.message, /porta/);
    assert.match(parseConfig('{"porta":80}').error.message, /host/);
    assert.match(parseConfig('{"host":"  ","porta":80}').error.message, /host/);
  });
});

describe('refatoração preserva o comportamento', () => {
  const people = [
    { firstName: 'Ana', lastName: 'Souza' },
    { firstName: ' Ana ', lastName: 'Souza ' },
    { firstName: 'Ana' },
    { firstName: '', lastName: 'X' },
    {},
    null,
    undefined,
  ];
  for (const name of ['formatClient', 'formatSupplier', 'formatEmployee']) {
    test(`${name}: versão refatorada = versão antiga`, () => {
      for (const person of people)
        assert.equal(refactored[name](person), legacy[name](person));
    });
  }
  test('formatPerson rejeita papel desconhecido', () => {
    assert.throws(() => formatPerson({ firstName: 'A' }, 'alien'), RangeError);
  });
});

describe('comparação de implementações', () => {
  test('todas as implementações de cada problema concordam em várias entradas', () => {
    for (const impls of Object.values(implementations)) {
      for (const input of [[], [1], makeInput(500), [3, 3, 3], [5, 1, 5, 2, 1]]) {
        assert.equal(compareImplementations(impls, input, { runs: 1 }).agree, true);
      }
    }
  });
  test('detecta implementações que divergem', () => {
    const impls = { certa: (list) => list.length, errada: (list) => list.length + 1 };
    assert.equal(compareImplementations(impls, [1, 2], { runs: 1 }).agree, false);
  });
  test('mede com relógio injetado e ordena do mais rápido ao mais lento', () => {
    const impls = { lenta: () => 1, rapida: () => 1 };
    const ticks = [0, 10, 10, 12]; // lenta: 10ms em 2 execuções, rápida: 2ms
    const now = () => ticks.shift();
    const { results } = compareImplementations(impls, [], { runs: 2, now });
    assert.deepEqual(
      results.map((r) => r.name),
      ['rapida', 'lenta'],
    );
    assert.deepEqual(
      results.map((r) => r.averageMs),
      [1, 5],
    );
  });
  test('unique mantém a ordem da primeira ocorrência', () => {
    for (const fn of Object.values(implementations.unique))
      assert.deepEqual(fn([3, 1, 3, 2, 1]), [3, 1, 2]);
  });
});

describe('caça-bugs: a versão com bug realmente falha, a corrigida acerta', () => {
  test('sort sem comparador ordena como texto', () => {
    assert.deepEqual(bugModule.sortNumbersBuggy([10, 9, 1]), [1, 10, 9]);
    assert.deepEqual(bugModule.sortNumbersFixed([10, 9, 1]), [1, 9, 10]);
  });
  test('== faz coerção', () => {
    assert.equal(bugModule.isZeroBuggy(''), true);
    assert.equal(bugModule.isZeroFixed(''), false);
    assert.equal(bugModule.isZeroFixed(0), true);
  });
  test('ponto flutuante', () => {
    assert.equal(bugModule.sumEqualsBuggy(0.1, 0.2, 0.3), false);
    assert.equal(bugModule.sumEqualsFixed(0.1, 0.2, 0.3), true);
    assert.equal(bugModule.sumEqualsFixed(0.1, 0.2, 0.31), false);
  });
  test('var em closures', () => {
    assert.deepEqual(
      bugModule.makeCountersBuggy(3).map((f) => f()),
      [3, 3, 3],
    );
    assert.deepEqual(
      bugModule.makeCountersFixed(3).map((f) => f()),
      [0, 1, 2],
    );
  });
  test('NaN', () => {
    assert.equal(bugModule.isNotANumberBuggy(NaN), false);
    assert.equal(bugModule.isNotANumberFixed(NaN), true);
    assert.equal(bugModule.isNotANumberFixed(1), false);
  });
  test('|| versus ??', () => {
    assert.equal(bugModule.getVolumeBuggy({ volume: 0 }), 50);
    assert.equal(bugModule.getVolumeFixed({ volume: 0 }), 0);
    assert.equal(bugModule.getVolumeFixed({}), 50);
  });
  test('mutação do argumento', () => {
    const a = ['js'];
    bugModule.addTagBuggy(a, 'css');
    assert.deepEqual(a, ['js', 'css']);
    const b = ['js'];
    assert.deepEqual(bugModule.addTagFixed(b, 'css'), ['js', 'css']);
    assert.deepEqual(b, ['js']);
  });
  test('todo item do catálogo tem demonstração com resultados diferentes', () => {
    assert.equal(bugs.length, 7);
    for (const bug of bugs) {
      const { comBug, corrigido } = bug.demo();
      assert.notDeepEqual(
        comBug,
        corrigido,
        `${bug.id}: bug e correção deveriam diferir`,
      );
    }
  });
});

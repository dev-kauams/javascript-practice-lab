import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCents,
  multiplyCents,
  parsePriceToCents,
  sumCents,
} from '../projects/shopping-cart/src/money.js';
import {
  PRODUCTS,
  filterProducts,
  sortProducts,
} from '../projects/shopping-cart/src/catalog.js';
import {
  MAX_QUANTITY,
  addToCart,
  cartLines,
  cartTotals,
  normalizeQuantity,
  removeFromCart,
  setQuantity,
} from '../projects/shopping-cart/src/cart.js';
import {
  STORAGE_KEY,
  loadCart,
  sanitizeCart,
  saveCart,
} from '../projects/shopping-cart/src/storage.js';

const brl = (cents) => formatCents(cents).replace(/\s/g, ' ');

describe('dinheiro em centavos', () => {
  test('o problema clássico: decimais acumulam erro, centavos não', () => {
    assert.notEqual(0.1 + 0.2, 0.3); // ponto flutuante
    assert.equal(sumCents([parsePriceToCents('0,10'), parsePriceToCents('0,20')]), 30);
    assert.equal(brl(sumCents([10, 20])), 'R$ 0,30');
    // 3 × R$ 19,99 = R$ 59,97 exatos
    assert.equal(multiplyCents(1999, 3), 5997);
    assert.equal(1.1 * 3, 3.3000000000000003);
  });
  test('parsePriceToCents entende formatos pt-BR e internacionais', () => {
    assert.equal(parsePriceToCents('19,90'), 1990);
    assert.equal(parsePriceToCents('19.90'), 1990);
    assert.equal(parsePriceToCents('R$ 1.234,56'), 123456);
    assert.equal(parsePriceToCents('1.234'), 123400);
    assert.equal(parsePriceToCents('5'), 500);
    assert.equal(parsePriceToCents('0,5'), 50);
    assert.equal(parsePriceToCents(19.9), 1990);
    assert.equal(parsePriceToCents(0), 0);
  });
  test('parsePriceToCents rejeita entradas inválidas', () => {
    for (const bad of [
      '',
      '  ',
      'abc',
      '-5',
      '1,234',
      '1,2,3',
      '12.345,678',
      '1e3',
      null,
      undefined,
      NaN,
      Infinity,
      -1,
      {},
      1.005,
      '9999999999',
    ]) {
      assert.equal(parsePriceToCents(bad), null, `${String(bad)} deveria ser inválido`);
    }
  });
  test('formatCents usa Intl e trata valor ausente', () => {
    assert.equal(brl(123456), 'R$ 1.234,56');
    assert.equal(brl(5), 'R$ 0,05');
    assert.equal(brl(0), 'R$ 0,00');
    assert.equal(formatCents(undefined), '—');
    assert.equal(formatCents(10.5), '—');
    assert.equal(formatCents(NaN), '—');
  });
});

describe('catálogo', () => {
  test('todos os preços do catálogo são centavos inteiros e ids são únicos', () => {
    assert.ok(
      PRODUCTS.every((p) => Number.isSafeInteger(p.priceCents) && p.priceCents > 0),
    );
    assert.equal(new Set(PRODUCTS.map((p) => p.id)).size, PRODUCTS.length);
  });
  test('filterProducts por texto sem acento e categoria', () => {
    assert.deepEqual(
      filterProducts(PRODUCTS, { query: 'MECANICO' }).map((p) => p.id),
      ['kb-01'],
    );
    assert.ok(
      filterProducts(PRODUCTS, { category: 'Áudio' }).every(
        (p) => p.category === 'Áudio',
      ),
    );
    assert.deepEqual(filterProducts(PRODUCTS, { query: 'inexistente' }), []);
    assert.equal(filterProducts(PRODUCTS).length, PRODUCTS.length);
  });
  test('sortProducts por preço e nome sem mutar o catálogo', () => {
    const original = PRODUCTS.map((p) => p.id);
    const asc = sortProducts(PRODUCTS, 'price-asc').map((p) => p.priceCents);
    assert.deepEqual(
      asc,
      [...asc].sort((a, b) => a - b),
    );
    const desc = sortProducts(PRODUCTS, 'price-desc').map((p) => p.priceCents);
    assert.deepEqual(
      desc,
      [...desc].sort((a, b) => b - a),
    );
    const names = sortProducts(PRODUCTS, 'name').map((p) => p.name);
    assert.deepEqual(
      names,
      [...names].sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })),
    );
    assert.deepEqual(
      PRODUCTS.map((p) => p.id),
      original,
    );
  });
});

describe('carrinho', () => {
  test('normalizeQuantity aceita só inteiros de 1 a 99', () => {
    assert.equal(normalizeQuantity(3), 3);
    assert.equal(normalizeQuantity('7'), 7);
    for (const bad of [0, -1, 1.5, 100, '', '  ', 'abc', NaN, null, undefined, '2.5']) {
      assert.equal(normalizeQuantity(bad), null, `${String(bad)} deveria ser inválido`);
    }
  });
  test('addToCart soma quantidades, respeita o máximo e não muta', () => {
    const empty = [];
    const once = addToCart(empty, 'a');
    assert.deepEqual(empty, []);
    assert.deepEqual(addToCart(once, 'a', 2), [{ productId: 'a', quantity: 3 }]);
    assert.equal(
      addToCart([{ productId: 'a', quantity: 98 }], 'a', 5)[0].quantity,
      MAX_QUANTITY,
    );
    assert.deepEqual(addToCart(once, 'b', 0), once);
  });
  test('setQuantity rejeita inválidos sem alterar o carrinho', () => {
    const cart = [{ productId: 'a', quantity: 2 }];
    assert.deepEqual(setQuantity(cart, 'a', '5'), {
      cart: [{ productId: 'a', quantity: 5 }],
      error: '',
    });
    for (const bad of ['', '0', '-1', '1.5', 'x']) {
      const result = setQuantity(cart, 'a', bad);
      assert.equal(result.cart, cart);
      assert.match(result.error, /1 a 99/);
    }
  });
  test('removeFromCart', () => {
    assert.deepEqual(removeFromCart([{ productId: 'a', quantity: 1 }], 'a'), []);
  });
  test('cartLines deriva preços do catálogo e ignora produtos que não existem mais', () => {
    const cart = [
      { productId: 'cb-01', quantity: 3 },
      { productId: 'fantasma', quantity: 1 },
    ];
    const lines = cartLines(cart, PRODUCTS);
    assert.equal(lines.length, 1);
    assert.equal(lines[0].subtotalCents, 3 * 3990);
  });
  test('cartTotals soma centavos exatamente', () => {
    const cart = [
      { productId: 'cb-01', quantity: 3 }, // 3 × 39,90
      { productId: 'cb-02', quantity: 2 }, // 2 × 89,50
      { productId: 'ch-01', quantity: 1 }, // 69,90
    ];
    const totals = cartTotals(cartLines(cart, PRODUCTS));
    assert.equal(totals.itemCount, 6);
    assert.equal(totals.totalCents, 11970 + 17900 + 6990);
    assert.equal(brl(totals.totalCents), 'R$ 368,60');
    assert.deepEqual(cartTotals([]), { itemCount: 0, totalCents: 0 });
  });
});

describe('persistência', () => {
  const fake = (initial) => {
    const data = new Map(initial ? [[STORAGE_KEY, initial]] : []);
    return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) };
  };
  test('ida e volta', () => {
    const storage = fake();
    const cart = [{ productId: 'a', quantity: 2 }];
    assert.equal(saveCart(storage, cart), true);
    assert.deepEqual(loadCart(storage), { cart, status: 'loaded' });
  });
  test('ausente, corrompido e indisponível', () => {
    assert.deepEqual(loadCart(fake()), { cart: [], status: 'empty' });
    assert.deepEqual(loadCart(fake('{ruim')), { cart: [], status: 'corrupted' });
    const blocked = {
      getItem: () => {
        throw new DOMException('bloqueado', 'SecurityError');
      },
    };
    assert.equal(loadCart(blocked).status, 'unavailable');
    assert.equal(
      saveCart(
        {
          setItem: () => {
            throw new Error('cheio');
          },
        },
        [],
      ),
      false,
    );
  });
  test('sanitizeCart remove itens inválidos, quantidades absurdas e duplicados', () => {
    const raw = [
      { productId: 'a', quantity: 2 },
      { productId: 'a', quantity: 5 },
      { productId: 'b', quantity: -1 },
      { productId: 'c', quantity: 1000 },
      { productId: 7, quantity: 1 },
      null,
      'x',
    ];
    assert.deepEqual(sanitizeCart(raw), [{ productId: 'a', quantity: 2 }]);
    assert.deepEqual(sanitizeCart({ nao: 'lista' }), []);
  });
});

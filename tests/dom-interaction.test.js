import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  addItem,
  clampCount,
  matchesShortcut,
  nextTabIndex,
  normalizeItemText,
  remainingChars,
  removeItem,
  shouldAnnounceRemaining,
  updateItem,
} from '../projects/dom-interaction-lab/src/logic.js';

const ids = () => {
  let n = 0;
  return () => `id-${(n += 1)}`;
};

describe('contador', () => {
  test('clampCount respeita limites e entradas inválidas', () => {
    assert.equal(clampCount(5, 0, 10), 5);
    assert.equal(clampCount(-3, 0, 10), 0);
    assert.equal(clampCount(99, 0, 10), 10);
    assert.equal(clampCount('abc', 2, 10), 2);
    assert.equal(clampCount(3.9, 0, 10), 3);
  });
});

describe('contador de caracteres', () => {
  test('remainingChars conta emojis como um caractere', () => {
    assert.deepEqual(remainingChars('olá', 10), { used: 3, remaining: 7, over: false });
    assert.equal(remainingChars('😀😀', 10).used, 2);
    assert.equal(remainingChars('x'.repeat(12), 10).over, true);
    assert.equal(remainingChars(null, 10).used, 0);
  });
  test('shouldAnnounceRemaining só dispara ao cruzar limiares', () => {
    assert.equal(shouldAnnounceRemaining(25, 20), true);
    assert.equal(shouldAnnounceRemaining(20, 19), false);
    assert.equal(shouldAnnounceRemaining(11, 10), true);
    assert.equal(shouldAnnounceRemaining(1, 0), true);
    assert.equal(shouldAnnounceRemaining(50, 49), false);
  });
});

describe('tabs', () => {
  test('nextTabIndex navega circularmente', () => {
    assert.equal(nextTabIndex(0, 'ArrowRight', 3), 1);
    assert.equal(nextTabIndex(2, 'ArrowRight', 3), 0);
    assert.equal(nextTabIndex(0, 'ArrowLeft', 3), 2);
    assert.equal(nextTabIndex(1, 'Home', 3), 0);
    assert.equal(nextTabIndex(1, 'End', 3), 2);
    assert.equal(nextTabIndex(1, 'Enter', 3), null);
    assert.equal(nextTabIndex(0, 'ArrowRight', 0), null);
  });
});

describe('atalhos', () => {
  const press = (key, mods = {}, code = '') => ({
    key,
    code,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    ...mods,
  });
  test('combina modificadores exatos', () => {
    assert.equal(matchesShortcut(press('n', { altKey: true }), 'alt+n'), true);
    assert.equal(matchesShortcut(press('n'), 'alt+n'), false);
    assert.equal(
      matchesShortcut(press('n', { altKey: true, ctrlKey: true }), 'alt+n'),
      false,
    );
  });
  test('shift é implícito em "?"', () => {
    assert.equal(matchesShortcut(press('?', { shiftKey: true }), '?'), true);
    assert.equal(matchesShortcut(press('?', { ctrlKey: true }), '?'), false);
  });
  test('usa event.code quando Alt altera a tecla (macOS)', () => {
    assert.equal(matchesShortcut(press('ñ', { altKey: true }, 'KeyN'), 'alt+n'), true);
  });
});

describe('lista', () => {
  test('addItem normaliza, valida e impede duplicados sem mutar', () => {
    const start = [];
    const first = addItem(start, '  Estudar   DOM ', ids());
    assert.deepEqual(first.items, [{ id: 'id-1', text: 'Estudar DOM' }]);
    assert.deepEqual(start, []);
    assert.match(addItem(first.items, 'estudar dom').error, /já existe/);
    assert.match(addItem(first.items, '   ').error, /Digite/);
    assert.match(addItem(first.items, 'x'.repeat(81)).error, /80/);
  });
  test('updateItem permite manter o próprio texto e bloqueia colisão', () => {
    const items = [
      { id: 'a', text: 'Um' },
      { id: 'b', text: 'Dois' },
    ];
    assert.equal(updateItem(items, 'a', 'Um').error, '');
    assert.match(updateItem(items, 'a', 'dois').error, /outro item/);
    assert.match(updateItem(items, 'a', '  ').error, /vazio/);
    assert.equal(updateItem(items, 'a', 'Novo').items[0].text, 'Novo');
  });
  test('removeItem e normalizeItemText', () => {
    assert.deepEqual(removeItem([{ id: 'a' }, { id: 'b' }], 'a'), [{ id: 'b' }]);
    assert.deepEqual(removeItem([{ id: 'a' }], 'zzz'), [{ id: 'a' }]);
    assert.equal(normalizeItemText(undefined), '');
  });
});

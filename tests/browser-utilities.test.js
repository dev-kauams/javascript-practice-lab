import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_RULES,
  effectiveType,
  formatBytes,
  prettyText,
  previewKind,
  validateFile,
} from '../projects/browser-utilities-lab/src/files.js';
import {
  buildSearch,
  parseParams,
  removeParam,
  setParam,
} from '../projects/browser-utilities-lab/src/params.js';
import {
  isValidPreference,
  resolveTheme,
  safeStorage,
} from '../projects/browser-utilities-lab/src/theme.js';
import {
  COPY_MESSAGES,
  copyText,
} from '../projects/browser-utilities-lab/src/clipboard.js';

describe('arquivos', () => {
  test('formatBytes', () => {
    assert.equal(formatBytes(0), '0 B');
    assert.equal(formatBytes(1023), '1023 B');
    assert.equal(formatBytes(1536), '1,5 KB');
    assert.equal(formatBytes(2 * 1024 * 1024), '2 MB');
    assert.equal(formatBytes(-1), '—');
    assert.equal(formatBytes(NaN), '—');
  });
  test('effectiveType usa a extensão quando o tipo vem vazio', () => {
    assert.equal(effectiveType({ name: 'foto.JPG', type: '' }), 'image/jpeg');
    assert.equal(effectiveType({ name: 'dados.json', type: '' }), 'application/json');
    assert.equal(effectiveType({ name: 'semextensao', type: '' }), '');
    assert.equal(effectiveType({ name: 'a.png', type: 'image/png' }), 'image/png');
  });
  test('validateFile aceita arquivos permitidos', () => {
    assert.deepEqual(validateFile({ name: 'a.png', type: 'image/png', size: 1000 }), {
      ok: true,
      type: 'image/png',
    });
    assert.equal(validateFile({ name: 'a.txt', type: '', size: 10 }).ok, true);
  });
  test('validateFile rejeita ausente, vazio, tipo e tamanho', () => {
    assert.equal(validateFile(undefined).ok, false);
    assert.match(
      validateFile({ name: 'a.png', type: 'image/png', size: 0 }).error,
      /vazio/,
    );
    assert.match(
      validateFile({ name: 'a.exe', type: 'application/x-msdownload', size: 5 }).error,
      /Tipo não permitido/,
    );
    assert.match(
      validateFile({ name: 'a.svg', type: 'image/svg+xml', size: 5 }).error,
      /Tipo não permitido/,
    );
    assert.match(
      validateFile({ name: 'a.png', type: 'image/png', size: DEFAULT_RULES.maxBytes + 1 })
        .error,
      /limite/,
    );
    assert.equal(
      validateFile({ name: 'a.png', type: 'image/png', size: DEFAULT_RULES.maxBytes }).ok,
      true,
    );
  });
  test('previewKind e prettyText', () => {
    assert.equal(previewKind('image/gif'), 'image');
    assert.equal(previewKind('application/json'), 'text');
    assert.equal(previewKind('application/pdf'), null);
    assert.equal(prettyText('{"a":1}', 'application/json'), '{\n  "a": 1\n}');
    assert.equal(prettyText('{quebrado', 'application/json'), '{quebrado');
    assert.equal(prettyText('{"a":1}', 'text/plain'), '{"a":1}');
  });
});

describe('parâmetros da URL', () => {
  test('parseParams lê repetidos, acentos e valores vazios', () => {
    assert.deepEqual(parseParams('?a=1&b=ol%C3%A1&a=3&c='), [
      { key: 'a', value: '1' },
      { key: 'b', value: 'olá' },
      { key: 'a', value: '3' },
      { key: 'c', value: '' },
    ]);
    assert.deepEqual(parseParams(''), []);
  });
  test('buildSearch codifica e faz ida e volta', () => {
    const entries = [
      { key: 'q', value: 'c++ & rust' },
      { key: 'x', value: 'ç' },
    ];
    assert.deepEqual(parseParams(buildSearch(entries)), entries);
    assert.equal(buildSearch([]), '');
  });
  test('setParam substitui, valida e não muta', () => {
    const start = [{ key: 'a', value: '1' }];
    const result = setParam(start, ' a ', '2');
    assert.deepEqual(result.entries, [{ key: 'a', value: '2' }]);
    assert.deepEqual(start, [{ key: 'a', value: '1' }]);
    assert.match(setParam(start, '  ', 'x').error, /nome/);
    assert.match(setParam(start, 'k'.repeat(51), 'x').error, /50/);
    assert.deepEqual(removeParam(start, 'a'), []);
  });
});

describe('tema e armazenamento', () => {
  test('resolveTheme', () => {
    assert.equal(resolveTheme('light', true), 'light');
    assert.equal(resolveTheme('dark', false), 'dark');
    assert.equal(resolveTheme('system', true), 'dark');
    assert.equal(resolveTheme('system', false), 'light');
    assert.equal(resolveTheme('lixo', false), 'dark');
    assert.equal(resolveTheme(null, false), 'dark');
  });
  test('isValidPreference', () => {
    assert.equal(isValidPreference('system'), true);
    assert.equal(isValidPreference('azul'), false);
  });
  test('safeStorage funciona com storage normal', () => {
    const data = new Map();
    const storage = safeStorage(() => ({
      getItem: (k) => data.get(k) ?? null,
      setItem: (k, v) => data.set(k, v),
    }));
    assert.equal(storage.available, true);
    assert.equal(storage.set('k', 'v'), true);
    assert.equal(storage.get('k'), 'v');
    assert.equal(storage.get('nada'), null);
  });
  test('safeStorage sobrevive a acesso bloqueado e cota excedida', () => {
    const blocked = safeStorage(() => {
      throw new DOMException('bloqueado', 'SecurityError');
    });
    assert.equal(blocked.available, false);
    assert.equal(blocked.get('k'), null);
    assert.equal(blocked.set('k', 'v'), false);
    const full = safeStorage(() => ({
      getItem: () => {
        throw new Error('x');
      },
      setItem: () => {
        throw new DOMException('cheio', 'QuotaExceededError');
      },
    }));
    assert.equal(full.get('k'), null);
    assert.equal(full.set('k', 'v'), false);
  });
});

describe('área de transferência', () => {
  const noFallback = () => false;
  test('sucesso pela API moderna', async () => {
    let copied = '';
    const clipboard = { writeText: async (t) => (copied = t) };
    assert.deepEqual(await copyText('oi', { clipboard, fallback: noFallback }), {
      ok: true,
      via: 'clipboard',
    });
    assert.equal(copied, 'oi');
  });
  test('texto vazio não copia', async () => {
    assert.deepEqual(
      await copyText('', {
        clipboard: { writeText: async () => {} },
        fallback: noFallback,
      }),
      { ok: false, reason: 'empty' },
    );
  });
  test('permissão negada usa o plano B e, se falhar, informa "denied"', async () => {
    const clipboard = {
      writeText: async () => {
        throw new DOMException('negado', 'NotAllowedError');
      },
    };
    assert.deepEqual(await copyText('oi', { clipboard, fallback: () => true }), {
      ok: true,
      via: 'fallback',
    });
    assert.deepEqual(await copyText('oi', { clipboard, fallback: noFallback }), {
      ok: false,
      reason: 'denied',
    });
  });
  test('erro inesperado informa "error" quando o plano B também falha', async () => {
    const clipboard = {
      writeText: async () => {
        throw new Error('boom');
      },
    };
    assert.deepEqual(await copyText('oi', { clipboard, fallback: noFallback }), {
      ok: false,
      reason: 'error',
    });
  });
  test('API ausente (contexto inseguro) usa o plano B ou informa "unavailable"', async () => {
    assert.deepEqual(
      await copyText('oi', { clipboard: undefined, fallback: () => true }),
      { ok: true, via: 'fallback' },
    );
    assert.deepEqual(
      await copyText('oi', { clipboard: undefined, fallback: noFallback }),
      { ok: false, reason: 'unavailable' },
    );
  });
  test('toda razão de falha tem mensagem para o usuário', () => {
    for (const reason of ['empty', 'denied', 'unavailable', 'error'])
      assert.ok(COPY_MESSAGES[reason]);
  });
});

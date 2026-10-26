import { test, describe, mock } from 'node:test';
import assert from 'node:assert/strict';
import {
  HttpError,
  InvalidResponseError,
  NetworkError,
  buildSearchUrl,
  describeError,
  parseSearchResponse,
  searchBooks,
} from '../projects/api-explorer/src/api.js';
import { debounce } from '../projects/api-explorer/src/debounce.js';
import {
  filterBooks,
  sortBooksLocal,
  totalPages,
} from '../projects/api-explorer/src/transform.js';
import { readState, toSearch } from '../projects/api-explorer/src/url-state.js';

const okResponse = (body) => ({ ok: true, status: 200, json: async () => body });
const sample = {
  numFound: 2,
  docs: [
    {
      key: '/works/OL1W',
      title: 'Dom Casmurro',
      author_name: ['Machado de Assis'],
      first_publish_year: 1899,
      cover_i: 123,
    },
    { key: '/works/OL2W', title: 'Sem dados' },
    { title: 'Sem chave' },
  ],
};

describe('buildSearchUrl', () => {
  test('codifica a consulta e omite sort=relevance', () => {
    const url = new URL(buildSearchUrl({ query: ' c++ & rust ', page: 2 }));
    assert.equal(url.searchParams.get('q'), 'c++ & rust');
    assert.equal(url.searchParams.get('page'), '2');
    assert.equal(url.searchParams.get('limit'), '12');
    assert.equal(url.searchParams.has('sort'), false);
  });
  test('inclui sort válido e ignora inválido', () => {
    assert.equal(
      new URL(buildSearchUrl({ query: 'a', sort: 'new' })).searchParams.get('sort'),
      'new',
    );
    assert.equal(
      new URL(buildSearchUrl({ query: 'a', sort: 'hack' })).searchParams.has('sort'),
      false,
    );
  });
});

describe('parseSearchResponse', () => {
  test('normaliza itens e descarta os malformados', () => {
    const { total, books } = parseSearchResponse(sample);
    assert.equal(total, 2);
    assert.equal(books.length, 2);
    assert.deepEqual(books[0], {
      id: '/works/OL1W',
      title: 'Dom Casmurro',
      authors: ['Machado de Assis'],
      year: 1899,
      coverUrl: 'https://covers.openlibrary.org/b/id/123-M.jpg',
    });
    assert.deepEqual(books[1], {
      id: '/works/OL2W',
      title: 'Sem dados',
      authors: [],
      year: null,
      coverUrl: null,
    });
  });
  test('formatos inesperados lançam InvalidResponseError', () => {
    for (const bad of [null, 'texto', 42, {}, { docs: 'x' }]) {
      assert.throws(() => parseSearchResponse(bad), InvalidResponseError);
    }
  });
});

describe('searchBooks (fetch simulado, sem rede)', () => {
  test('sucesso devolve livros', async () => {
    const result = await searchBooks(
      { query: 'dom' },
      { fetchImpl: async () => okResponse(sample) },
    );
    assert.equal(result.books.length, 2);
  });
  test('status HTTP de erro vira HttpError', async () => {
    const fetchImpl = async () => ({ ok: false, status: 503, json: async () => ({}) });
    await assert.rejects(
      searchBooks({ query: 'a' }, { fetchImpl }),
      (error) => error instanceof HttpError && error.status === 503,
    );
  });
  test('JSON inválido vira InvalidResponseError', async () => {
    const fetchImpl = async () => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token <');
      },
    });
    await assert.rejects(
      searchBooks({ query: 'a' }, { fetchImpl }),
      InvalidResponseError,
    );
  });
  test('formato errado vira InvalidResponseError', async () => {
    await assert.rejects(
      searchBooks(
        { query: 'a' },
        { fetchImpl: async () => okResponse({ resultado: [] }) },
      ),
      InvalidResponseError,
    );
  });
  test('falha de rede vira NetworkError', async () => {
    const fetchImpl = async () => {
      throw new TypeError('Failed to fetch');
    };
    await assert.rejects(searchBooks({ query: 'a' }, { fetchImpl }), NetworkError);
  });
  test('cancelamento é repassado como AbortError, não como falha', async () => {
    const controller = new AbortController();
    const fetchImpl = (_url, { signal }) =>
      new Promise((_resolve, reject) =>
        signal.addEventListener('abort', () => reject(signal.reason)),
      );
    const promise = searchBooks({ query: 'a' }, { fetchImpl, signal: controller.signal });
    controller.abort();
    await assert.rejects(promise, { name: 'AbortError' });
  });
  test('timeout vira NetworkError com mensagem própria', async () => {
    // No Node, o timer de AbortSignal.timeout não mantém o processo vivo; este timer sim.
    const keepAlive = setTimeout(() => {}, 1000);
    const fetchImpl = (_url, { signal }) =>
      new Promise((_resolve, reject) =>
        signal.addEventListener('abort', () => reject(signal.reason)),
      );
    try {
      await assert.rejects(
        searchBooks({ query: 'a' }, { fetchImpl, timeoutMs: 20 }),
        /demorou demais/,
      );
    } finally {
      clearTimeout(keepAlive);
    }
  });
  test('describeError traduz status comuns', () => {
    assert.match(describeError(new HttpError(429)), /Muitas requisições/);
    assert.match(describeError(new HttpError(500)), /problemas/);
    assert.match(describeError(new NetworkError('x')), /x/);
  });
});

describe('debounce', () => {
  test('agrupa chamadas seguidas em uma só', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const fn = mock.fn();
    const debounced = debounce(fn, 100);
    debounced('a');
    debounced('b');
    debounced('c');
    t.mock.timers.tick(99);
    assert.equal(fn.mock.callCount(), 0);
    t.mock.timers.tick(1);
    assert.equal(fn.mock.callCount(), 1);
    assert.deepEqual(fn.mock.calls[0].arguments, ['c']);
  });
  test('cancel descarta a chamada pendente', (t) => {
    t.mock.timers.enable({ apis: ['setTimeout'] });
    const fn = mock.fn();
    const debounced = debounce(fn, 100);
    debounced();
    debounced.cancel();
    t.mock.timers.tick(500);
    assert.equal(fn.mock.callCount(), 0);
  });
});

describe('transformações e paginação', () => {
  const books = [
    { id: 1, title: 'Zebra', coverUrl: null },
    { id: 2, title: 'água', coverUrl: 'x' },
  ];
  test('filterBooks e sortBooksLocal não mutam a lista original', () => {
    assert.deepEqual(
      filterBooks(books, { onlyCovers: true }).map((b) => b.id),
      [2],
    );
    assert.equal(filterBooks(books).length, 2);
    assert.deepEqual(
      sortBooksLocal(books, 'title').map((b) => b.id),
      [2, 1],
    );
    assert.deepEqual(
      books.map((b) => b.id),
      [1, 2],
    );
    assert.deepEqual(
      sortBooksLocal(books, 'outro').map((b) => b.id),
      [1, 2],
    );
  });
  test('totalPages cobre zero, quebra e limite', () => {
    assert.equal(totalPages(0), 0);
    assert.equal(totalPages(-5), 0);
    assert.equal(totalPages(NaN), 0);
    assert.equal(totalPages(12), 1);
    assert.equal(totalPages(13), 2);
    assert.equal(totalPages(1_000_000), 100);
  });
});

describe('URLSearchParams <-> estado', () => {
  test('readState valida cada parâmetro', () => {
    assert.deepEqual(readState('?q=%20dune%20&page=3&sort=new&covers=1'), {
      query: 'dune',
      page: 3,
      sort: 'new',
      onlyCovers: true,
    });
    assert.deepEqual(readState('?page=-2&sort=hack&covers=0'), {
      query: '',
      page: 1,
      sort: 'relevance',
      onlyCovers: false,
    });
    assert.equal(readState('?page=abc').page, 1);
    assert.equal(readState(`?q=${'a'.repeat(500)}`).query.length, 200);
  });
  test('toSearch omite valores padrão e faz ida e volta', () => {
    assert.equal(
      toSearch({ query: '', page: 1, sort: 'relevance', onlyCovers: false }),
      '',
    );
    const state = { query: 'c++ & rust', page: 2, sort: 'old', onlyCovers: true };
    assert.deepEqual(readState(toSearch(state)), state);
  });
});

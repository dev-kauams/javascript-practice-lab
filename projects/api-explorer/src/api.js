// Camada de acesso à Open Library Search API (pública, sem chave).
// Documentação: https://openlibrary.org/dev/docs/api/search
//
// Princípio do projeto: uma resposta de rede pode ser lenta, falhar, vir sem JSON ou
// com formato diferente do esperado. Cada situação vira um erro com nome próprio.

export const API_URL = 'https://openlibrary.org/search.json';
export const COVERS_URL = 'https://covers.openlibrary.org/b/id';
export const PAGE_SIZE = 12;
export const SERVER_SORTS = ['relevance', 'new', 'old'];
const FIELDS = 'key,title,author_name,first_publish_year,cover_i';

export class NetworkError extends Error {
  constructor(message, options) {
    super(message, options);
    this.name = 'NetworkError';
  }
}

export class HttpError extends Error {
  constructor(status) {
    super(`A API respondeu com o status ${status}.`);
    this.name = 'HttpError';
    this.status = status;
  }
}

export class InvalidResponseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidResponseError';
  }
}

export function buildSearchUrl(
  { query, page = 1, sort = 'relevance' },
  baseUrl = API_URL,
) {
  const params = new URLSearchParams({
    q: query.trim(),
    page: String(page),
    limit: String(PAGE_SIZE),
    fields: FIELDS,
  });
  if (SERVER_SORTS.includes(sort) && sort !== 'relevance') params.set('sort', sort);
  return `${baseUrl}?${params}`;
}

/** Valida o formato recebido e devolve só o que a interface precisa. */
export function parseSearchResponse(data) {
  if (data === null || typeof data !== 'object' || !Array.isArray(data.docs)) {
    throw new InvalidResponseError('A resposta da API não tem o formato esperado.');
  }
  const total = Number.isFinite(data.numFound) ? data.numFound : data.docs.length;
  const books = data.docs
    .filter((doc) => doc && typeof doc.key === 'string' && typeof doc.title === 'string')
    .map((doc) => ({
      id: doc.key,
      title: doc.title,
      authors: Array.isArray(doc.author_name)
        ? doc.author_name.filter((a) => typeof a === 'string')
        : [],
      year: Number.isInteger(doc.first_publish_year) ? doc.first_publish_year : null,
      coverUrl: Number.isInteger(doc.cover_i)
        ? `${COVERS_URL}/${doc.cover_i}-M.jpg`
        : null,
    }));
  return { total, books };
}

/**
 * Busca livros. `signal` permite cancelar (AbortController); `fetchImpl` permite testar
 * sem rede. Erros possíveis: AbortError (repassado), NetworkError, HttpError e
 * InvalidResponseError.
 */
export async function searchBooks(
  params,
  { signal, fetchImpl = globalThis.fetch, timeoutMs = 10_000, baseUrl } = {},
) {
  const timeout = AbortSignal.timeout(timeoutMs);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let response;
  try {
    response = await fetchImpl(buildSearchUrl(params, baseUrl), {
      signal: combined,
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error; // cancelamento pedido por nós: não é falha
    if (error?.name === 'TimeoutError')
      throw new NetworkError('A API demorou demais para responder.', { cause: error });
    throw new NetworkError('Não foi possível conectar à API. Verifique sua conexão.', {
      cause: error,
    });
  }

  if (!response.ok) throw new HttpError(response.status);

  let data;
  try {
    data = await response.json();
  } catch (error) {
    if (error?.name === 'AbortError') throw error;
    throw new InvalidResponseError('A resposta da API não é um JSON válido.');
  }
  return parseSearchResponse(data);
}

export function describeError(error) {
  if (error instanceof HttpError && error.status === 429)
    return 'Muitas requisições. Aguarde um instante e tente novamente.';
  if (error instanceof HttpError && error.status >= 500)
    return 'O serviço está com problemas no momento. Tente novamente em instantes.';
  return error?.message ?? 'Algo inesperado aconteceu.';
}

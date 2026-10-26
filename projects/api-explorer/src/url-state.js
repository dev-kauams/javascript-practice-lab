// Sincroniza o estado da pesquisa com a query string, para links compartilháveis.
export const DEFAULT_STATE = { query: '', page: 1, sort: 'relevance', onlyCovers: false };
const VALID_SORTS = ['relevance', 'new', 'old', 'title'];

export function readState(search) {
  const params = new URLSearchParams(search);
  const page = Number.parseInt(params.get('page') ?? '', 10);
  const sort = params.get('sort');
  return {
    query: (params.get('q') ?? '').trim().slice(0, 200),
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    sort: VALID_SORTS.includes(sort) ? sort : DEFAULT_STATE.sort,
    onlyCovers: params.get('covers') === '1',
  };
}

/** Só grava o que difere do padrão, mantendo a URL curta. */
export function toSearch(state) {
  const params = new URLSearchParams();
  if (state.query.trim()) params.set('q', state.query.trim());
  if (state.page > 1) params.set('page', String(state.page));
  if (state.sort !== DEFAULT_STATE.sort) params.set('sort', state.sort);
  if (state.onlyCovers) params.set('covers', '1');
  const text = params.toString();
  return text ? `?${text}` : '';
}

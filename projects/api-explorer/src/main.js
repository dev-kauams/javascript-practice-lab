import { h, announce } from '../../_shared/dom.js';
import { describeError, searchBooks } from './api.js';
import { debounce } from './debounce.js';
import { filterBooks, sortBooksLocal, totalPages } from './transform.js';
import { readState, toSearch } from './url-state.js';

const $ = (selector) => document.querySelector(selector);
const form = $('#search-form');
const resultsEl = $('#results');
const statusEl = $('#status');
const pagerEl = $('#pager');
const live = $('#live');

// Estados da tela: idle | loading | success | empty | error
const state = { ...readState(location.search), view: 'idle', data: null, error: null };
let controller = null; // AbortController da requisição em andamento
const serverSort = (sort) => (sort === 'title' ? 'relevance' : sort); // "title" é só local

/* ---------- Estado -> interface ---------- */
function setStatus(kind, message, extra = null) {
  statusEl.className = `status ${kind === 'error' ? 'error' : kind === 'ok' ? 'ok' : ''}`;
  statusEl.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  statusEl.replaceChildren(message, ...(extra ? [' ', extra] : []));
  statusEl.hidden = !message;
  if (message) announce(live, message);
}

function renderCard(book) {
  const cover = book.coverUrl
    ? h('img', {
        class: 'cover',
        src: book.coverUrl,
        alt: `Capa de ${book.title}`,
        loading: 'lazy',
        width: 120,
        height: 180,
        onError: (event) =>
          event.currentTarget.replaceWith(
            h('div', { class: 'cover placeholder', 'aria-hidden': 'true' }, 'Sem capa'),
          ),
      })
    : h('div', { class: 'cover placeholder', 'aria-hidden': 'true' }, 'Sem capa');
  const authors = book.authors.length
    ? book.authors.slice(0, 3).join(', ')
    : 'Autor desconhecido';
  return h(
    'li',
    { class: 'panel card' },
    cover,
    h(
      'div',
      {},
      h('h3', {}, book.title),
      h('p', { class: 'muted' }, authors),
      h(
        'p',
        { class: 'muted' },
        book.year ? `1ª publicação: ${book.year}` : 'Ano desconhecido',
      ),
    ),
  );
}

function render() {
  resultsEl.setAttribute('aria-busy', String(state.view === 'loading'));
  pagerEl.hidden = true;

  if (state.view === 'idle') {
    resultsEl.replaceChildren();
    setStatus('info', 'Digite um título, autor ou assunto para começar.');
    return;
  }
  if (state.view === 'loading') {
    setStatus('info', 'Carregando resultados…');
    return; // mantém os resultados antigos visíveis enquanto carrega
  }
  if (state.view === 'error') {
    resultsEl.replaceChildren();
    setStatus(
      'error',
      describeError(state.error),
      h(
        'button',
        { type: 'button', class: 'secondary', onClick: () => load() },
        'Tentar novamente',
      ),
    );
    return;
  }

  const visible = sortBooksLocal(
    filterBooks(state.data.books, { onlyCovers: state.onlyCovers }),
    state.sort,
  );
  resultsEl.replaceChildren(...visible.map(renderCard));

  if (state.view === 'empty' || visible.length === 0) {
    const hiddenByFilter = state.data.books.length > 0;
    setStatus(
      'info',
      hiddenByFilter
        ? 'Nenhum resultado desta página tem capa. Desmarque o filtro ou mude de página.'
        : `Nenhum livro encontrado para "${state.query}".`,
    );
  } else {
    setStatus(
      'ok',
      `${state.data.total.toLocaleString('pt-BR')} resultados · mostrando ${visible.length} nesta página.`,
    );
  }

  const pages = totalPages(state.data.total);
  pagerEl.hidden = pages <= 1;
  $('#page-label').textContent = `Página ${state.page} de ${pages}`;
  $('#prev').disabled = state.page <= 1;
  $('#next').disabled = state.page >= pages;
}

/* ---------- Requisição ---------- */
async function load() {
  if (!state.query.trim()) {
    controller?.abort();
    Object.assign(state, { view: 'idle', data: null });
    history.replaceState(null, '', toSearch(state) || location.pathname);
    render();
    return;
  }
  controller?.abort(); // cancela a busca anterior: só a última importa
  controller = new AbortController();
  const { signal } = controller;

  state.view = 'loading';
  render();
  history.replaceState(null, '', toSearch(state) || location.pathname);

  try {
    const data = await searchBooks(
      { query: state.query, page: state.page, sort: serverSort(state.sort) },
      { signal },
    );
    state.data = data;
    state.view = data.books.length === 0 ? 'empty' : 'success';
  } catch (error) {
    if (error.name === 'AbortError') return; // substituída por outra busca: ignora
    state.error = error;
    state.view = 'error';
  }
  render();
}

/* ---------- Eventos ---------- */
const debouncedSearch = debounce(() => load(), 450);

form.elements.q.addEventListener('input', (event) => {
  state.query = event.target.value;
  state.page = 1;
  debouncedSearch();
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  debouncedSearch.cancel();
  state.query = form.elements.q.value;
  state.page = 1;
  load();
});
form.elements.sort.addEventListener('change', (event) => {
  const before = serverSort(state.sort);
  const pageBefore = state.page;
  state.sort = event.target.value;
  state.page = 1;
  // "Título" é ordenação local: só refaz a requisição se a ordem do servidor ou a página mudou.
  if (!state.data || before !== serverSort(state.sort) || pageBefore !== 1) load();
  else {
    history.replaceState(null, '', toSearch(state) || location.pathname);
    render();
  }
});
form.elements.covers.addEventListener('change', (event) => {
  state.onlyCovers = event.target.checked;
  history.replaceState(null, '', toSearch(state) || location.pathname);
  if (state.data) render();
});
$('#prev').addEventListener('click', () => {
  state.page -= 1;
  load();
});
$('#next').addEventListener('click', () => {
  state.page += 1;
  load();
});
for (const chip of document.querySelectorAll('[data-suggestion]')) {
  chip.addEventListener('click', () => {
    form.elements.q.value = chip.dataset.suggestion;
    form.requestSubmit();
  });
}

/* ---------- Início: restaura a pesquisa da URL ---------- */
form.elements.q.value = state.query;
form.elements.sort.value = state.sort;
form.elements.covers.checked = state.onlyCovers;
load();

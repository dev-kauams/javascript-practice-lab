// Filtros, ordenação local e paginação: funções puras sobre os livros já carregados.
import { PAGE_SIZE } from './api.js';

export const MAX_PAGES = 100; // paginação muito profunda é lenta na API

export function totalPages(total, pageSize = PAGE_SIZE) {
  if (!Number.isFinite(total) || total <= 0) return 0;
  return Math.min(Math.ceil(total / pageSize), MAX_PAGES);
}

export function filterBooks(books, { onlyCovers = false } = {}) {
  return onlyCovers ? books.filter((book) => book.coverUrl) : books;
}

/** "title" e "year" são ordenações locais (só dentro da página atual). */
export function sortBooksLocal(books, by) {
  const copy = [...books];
  if (by === 'title')
    return copy.sort((a, b) =>
      a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }),
    );
  return copy;
}

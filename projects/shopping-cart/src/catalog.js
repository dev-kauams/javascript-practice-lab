// Catálogo de demonstração. Os preços são guardados em centavos inteiros.
import { normalizeText } from './text.js';

export const PRODUCTS = [
  {
    id: 'kb-01',
    name: 'Teclado mecânico compacto',
    category: 'Periféricos',
    priceCents: 34990,
  },
  { id: 'ms-01', name: 'Mouse sem fio', category: 'Periféricos', priceCents: 12990 },
  { id: 'hd-01', name: 'Headset com microfone', category: 'Áudio', priceCents: 22990 },
  { id: 'sp-01', name: 'Caixa de som Bluetooth', category: 'Áudio', priceCents: 19990 },
  { id: 'mn-01', name: 'Monitor 24 polegadas', category: 'Telas', priceCents: 74990 },
  {
    id: 'mn-02',
    name: 'Suporte articulado para monitor',
    category: 'Telas',
    priceCents: 15990,
  },
  { id: 'cb-01', name: 'Cabo USB-C trançado', category: 'Acessórios', priceCents: 3990 },
  { id: 'cb-02', name: 'Hub USB com 4 portas', category: 'Acessórios', priceCents: 8950 },
  {
    id: 'ch-01',
    name: 'Carregador de parede 30 W',
    category: 'Acessórios',
    priceCents: 6990,
  },
  { id: 'wc-01', name: 'Webcam Full HD', category: 'Periféricos', priceCents: 17990 },
  { id: 'dk-01', name: 'Mousepad grande', category: 'Acessórios', priceCents: 5990 },
  { id: 'lp-01', name: 'Luminária de mesa LED', category: 'Telas', priceCents: 9990 },
];

export const CATEGORIES = [...new Set(PRODUCTS.map((product) => product.category))].sort(
  (a, b) => a.localeCompare(b, 'pt-BR'),
);

export function filterProducts(products, { query = '', category = '' } = {}) {
  const needle = normalizeText(query).trim();
  return products.filter((product) => {
    if (category && product.category !== category) return false;
    return !needle || normalizeText(product.name).includes(needle);
  });
}

export function sortProducts(products, by = 'name') {
  const copy = [...products];
  switch (by) {
    case 'price-asc':
      return copy.sort(
        (a, b) => a.priceCents - b.priceCents || a.name.localeCompare(b.name, 'pt-BR'),
      );
    case 'price-desc':
      return copy.sort(
        (a, b) => b.priceCents - a.priceCents || a.name.localeCompare(b.name, 'pt-BR'),
      );
    default:
      return copy.sort((a, b) =>
        a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }),
      );
  }
}

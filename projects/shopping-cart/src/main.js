import { h, announce } from '../../_shared/dom.js';
import {
  MAX_QUANTITY,
  addToCart,
  cartLines,
  cartTotals,
  removeFromCart,
  setQuantity,
} from './cart.js';
import { CATEGORIES, PRODUCTS, filterProducts, sortProducts } from './catalog.js';
import { formatCents } from './money.js';
import { loadCart, saveCart } from './storage.js';

const $ = (selector) => document.querySelector(selector);
const live = $('#live');
const noticeEl = $('#notice');

const storage = (() => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
})();
const loaded = storage ? loadCart(storage) : { cart: [], status: 'unavailable' };
const state = { cart: loaded.cart, query: '', category: '', sort: 'name' };

function notice(message) {
  noticeEl.hidden = !message;
  noticeEl.textContent = message;
}
if (loaded.status === 'corrupted')
  notice('O carrinho salvo estava corrompido e foi descartado.');
if (loaded.status === 'unavailable')
  notice('O armazenamento local está indisponível: o carrinho não será salvo.');

function persist() {
  if (storage && !saveCart(storage, state.cart))
    notice('Não foi possível salvar o carrinho neste navegador.');
}

/* ---------- Catálogo ---------- */
const catalogEl = $('#catalog');
function renderCatalog() {
  const products = sortProducts(
    filterProducts(PRODUCTS, { query: state.query, category: state.category }),
    state.sort,
  );
  catalogEl.replaceChildren(
    ...products.map((product) =>
      h(
        'li',
        { class: 'panel product' },
        h('div', { class: 'tile', 'aria-hidden': 'true' }, product.name[0]),
        h('h3', {}, product.name),
        h('p', { class: 'muted' }, product.category),
        h('p', { class: 'price' }, formatCents(product.priceCents)),
        h(
          'button',
          {
            type: 'button',
            'data-add': product.id,
            'aria-label': `Adicionar ${product.name} ao carrinho`,
          },
          'Adicionar',
        ),
      ),
    ),
  );
  $('#catalog-empty').hidden = products.length > 0;
  $('#catalog-count').textContent = `${products.length} produto(s)`;
}

catalogEl.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  const product = PRODUCTS.find((item) => item.id === button.dataset.add);
  state.cart = addToCart(state.cart, product.id);
  persist();
  renderCart();
  announce(live, `${product.name} adicionado ao carrinho.`);
});

/* ---------- Carrinho ---------- */
const cartEl = $('#cart-lines');
function renderCart() {
  const lines = cartLines(state.cart, PRODUCTS);
  const { itemCount, totalCents } = cartTotals(lines);
  cartEl.replaceChildren(
    ...lines.map(({ product, quantity, subtotalCents }) =>
      h(
        'li',
        { class: 'cart-line', dataset: { id: product.id } },
        h(
          'div',
          {},
          h('strong', {}, product.name),
          h('div', { class: 'muted' }, `${formatCents(product.priceCents)} cada`),
        ),
        h(
          'div',
          { class: 'qty' },
          h(
            'label',
            { class: 'visually-hidden', for: `qty-${product.id}` },
            `Quantidade de ${product.name}`,
          ),
          h('input', {
            id: `qty-${product.id}`,
            type: 'number',
            min: 1,
            max: MAX_QUANTITY,
            step: 1,
            value: quantity,
            inputMode: 'numeric',
            'data-qty': product.id,
          }),
        ),
        h('div', { class: 'subtotal' }, formatCents(subtotalCents)),
        h(
          'button',
          {
            type: 'button',
            class: 'danger',
            'data-remove': product.id,
            'aria-label': `Remover ${product.name}`,
          },
          'Remover',
        ),
      ),
    ),
  );
  $('#cart-empty').hidden = lines.length > 0;
  cartEl.hidden = lines.length === 0;
  $('#cart-total').textContent = formatCents(totalCents);
  $('#cart-count').textContent = `${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`;
  $('#clear-cart').disabled = lines.length === 0;
}

cartEl.addEventListener('change', (event) => {
  const input = event.target.closest('[data-qty]');
  if (!input) return;
  const result = setQuantity(state.cart, input.dataset.qty, input.value);
  if (result.error) {
    notice(result.error);
    announce(live, result.error);
    renderCart(); // restaura o valor válido anterior
    return;
  }
  notice('');
  state.cart = result.cart;
  persist();
  renderCart();
  cartEl.querySelector(`[data-qty="${CSS.escape(input.dataset.qty)}"]`)?.focus();
});

cartEl.addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove]');
  if (!button) return;
  state.cart = removeFromCart(state.cart, button.dataset.remove);
  persist();
  renderCart();
  announce(live, 'Item removido do carrinho.');
});

$('#clear-cart').addEventListener('click', () => {
  state.cart = [];
  persist();
  renderCart();
  announce(live, 'Carrinho esvaziado.');
});

$('#checkout').addEventListener('click', () => {
  notice('Este carrinho é demonstrativo: nenhum pagamento é realizado.');
  announce(live, 'Este carrinho é demonstrativo: nenhum pagamento é realizado.');
});

/* ---------- Filtros ---------- */
const categorySelect = $('#category');
categorySelect.append(
  ...CATEGORIES.map((category) => h('option', { value: category }, category)),
);
$('#search').addEventListener('input', (event) => {
  state.query = event.target.value;
  renderCatalog();
});
categorySelect.addEventListener('change', (event) => {
  state.category = event.target.value;
  renderCatalog();
});
$('#sort').addEventListener('change', (event) => {
  state.sort = event.target.value;
  renderCatalog();
});

renderCatalog();
renderCart();

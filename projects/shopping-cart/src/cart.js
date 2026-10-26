// Estado do carrinho: guarda apenas { productId, quantity }.
// Nomes, preços, subtotais e total são DERIVADOS do catálogo a cada renderização,
// nunca copiados para o estado. Assim não há valores desatualizados para sincronizar.
import { multiplyCents, sumCents } from './money.js';

export const MAX_QUANTITY = 99;

/** Converte entrada (número ou texto) em inteiro de 1 a MAX_QUANTITY; senão null. */
export function normalizeQuantity(value) {
  if (typeof value === 'string' && value.trim() === '') return null;
  const number = typeof value === 'string' ? Number(value) : value;
  if (!Number.isInteger(number) || number < 1 || number > MAX_QUANTITY) return null;
  return number;
}

export const emptyCart = () => [];

export function addToCart(cart, productId, quantity = 1) {
  const amount = normalizeQuantity(quantity);
  if (amount === null) return cart;
  const existing = cart.find((line) => line.productId === productId);
  if (!existing) return [...cart, { productId, quantity: amount }];
  return cart.map((line) =>
    line.productId === productId
      ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + amount) }
      : line,
  );
}

/** Define a quantidade. Valor inválido não altera o carrinho e devolve uma mensagem. */
export function setQuantity(cart, productId, value) {
  const quantity = normalizeQuantity(value);
  if (quantity === null) {
    return { cart, error: `Informe uma quantidade inteira de 1 a ${MAX_QUANTITY}.` };
  }
  return {
    cart: cart.map((line) =>
      line.productId === productId ? { ...line, quantity } : line,
    ),
    error: '',
  };
}

export const removeFromCart = (cart, productId) =>
  cart.filter((line) => line.productId !== productId);

/**
 * Junta o carrinho ao catálogo. Produtos que não existem mais no catálogo
 * (ex.: carrinho salvo antigo) são ignorados em vez de quebrar a tela.
 */
export function cartLines(cart, products) {
  const byId = new Map(products.map((product) => [product.id, product]));
  return cart.flatMap(({ productId, quantity }) => {
    const product = byId.get(productId);
    if (!product) return [];
    return [
      { product, quantity, subtotalCents: multiplyCents(product.priceCents, quantity) },
    ];
  });
}

export function cartTotals(lines) {
  return {
    itemCount: lines.reduce((count, line) => count + line.quantity, 0),
    totalCents: sumCents(lines.map((line) => line.subtotalCents)),
  };
}

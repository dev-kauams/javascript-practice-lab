// Persistência do carrinho com validação: dados salvos podem estar ausentes ou adulterados.
import { normalizeQuantity } from './cart.js';

export const STORAGE_KEY = 'practice-lab:shopping-cart:v1';

export function sanitizeCart(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const cart = [];
  for (const item of raw) {
    const productId = item?.productId;
    const quantity = normalizeQuantity(item?.quantity);
    if (typeof productId !== 'string' || quantity === null || seen.has(productId))
      continue;
    seen.add(productId);
    cart.push({ productId, quantity });
  }
  return cart;
}

export function loadCart(storage) {
  try {
    const text = storage.getItem(STORAGE_KEY);
    if (text === null || text === undefined) return { cart: [], status: 'empty' };
    return { cart: sanitizeCart(JSON.parse(text)), status: 'loaded' };
  } catch (error) {
    return {
      cart: [],
      status: error instanceof SyntaxError ? 'corrupted' : 'unavailable',
    };
  }
}

export function saveCart(storage, cart) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(cart));
    return true;
  } catch {
    return false;
  }
}

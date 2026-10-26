// Lógica pura por trás dos componentes (sem DOM): testável em Node.js.

export function clampCount(value, min = 0, max = 99) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, Math.trunc(number)));
}

export function remainingChars(text, max) {
  const used = [...String(text ?? '')].length; // conta emojis como 1 caractere
  return { used, remaining: max - used, over: used > max };
}

/** Anuncia apenas ao cruzar limiares, para o leitor de tela não repetir a cada tecla. */
export function shouldAnnounceRemaining(previous, current, thresholds = [20, 10, 0]) {
  return thresholds.some((limit) => previous > limit && current <= limit);
}

/** Teclado de tabs (padrão WAI-ARIA): setas circulares, Home e End. */
export function nextTabIndex(current, key, total) {
  if (total <= 0) return null;
  switch (key) {
    case 'ArrowRight':
      return (current + 1) % total;
    case 'ArrowLeft':
      return (current - 1 + total) % total;
    case 'Home':
      return 0;
    case 'End':
      return total - 1;
    default:
      return null;
  }
}

/** Compara um evento de teclado com um atalho como "alt+n", "?" ou "escape". */
export function matchesShortcut(event, combo) {
  const parts = combo.toLowerCase().split('+');
  const key = parts.pop();
  const wanted = new Set(parts);
  const modifiers = {
    alt: event.altKey,
    ctrl: event.ctrlKey,
    meta: event.metaKey,
    shift: event.shiftKey,
  };
  const modifiersMatch = Object.entries(modifiers).every(([name, pressed]) => {
    // Shift é implícito em teclas como "?", então só é exigido quando pedido.
    if (name === 'shift' && !wanted.has('shift')) return true;
    return pressed === wanted.has(name);
  });
  // Com Alt no macOS, event.key vira "å", "ñ"...; event.code ("KeyN") continua estável.
  const keyMatches =
    String(event.key).toLowerCase() === key ||
    (key.length === 1 && event.code === `Key${key.toUpperCase()}`);
  return modifiersMatch && keyMatches;
}

/* ---------- Lista: operações imutáveis ---------- */

export function normalizeItemText(text) {
  return String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function addItem(items, text, makeId = () => crypto.randomUUID()) {
  const clean = normalizeItemText(text);
  if (!clean) return { items, error: 'Digite um texto para adicionar.' };
  if (clean.length > 80) return { items, error: 'Use no máximo 80 caracteres.' };
  if (items.some((item) => item.text.toLowerCase() === clean.toLowerCase())) {
    return { items, error: 'Este item já existe na lista.' };
  }
  return { items: [...items, { id: makeId(), text: clean }], error: '' };
}

export function updateItem(items, id, text) {
  const clean = normalizeItemText(text);
  if (!clean) return { items, error: 'O texto não pode ficar vazio.' };
  if (
    items.some(
      (item) => item.id !== id && item.text.toLowerCase() === clean.toLowerCase(),
    )
  ) {
    return { items, error: 'Já existe outro item com esse texto.' };
  }
  return {
    items: items.map((item) => (item.id === id ? { ...item, text: clean } : item)),
    error: '',
  };
}

export function removeItem(items, id) {
  return items.filter((item) => item.id !== id);
}

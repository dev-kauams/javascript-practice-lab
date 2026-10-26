import { matchesShortcut } from '../logic.js';

const isTyping = (target) =>
  target.matches?.('input, textarea, select, [contenteditable]');

/**
 * Registra atalhos globais. Atalhos com Alt funcionam mesmo digitando;
 * teclas simples (como "?") são ignoradas dentro de campos de texto.
 */
export function initShortcuts(shortcuts, onFire = () => {}) {
  document.addEventListener('keydown', (event) => {
    for (const { combo, action, label } of shortcuts) {
      if (!matchesShortcut(event, combo)) continue;
      const simpleKey = !combo.includes('+');
      if (simpleKey && isTyping(event.target)) continue;
      event.preventDefault();
      action();
      onFire(label);
      return;
    }
  });
}

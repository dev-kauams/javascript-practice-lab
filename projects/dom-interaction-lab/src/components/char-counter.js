import { announce } from '../../../_shared/dom.js';
import { remainingChars, shouldAnnounceRemaining } from '../logic.js';

/** Contador de caracteres: visual a cada tecla, anúncio falado só em limiares. */
export function initCharCounter(root, live) {
  const textarea = root.querySelector('textarea');
  const display = root.querySelector('[data-count]');
  const max = Number(textarea.dataset.max);
  let previousRemaining = max;

  function render() {
    const { used, remaining, over } = remainingChars(textarea.value, max);
    display.textContent = `${used}/${max}`;
    display.classList.toggle('over', over);
    if (shouldAnnounceRemaining(previousRemaining, remaining)) {
      announce(
        live,
        remaining < 0
          ? 'Limite de caracteres excedido.'
          : `Restam ${remaining} caracteres.`,
      );
    }
    textarea.setAttribute('aria-invalid', String(over));
    previousRemaining = remaining;
  }

  textarea.addEventListener('input', render);
  render();
}

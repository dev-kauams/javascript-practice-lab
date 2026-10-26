import { clampCount } from '../logic.js';

/** Contador com limites: atualiza o texto e desabilita botões nos extremos. */
export function initCounter(root, { min = 0, max = 10 } = {}) {
  const output = root.querySelector('[data-counter-value]');
  const [dec, inc, reset] = root.querySelectorAll('button');
  let count = min;

  function render() {
    output.textContent = String(count);
    dec.disabled = count <= min;
    inc.disabled = count >= max;
  }
  const set = (value) => {
    count = clampCount(value, min, max);
    render();
  };

  dec.addEventListener('click', () => set(count - 1));
  inc.addEventListener('click', () => set(count + 1));
  reset.addEventListener('click', () => set(min));
  render();
}

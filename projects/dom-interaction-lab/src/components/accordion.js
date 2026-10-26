/** Accordion: cada botão controla um painel via aria-expanded/aria-controls. */
export function initAccordion(root, { single = true } = {}) {
  const buttons = [...root.querySelectorAll('button[aria-controls]')];

  function setOpen(button, open) {
    button.setAttribute('aria-expanded', String(open));
    document.getElementById(button.getAttribute('aria-controls')).hidden = !open;
  }

  root.addEventListener('click', (event) => {
    const button = event.target.closest('button[aria-controls]');
    if (!button) return;
    const willOpen = button.getAttribute('aria-expanded') !== 'true';
    if (single && willOpen) buttons.forEach((other) => setOpen(other, false));
    setOpen(button, willOpen);
  });
  buttons.forEach((button) =>
    setOpen(button, button.getAttribute('aria-expanded') === 'true'),
  );
}

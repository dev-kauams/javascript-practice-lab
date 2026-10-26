/**
 * Modal sobre <dialog>: o navegador já cuida de foco preso, aria-modal e Esc.
 * Aqui adicionamos: devolver o foco ao botão de origem e fechar ao clicar no fundo.
 */
export function initModal(dialog, { onClose = () => {} } = {}) {
  let opener = null;

  function open(trigger) {
    opener = trigger ?? document.activeElement;
    dialog.showModal();
  }

  dialog.addEventListener('close', () => {
    opener?.focus();
    onClose(dialog.returnValue);
    dialog.returnValue = '';
  });

  // Clique no ::backdrop chega ao próprio <dialog> (e não a um filho).
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close('cancel');
  });

  return { open, close: (value) => dialog.close(value) };
}

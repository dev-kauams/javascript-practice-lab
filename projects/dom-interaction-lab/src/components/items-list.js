import { h, announce } from '../../../_shared/dom.js';
import { addItem, removeItem, updateItem } from '../logic.js';

/**
 * Lista editável com delegação de eventos: UM listener no <ul> trata
 * editar, salvar, cancelar e remover para todos os itens, inclusive os novos.
 */
export function initItemsList(root, live) {
  const form = root.querySelector('form');
  const input = form.elements.text;
  const error = root.querySelector('[data-error]');
  const list = root.querySelector('ul');
  const empty = root.querySelector('[data-empty]');
  let items = [
    { id: 'a', text: 'Estudar delegação de eventos' },
    { id: 'b', text: 'Revisar acessibilidade' },
  ];
  let editingId = null;

  function renderItem(item) {
    const editing = item.id === editingId;
    const body = editing
      ? h('input', {
          class: 'edit-input',
          value: item.text,
          'aria-label': `Editar "${item.text}"`,
          maxLength: 80,
        })
      : h('span', { class: 'item-text' }, item.text);
    const actions = editing
      ? [
          h('button', { type: 'button', 'data-action': 'save' }, 'Salvar'),
          h(
            'button',
            { type: 'button', class: 'secondary', 'data-action': 'cancel' },
            'Cancelar',
          ),
        ]
      : [
          h(
            'button',
            { type: 'button', class: 'secondary', 'data-action': 'edit' },
            'Editar',
          ),
          h(
            'button',
            {
              type: 'button',
              class: 'danger',
              'data-action': 'remove',
              'aria-label': `Remover "${item.text}"`,
            },
            'Remover',
          ),
        ];
    return h(
      'li',
      { dataset: { id: item.id }, class: 'list-item' },
      body,
      h('span', { class: 'row' }, actions),
    );
  }

  function render() {
    list.replaceChildren(...items.map(renderItem));
    empty.hidden = items.length > 0;
    list.hidden = items.length === 0;
    list.querySelector('.edit-input')?.focus();
  }

  function showError(message) {
    error.textContent = message;
    if (message) announce(live, message);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = addItem(items, input.value);
    showError(result.error);
    if (result.error) {
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    items = result.items;
    input.value = '';
    render();
    announce(live, `Item adicionado. A lista tem ${items.length} itens.`);
    input.focus();
  });

  list.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const li = button.closest('li');
    const id = li.dataset.id;
    switch (button.dataset.action) {
      case 'edit':
        editingId = id;
        render();
        break;
      case 'cancel':
        editingId = null;
        render();
        li.querySelector('button')?.focus();
        break;
      case 'save': {
        const result = updateItem(items, id, li.querySelector('.edit-input').value);
        showError(result.error);
        if (result.error) return;
        items = result.items;
        editingId = null;
        render();
        announce(live, 'Item atualizado.');
        break;
      }
      case 'remove': {
        const index = items.findIndex((item) => item.id === id);
        items = removeItem(items, id);
        render();
        announce(live, `Item removido. A lista tem ${items.length} itens.`);
        // Devolve o foco para um vizinho em vez de perdê-lo no <body>.
        const neighbor = list.querySelectorAll('li')[Math.min(index, items.length - 1)];
        (neighbor?.querySelector('button') ?? input).focus();
        break;
      }
    }
  });

  list.addEventListener('keydown', (event) => {
    if (event.target.matches('.edit-input')) {
      if (event.key === 'Enter') list.querySelector('[data-action="save"]').click();
      if (event.key === 'Escape') list.querySelector('[data-action="cancel"]').click();
    }
  });

  render();
  return { focusInput: () => input.focus() };
}

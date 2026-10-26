import { h, announce } from '../../_shared/dom.js';
import { loadTasks, saveTasks } from './storage.js';
import {
  clearCompleted,
  createTask,
  filterTasks,
  formatDueDate,
  isOverdue,
  removeTask,
  sortTasks,
  summarize,
  toggleTask,
  updateTask,
} from './store.js';

const $ = (selector) => document.querySelector(selector);
const live = $('#live');

/* ---------- Estado ---------- */
const storage = (() => {
  try {
    return window.localStorage;
  } catch {
    return null; // acesso bloqueado
  }
})();
const loaded = storage
  ? loadTasks(storage)
  : { tasks: [], unavailable: true, recovered: false };

const state = {
  tasks: loaded.tasks,
  filters: { query: '', status: 'all' },
  sort: { by: 'created', direction: 'asc' },
  editingId: null,
  lastRemoved: null,
};

/* ---------- Persistência ---------- */
function persist() {
  if (!storage) return;
  const result = saveTasks(storage, state.tasks);
  if (!result.ok)
    notice(
      `Não foi possível salvar (${result.error}). Suas alterações valem só até fechar a página.`,
      'error',
    );
}

/* ---------- Mensagens ---------- */
const noticeEl = $('#notice');
function notice(message, kind = '', undoAction = null) {
  noticeEl.hidden = !message;
  noticeEl.className = `status ${kind}`;
  noticeEl.replaceChildren(message);
  if (undoAction) {
    noticeEl.append(
      ' ',
      h(
        'button',
        { type: 'button', class: 'secondary', onClick: undoAction },
        'Desfazer',
      ),
    );
  }
  if (message) announce(live, message);
}

if (loaded.unavailable) {
  notice(
    'O armazenamento local está indisponível: as tarefas não serão salvas.',
    'error',
  );
} else if (loaded.recovered) {
  const reasons = {
    'json-invalido': 'Os dados salvos estavam corrompidos e foram descartados.',
    'formato-invalido':
      'Os dados salvos tinham um formato inesperado e foram descartados.',
    'itens-descartados': `${loaded.discarded} item(ns) inválido(s) foram ignorados ao carregar.`,
  };
  notice(reasons[loaded.reason] ?? 'Alguns dados salvos foram ignorados.', 'error');
}

/* ---------- Renderização (a UI é função do estado) ---------- */
const listEl = $('#task-list');
const emptyEl = $('#empty');
const summaryEl = $('#summary');

function visibleTasks() {
  return sortTasks(
    filterTasks(state.tasks, state.filters),
    state.sort.by,
    state.sort.direction,
  );
}

function renderTask(task) {
  const dueText = formatDueDate(task.dueDate);
  const overdue = isOverdue(task);
  const checkboxId = `done-${task.id}`;
  return h(
    'li',
    { class: `task${task.done ? ' is-done' : ''}`, dataset: { id: task.id } },
    h('input', {
      type: 'checkbox',
      id: checkboxId,
      checked: task.done,
      'data-action': 'toggle',
    }),
    h(
      'div',
      { class: 'task-body' },
      h('label', { for: checkboxId, class: 'task-title' }, task.title),
      task.notes ? h('p', { class: 'task-notes' }, task.notes) : null,
      dueText
        ? h(
            'p',
            { class: `task-due${overdue ? ' overdue' : ''}` },
            `${overdue ? 'Atrasada · ' : 'Prazo: '}${dueText}`,
          )
        : null,
    ),
    h(
      'div',
      { class: 'row' },
      h(
        'button',
        {
          type: 'button',
          class: 'secondary',
          'data-action': 'edit',
          'aria-label': `Editar "${task.title}"`,
        },
        'Editar',
      ),
      h(
        'button',
        {
          type: 'button',
          class: 'danger',
          'data-action': 'remove',
          'aria-label': `Remover "${task.title}"`,
        },
        'Remover',
      ),
    ),
  );
}

function render() {
  const visible = visibleTasks();
  listEl.replaceChildren(...visible.map(renderTask));
  listEl.hidden = visible.length === 0;
  emptyEl.hidden = visible.length > 0;
  emptyEl.textContent =
    state.tasks.length === 0
      ? 'Nenhuma tarefa ainda. Use o formulário para criar a primeira.'
      : 'Nenhuma tarefa corresponde à busca ou ao filtro atual.';
  const { total, open, done, overdue } = summarize(state.tasks);
  summaryEl.textContent = `${total} no total · ${open} abertas · ${done} concluídas · ${overdue} atrasadas`;
  $('#clear-done').disabled = done === 0;
}

/* ---------- Formulário (criar e editar) ---------- */
const form = $('#task-form');
const formTitle = $('#form-title');
const submitButton = $('#submit-task');
const cancelButton = $('#cancel-edit');

function showFormErrors(errors) {
  for (const name of ['title', 'notes', 'dueDate']) {
    const input = form.elements[name];
    const message = errors[name] ?? '';
    input.closest('.field').querySelector('.error').textContent = message;
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }
  const first = ['title', 'notes', 'dueDate'].find((name) => errors[name]);
  if (first) form.elements[first].focus();
}

function resetForm() {
  state.editingId = null;
  form.reset();
  showFormErrors({});
  formTitle.textContent = 'Nova tarefa';
  submitButton.textContent = 'Adicionar tarefa';
  cancelButton.hidden = true;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = {
    title: form.elements.title.value,
    notes: form.elements.notes.value,
    dueDate: form.elements.dueDate.value,
  };

  if (state.editingId) {
    const result = updateTask(state.tasks, state.editingId, input);
    showFormErrors(result.errors);
    if (Object.keys(result.errors).length > 0) return;
    state.tasks = result.tasks;
    notice('Tarefa atualizada.', 'ok');
  } else {
    const { task, errors } = createTask(input);
    showFormErrors(errors);
    if (!task) return;
    state.tasks = [...state.tasks, task];
    notice('Tarefa criada.', 'ok');
  }
  persist();
  resetForm();
  render();
  form.elements.title.focus();
});

cancelButton.addEventListener('click', () => {
  resetForm();
  notice('');
});

/* ---------- Ações na lista (delegação de eventos) ---------- */
listEl.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const id = button.closest('li').dataset.id;
  const task = state.tasks.find((item) => item.id === id);
  if (!task) return;

  if (button.dataset.action === 'edit') {
    state.editingId = id;
    form.elements.title.value = task.title;
    form.elements.notes.value = task.notes;
    form.elements.dueDate.value = task.dueDate;
    formTitle.textContent = 'Editar tarefa';
    submitButton.textContent = 'Salvar alterações';
    cancelButton.hidden = false;
    form.elements.title.focus();
    form.scrollIntoView({ block: 'nearest' });
  }

  if (button.dataset.action === 'remove') {
    const index = state.tasks.findIndex((item) => item.id === id);
    state.lastRemoved = { task, index };
    state.tasks = removeTask(state.tasks, id);
    if (state.editingId === id) resetForm();
    persist();
    render();
    notice(`"${task.title}" removida.`, '', () => {
      const { task: removed, index: at } = state.lastRemoved;
      state.tasks = [...state.tasks.slice(0, at), removed, ...state.tasks.slice(at)];
      state.lastRemoved = null;
      persist();
      render();
      notice('Remoção desfeita.', 'ok');
    });
  }
});

listEl.addEventListener('change', (event) => {
  if (event.target.dataset.action !== 'toggle') return;
  const id = event.target.closest('li').dataset.id;
  state.tasks = toggleTask(state.tasks, id);
  persist();
  render();
  // Após re-renderizar, devolve o foco ao checkbox da mesma tarefa.
  listEl.querySelector(`[data-id="${CSS.escape(id)}"] input`)?.focus();
});

/* ---------- Busca, filtro e ordenação ---------- */
$('#search').addEventListener('input', (event) => {
  state.filters.query = event.target.value;
  render();
});
$('#status-filter').addEventListener('change', (event) => {
  state.filters.status = event.target.value;
  render();
});
$('#sort-by').addEventListener('change', (event) => {
  state.sort.by = event.target.value;
  render();
});
$('#sort-direction').addEventListener('click', (event) => {
  state.sort.direction = state.sort.direction === 'asc' ? 'desc' : 'asc';
  event.currentTarget.textContent =
    state.sort.direction === 'asc' ? 'Crescente' : 'Decrescente';
  event.currentTarget.setAttribute(
    'aria-pressed',
    String(state.sort.direction === 'desc'),
  );
  render();
});
$('#clear-done').addEventListener('click', () => {
  const removed = state.tasks.filter((task) => task.done).length;
  state.tasks = clearCompleted(state.tasks);
  persist();
  render();
  notice(`${removed} tarefa(s) concluída(s) removida(s).`, 'ok');
});

render();

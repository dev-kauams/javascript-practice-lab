// Lógica de dados do gerenciador de tarefas: funções puras e imutáveis.
// Nada aqui toca o DOM nem o localStorage.

export const LIMITS = { title: 80, notes: 500 };

/* ---------- Datas (sem fuso: "YYYY-MM-DD" é só um dia do calendário) ---------- */

export function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
  );
}

/** Formata "2026-10-24" como "24 de out. de 2026" sem deslocar o dia por fuso horário. */
export function formatDueDate(value, locale = 'pt-BR') {
  if (!isValidDateString(value)) return '';
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
    new Date(year, month - 1, day),
  );
}

export function todayString(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Strings ISO de data comparam corretamente em ordem alfabética. */
export function isOverdue(task, today = todayString()) {
  return !task.done && Boolean(task.dueDate) && task.dueDate < today;
}

/* ---------- Validação e criação ---------- */

export function validateTaskInput({ title = '', notes = '', dueDate = '' } = {}) {
  const errors = {};
  const cleanTitle = String(title).trim();
  if (!cleanTitle) errors.title = 'Informe um título.';
  else if (cleanTitle.length > LIMITS.title)
    errors.title = `Use no máximo ${LIMITS.title} caracteres.`;
  if (String(notes).trim().length > LIMITS.notes)
    errors.notes = `Use no máximo ${LIMITS.notes} caracteres.`;
  if (dueDate && !isValidDateString(dueDate)) errors.dueDate = 'Informe uma data válida.';
  return errors;
}

export function createTask(
  input,
  { now = Date.now(), makeId = () => crypto.randomUUID() } = {},
) {
  const errors = validateTaskInput(input);
  if (Object.keys(errors).length > 0) return { task: null, errors };
  return {
    task: {
      id: makeId(),
      title: input.title.trim(),
      notes: String(input.notes ?? '').trim(),
      dueDate: input.dueDate || '',
      done: false,
      createdAt: now,
    },
    errors: {},
  };
}

/* ---------- CRUD imutável ---------- */

export function updateTask(tasks, id, changes) {
  const current = tasks.find((task) => task.id === id);
  if (!current) return { tasks, errors: { id: 'Tarefa não encontrada.' } };
  const merged = { ...current, ...changes };
  const errors = validateTaskInput(merged);
  if (Object.keys(errors).length > 0) return { tasks, errors };
  const next = {
    ...merged,
    title: merged.title.trim(),
    notes: String(merged.notes ?? '').trim(),
  };
  return { tasks: tasks.map((task) => (task.id === id ? next : task)), errors: {} };
}

export function toggleTask(tasks, id) {
  return tasks.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
}

export function removeTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}

export function clearCompleted(tasks) {
  return tasks.filter((task) => !task.done);
}

/* ---------- Consulta: busca, filtro e ordenação (derivados, nunca guardados) ---------- */

/** Minúsculas e sem acentos: "Coração" encontra "coracao". */
export function normalizeText(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function filterTasks(tasks, { query = '', status = 'all' } = {}) {
  const needle = normalizeText(query).trim();
  return tasks.filter((task) => {
    if (status === 'open' && task.done) return false;
    if (status === 'done' && !task.done) return false;
    if (!needle) return true;
    return normalizeText(`${task.title} ${task.notes}`).includes(needle);
  });
}

const COMPARATORS = {
  created: (a, b) => a.createdAt - b.createdAt,
  title: (a, b) => a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' }),
  status: (a, b) => Number(a.done) - Number(b.done),
};

export function sortTasks(tasks, by = 'created', direction = 'asc') {
  const sign = direction === 'desc' ? -1 : 1;
  const copy = [...tasks]; // sort() muta; copiamos para preservar o original
  if (by === 'due') {
    // Tarefas sem prazo vão para o fim, independentemente da direção escolhida.
    return copy.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return a.createdAt - b.createdAt;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return sign * a.dueDate.localeCompare(b.dueDate);
    });
  }
  const compare = COMPARATORS[by] ?? COMPARATORS.created;
  return copy.sort((a, b) => sign * compare(a, b) || a.createdAt - b.createdAt);
}

export function summarize(tasks, today = todayString()) {
  const done = tasks.filter((task) => task.done).length;
  return {
    total: tasks.length,
    done,
    open: tasks.length - done,
    overdue: tasks.filter((task) => isOverdue(task, today)).length,
  };
}

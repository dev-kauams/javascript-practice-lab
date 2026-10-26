// Persistência em localStorage com tolerância a dados ausentes, corrompidos ou indisponíveis.
// `storage` é injetado: no navegador é window.localStorage; nos testes, um objeto falso.
import { LIMITS, isValidDateString } from './store.js';

export const STORAGE_KEY = 'practice-lab:task-manager:v1';

/** Aceita só tarefas bem formadas; devolve null para qualquer outra coisa. */
export function sanitizeTask(raw) {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const { id, title, notes = '', dueDate = '', done = false, createdAt } = raw;
  if (typeof id !== 'string' || id === '') return null;
  if (typeof title !== 'string' || title.trim() === '' || title.length > LIMITS.title)
    return null;
  if (typeof notes !== 'string' || notes.length > LIMITS.notes) return null;
  if (dueDate !== '' && !isValidDateString(dueDate)) return null;
  if (typeof done !== 'boolean') return null;
  if (!Number.isFinite(createdAt)) return null;
  return { id, title: title.trim(), notes, dueDate, done, createdAt };
}

/**
 * Lê as tarefas. Retorna `recovered: true` quando algo foi descartado ou o JSON estava
 * quebrado, para a interface poder avisar a pessoa em vez de falhar em silêncio.
 */
export function loadTasks(storage) {
  let text;
  try {
    text = storage.getItem(STORAGE_KEY);
  } catch {
    return { tasks: [], recovered: false, unavailable: true, discarded: 0 };
  }
  if (text === null || text === undefined)
    return { tasks: [], recovered: false, discarded: 0 };

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { tasks: [], recovered: true, reason: 'json-invalido', discarded: 0 };
  }
  const list = Array.isArray(data) ? data : data?.tasks;
  if (!Array.isArray(list))
    return { tasks: [], recovered: true, reason: 'formato-invalido', discarded: 0 };

  const seen = new Set();
  const tasks = [];
  for (const item of list) {
    const task = sanitizeTask(item);
    if (task && !seen.has(task.id)) {
      seen.add(task.id);
      tasks.push(task);
    }
  }
  const discarded = list.length - tasks.length;
  return {
    tasks,
    recovered: discarded > 0,
    reason: discarded > 0 ? 'itens-descartados' : undefined,
    discarded,
  };
}

export function saveTasks(storage, tasks) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, tasks }));
    return { ok: true };
  } catch (error) {
    // Cota excedida, modo privado restrito ou armazenamento bloqueado.
    return { ok: false, error: error?.name ?? 'StorageError' };
  }
}

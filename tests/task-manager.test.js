import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  clearCompleted,
  createTask,
  filterTasks,
  formatDueDate,
  isOverdue,
  isValidDateString,
  normalizeText,
  removeTask,
  sortTasks,
  summarize,
  toggleTask,
  todayString,
  updateTask,
  validateTaskInput,
} from '../projects/task-manager/src/store.js';
import {
  STORAGE_KEY,
  loadTasks,
  sanitizeTask,
  saveTasks,
} from '../projects/task-manager/src/storage.js';

const task = (overrides = {}) => ({
  id: 'x',
  title: 'Tarefa',
  notes: '',
  dueDate: '',
  done: false,
  createdAt: 1,
  ...overrides,
});

const fakeStorage = (initial = {}) => {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    data,
  };
};

describe('datas', () => {
  test('isValidDateString rejeita datas impossíveis', () => {
    assert.equal(isValidDateString('2026-10-24'), true);
    assert.equal(isValidDateString('2026-02-30'), false);
    assert.equal(isValidDateString('2024-02-29'), true);
    assert.equal(isValidDateString('2026-13-01'), false);
    assert.equal(isValidDateString('24/10/2026'), false);
    assert.equal(isValidDateString(undefined), false);
  });
  test('formatDueDate não desloca o dia por fuso horário', () => {
    assert.equal(formatDueDate('2026-10-24', 'pt-BR').includes('24'), true);
    assert.equal(formatDueDate('2026-01-01', 'pt-BR').startsWith('1 '), true);
    assert.equal(formatDueDate('invalida'), '');
  });
  test('isOverdue e todayString', () => {
    assert.equal(todayString(new Date(2026, 9, 5)), '2026-10-05');
    assert.equal(isOverdue(task({ dueDate: '2026-10-01' }), '2026-10-05'), true);
    assert.equal(isOverdue(task({ dueDate: '2026-10-05' }), '2026-10-05'), false);
    assert.equal(
      isOverdue(task({ dueDate: '2026-10-01', done: true }), '2026-10-05'),
      false,
    );
    assert.equal(isOverdue(task(), '2026-10-05'), false);
  });
});

describe('validação e criação', () => {
  test('validateTaskInput', () => {
    assert.deepEqual(Object.keys(validateTaskInput({ title: ' ' })), ['title']);
    assert.deepEqual(Object.keys(validateTaskInput({ title: 'a'.repeat(81) })), [
      'title',
    ]);
    assert.deepEqual(
      Object.keys(validateTaskInput({ title: 'ok', notes: 'n'.repeat(501) })),
      ['notes'],
    );
    assert.deepEqual(
      Object.keys(validateTaskInput({ title: 'ok', dueDate: '2026-02-31' })),
      ['dueDate'],
    );
    assert.deepEqual(validateTaskInput({ title: 'ok' }), {});
    assert.deepEqual(Object.keys(validateTaskInput()), ['title']);
  });
  test('createTask limpa espaços e usa id/data injetados', () => {
    const { task: created, errors } = createTask(
      { title: '  Estudar  ', notes: ' n ', dueDate: '2026-10-30' },
      { now: 123, makeId: () => 'abc' },
    );
    assert.deepEqual(errors, {});
    assert.deepEqual(created, {
      id: 'abc',
      title: 'Estudar',
      notes: 'n',
      dueDate: '2026-10-30',
      done: false,
      createdAt: 123,
    });
  });
  test('createTask inválida não cria nada', () => {
    const result = createTask({ title: '' });
    assert.equal(result.task, null);
    assert.ok(result.errors.title);
  });
});

describe('CRUD imutável', () => {
  test('updateTask altera só a tarefa alvo e valida', () => {
    const tasks = [task({ id: 'a' }), task({ id: 'b', title: 'B' })];
    const ok = updateTask(tasks, 'a', { title: ' Novo ' });
    assert.equal(ok.tasks[0].title, 'Novo');
    assert.equal(ok.tasks[1], tasks[1]);
    assert.equal(tasks[0].title, 'Tarefa');
    assert.ok(updateTask(tasks, 'a', { title: '' }).errors.title);
    assert.ok(updateTask(tasks, 'zzz', { title: 'x' }).errors.id);
  });
  test('toggleTask, removeTask e clearCompleted', () => {
    const tasks = [task({ id: 'a' }), task({ id: 'b', done: true })];
    assert.equal(toggleTask(tasks, 'a')[0].done, true);
    assert.equal(tasks[0].done, false);
    assert.deepEqual(
      removeTask(tasks, 'a').map((t) => t.id),
      ['b'],
    );
    assert.deepEqual(
      clearCompleted(tasks).map((t) => t.id),
      ['a'],
    );
  });
});

describe('busca, filtro e ordenação', () => {
  const tasks = [
    task({ id: '1', title: 'Comprar café', notes: 'Coração do dia', createdAt: 3 }),
    task({
      id: '2',
      title: 'Estudar JS',
      done: true,
      createdAt: 1,
      dueDate: '2026-11-02',
    }),
    task({ id: '3', title: 'álgebra', createdAt: 2, dueDate: '2026-10-20' }),
  ];
  test('normalizeText remove acentos', () => {
    assert.equal(normalizeText('Coração'), 'coracao');
  });
  test('filterTasks busca sem acento em título e notas e filtra por estado', () => {
    assert.deepEqual(
      filterTasks(tasks, { query: 'CORACAO' }).map((t) => t.id),
      ['1'],
    );
    assert.deepEqual(
      filterTasks(tasks, { query: 'algebra' }).map((t) => t.id),
      ['3'],
    );
    assert.deepEqual(
      filterTasks(tasks, { status: 'done' }).map((t) => t.id),
      ['2'],
    );
    assert.deepEqual(
      filterTasks(tasks, { status: 'open' }).map((t) => t.id),
      ['1', '3'],
    );
    assert.deepEqual(filterTasks(tasks, { query: 'zzz' }), []);
  });
  test('sortTasks por nome ignora acentos e maiúsculas e não muta', () => {
    const before = tasks.map((t) => t.id);
    assert.deepEqual(
      sortTasks(tasks, 'title').map((t) => t.id),
      ['3', '1', '2'],
    );
    assert.deepEqual(
      sortTasks(tasks, 'title', 'desc').map((t) => t.id),
      ['2', '1', '3'],
    );
    assert.deepEqual(
      tasks.map((t) => t.id),
      before,
    );
  });
  test('sortTasks por prazo deixa tarefas sem prazo por último nas duas direções', () => {
    assert.deepEqual(
      sortTasks(tasks, 'due').map((t) => t.id),
      ['3', '2', '1'],
    );
    assert.deepEqual(
      sortTasks(tasks, 'due', 'desc').map((t) => t.id),
      ['2', '3', '1'],
    );
  });
  test('sortTasks por estado e criação', () => {
    assert.deepEqual(
      sortTasks(tasks, 'status').map((t) => t.id),
      ['3', '1', '2'],
    );
    assert.deepEqual(
      sortTasks(tasks, 'created').map((t) => t.id),
      ['2', '3', '1'],
    );
    assert.deepEqual(
      sortTasks(tasks, 'inexistente').map((t) => t.id),
      ['2', '3', '1'],
    );
  });
  test('summarize', () => {
    assert.deepEqual(summarize(tasks, '2026-10-25'), {
      total: 3,
      done: 1,
      open: 2,
      overdue: 1,
    });
    assert.deepEqual(summarize([]), { total: 0, done: 0, open: 0, overdue: 0 });
  });
});

describe('localStorage', () => {
  test('saveTasks e loadTasks fazem ida e volta', () => {
    const storage = fakeStorage();
    const tasks = [task({ id: 'a', dueDate: '2026-10-30' })];
    assert.deepEqual(saveTasks(storage, tasks), { ok: true });
    const loaded = loadTasks(storage);
    assert.deepEqual(loaded.tasks, tasks);
    assert.equal(loaded.recovered, false);
  });
  test('sem dados salvos retorna lista vazia sem alarme', () => {
    assert.deepEqual(loadTasks(fakeStorage()), {
      tasks: [],
      recovered: false,
      discarded: 0,
    });
  });
  test('JSON corrompido é descartado com aviso', () => {
    const result = loadTasks(fakeStorage({ [STORAGE_KEY]: '{quebrado' }));
    assert.deepEqual(
      [result.tasks, result.recovered, result.reason],
      [[], true, 'json-invalido'],
    );
  });
  test('formato inesperado é descartado com aviso', () => {
    const result = loadTasks(fakeStorage({ [STORAGE_KEY]: '{"tasks":"nao-e-lista"}' }));
    assert.equal(result.reason, 'formato-invalido');
    assert.equal(
      loadTasks(fakeStorage({ [STORAGE_KEY]: 'null' })).reason,
      'formato-invalido',
    );
  });
  test('itens inválidos e duplicados são filtrados, os válidos ficam', () => {
    const payload = [
      task({ id: 'ok' }),
      { id: 1 },
      null,
      'x',
      task({ id: 'ok' }),
      task({ id: 'b', dueDate: '2026-99-99' }),
    ];
    const result = loadTasks(fakeStorage({ [STORAGE_KEY]: JSON.stringify(payload) }));
    assert.deepEqual(
      result.tasks.map((t) => t.id),
      ['ok'],
    );
    assert.equal(result.discarded, 5);
    assert.equal(result.recovered, true);
  });
  test('armazenamento que lança erro na leitura ou escrita não derruba o app', () => {
    const broken = {
      getItem: () => {
        throw new Error('bloqueado');
      },
      setItem: () => {
        throw new DOMException('cheio', 'QuotaExceededError');
      },
    };
    assert.equal(loadTasks(broken).unavailable, true);
    assert.deepEqual(saveTasks(broken, []), { ok: false, error: 'QuotaExceededError' });
  });
  test('sanitizeTask aplica padrões e rejeita tipos errados', () => {
    assert.deepEqual(sanitizeTask({ id: 'a', title: ' T ', createdAt: 5 }), {
      id: 'a',
      title: 'T',
      notes: '',
      dueDate: '',
      done: false,
      createdAt: 5,
    });
    assert.equal(sanitizeTask({ id: 'a', title: 'T', createdAt: 'x' }), null);
    assert.equal(sanitizeTask({ id: 'a', title: 'T', createdAt: 1, done: 'sim' }), null);
    assert.equal(sanitizeTask([]), null);
  });
});

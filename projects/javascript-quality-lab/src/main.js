import { h } from '../../_shared/dom.js';
import { implementations, compareImplementations, makeInput } from './compare.js';
import { parseConfig } from './errors.js';
import { bugs } from './bugs.js';
import { formatPerson, legacy, refactored } from './refactor.js';
import { normalizeUser } from './validation.js';

const $ = (selector) => document.querySelector(selector);
const show = (value) => (typeof value === 'string' ? value : JSON.stringify(value));

/* ---------- Caça-bugs ---------- */
$('#bugs').append(
  ...bugs.map((bug) => {
    const result = bug.demo();
    return h(
      'article',
      { class: 'panel' },
      h('h3', {}, bug.title),
      h('p', { class: 'muted' }, bug.explanation),
      h('p', {}, h('strong', {}, 'Entrada: '), h('code', {}, show(result.entrada))),
      h(
        'div',
        { class: 'compare' },
        h(
          'div',
          { class: 'bad' },
          h('strong', {}, 'Com bug'),
          h('pre', {}, show(result.comBug)),
        ),
        h(
          'div',
          { class: 'good' },
          h('strong', {}, 'Corrigido'),
          h('pre', {}, show(result.corrigido)),
        ),
      ),
      h(
        'details',
        {},
        h('summary', {}, 'Ver as duas implementações'),
        h('pre', {}, `${bug.buggy}\n\n${bug.fixed}`),
      ),
    );
  }),
);

/* ---------- Comparação de implementações ---------- */
const benchForm = $('#bench-form');
const benchOut = $('#bench-out');
benchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const kind = benchForm.elements.kind.value;
  const size = Math.min(
    Math.max(Number(benchForm.elements.size.value) || 1000, 10),
    20000,
  );
  const { agree, results } = compareImplementations(
    implementations[kind],
    makeInput(size),
    { runs: 10 },
  );
  benchOut.replaceChildren(
    h(
      'p',
      { class: agree ? 'status ok' : 'status error' },
      agree
        ? 'Todas as implementações produzem o mesmo resultado.'
        : 'Atenção: as implementações divergem!',
    ),
    h(
      'ul',
      {},
      results.map((r) => h('li', {}, `${r.name}: ${r.averageMs.toFixed(3)} ms em média`)),
    ),
    h(
      'p',
      { class: 'muted' },
      'Micro-benchmarks variam entre execuções e navegadores: use-os para comparar ordens de grandeza, nunca como verdade absoluta.',
    ),
  );
});

/* ---------- Refatoração ---------- */
const sample = { firstName: ' Ana ', lastName: 'Souza ' };
$('#refactor').append(
  h(
    'div',
    { class: 'compare' },
    h(
      'div',
      {},
      h('strong', {}, 'Antes (3 funções duplicadas)'),
      h('pre', {}, legacy.formatClient.toString()),
      h('p', {}, h('code', {}, legacy.formatSupplier(sample))),
    ),
    h(
      'div',
      {},
      h('strong', {}, 'Depois (1 função + tabela)'),
      h('pre', {}, formatPerson.toString()),
      h('p', {}, h('code', {}, refactored.formatSupplier(sample))),
    ),
  ),
);

/* ---------- Tratamento de erros e validação ---------- */
const errForm = $('#error-form');
const errOut = $('#error-out');
errForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = errForm.elements.json.value;
  const config = parseConfig(text);
  let user = null;
  try {
    user = normalizeUser(JSON.parse(text));
  } catch {
    user = null;
  }
  errOut.replaceChildren(
    h(
      'p',
      { class: config.ok ? 'status ok' : 'status error' },
      config.ok
        ? `Configuração válida: ${show(config.value)}`
        : `Configuração inválida: ${config.error.message}`,
    ),
    user
      ? h(
          'p',
          { class: user.ok ? 'status ok' : 'status error' },
          user.ok
            ? `Cadastro normalizado: ${show(user.value)}`
            : `Cadastro com erros: ${show(user.errors)}`,
        )
      : null,
  );
});

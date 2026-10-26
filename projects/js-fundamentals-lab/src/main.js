import { h, announce } from '../../_shared/dom.js';
import { groups } from './challenges.js';

const container = document.querySelector('#groups');
const live = document.querySelector('#live');

function stringifyResult(value) {
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}

function createCard(challenge) {
  const inputId = `in-${challenge.id}-${Math.random().toString(36).slice(2, 7)}`;
  const input = h('textarea', { id: inputId, rows: 3, value: challenge.example });
  const output = h(
    'pre',
    { 'aria-label': `Resultado de ${challenge.title}` },
    'Clique em Executar.',
  );
  const source = h('pre', { hidden: true }, challenge.fn.toString());

  const run = () => {
    try {
      output.textContent = stringifyResult(challenge.run(input.value));
      output.classList.remove('is-error');
    } catch (error) {
      // Entradas inválidas (JSON quebrado, argumentos errados) viram mensagem, não crash.
      output.textContent = `Erro: ${error.message}`;
      output.classList.add('is-error');
    }
    announce(live, `${challenge.title} executado.`);
  };

  const toggleSource = h(
    'button',
    {
      type: 'button',
      class: 'secondary',
      'aria-expanded': 'false',
      onClick: (event) => {
        source.hidden = !source.hidden;
        event.currentTarget.setAttribute('aria-expanded', String(!source.hidden));
        event.currentTarget.textContent = source.hidden ? 'Ver código' : 'Ocultar código';
      },
    },
    'Ver código',
  );

  return h(
    'article',
    { class: 'panel challenge' },
    h('h3', {}, h('code', {}, challenge.title)),
    h(
      'p',
      { class: 'muted' },
      challenge.concept,
      challenge.note ? ` — ${challenge.note}` : '',
    ),
    h('label', { for: inputId }, 'Entrada'),
    input,
    h(
      'div',
      { class: 'row actions' },
      h('button', { type: 'button', onClick: run }, 'Executar'),
      toggleSource,
    ),
    output,
    source,
  );
}

for (const group of groups) {
  const headingId = `h-${group.id}`;
  container.append(
    h(
      'section',
      { 'aria-labelledby': headingId },
      h('h2', { id: headingId }, group.title),
      h('div', { class: 'grid cards' }, group.challenges.map(createCard)),
    ),
  );
}

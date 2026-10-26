import { h, announce } from '../../_shared/dom.js';
import { COPY_MESSAGES, copyText } from './clipboard.js';
import {
  effectiveType,
  formatBytes,
  prettyText,
  previewKind,
  validateFile,
} from './files.js';
import { buildSearch, parseParams, removeParam, setParam } from './params.js';
import { THEME_KEY, isValidPreference, resolveTheme, safeStorage } from './theme.js';

const $ = (selector) => document.querySelector(selector);
const live = $('#live');
const store = safeStorage(() => window.localStorage);

/* ---------- Mensagens de sucesso e erro ---------- */
const messages = $('#messages');
function showMessage(kind, text) {
  const item = h(
    'li',
    { class: `status ${kind}`, role: kind === 'error' ? 'alert' : 'status' },
    text,
  );
  messages.prepend(item);
  while (messages.children.length > 4) messages.lastElementChild.remove();
  announce(live, text);
}

/* ---------- Tema ---------- */
const themeSelect = $('#theme');
const media = window.matchMedia('(prefers-color-scheme: dark)');
let preference = store.get(THEME_KEY);
if (!isValidPreference(preference)) preference = 'dark';

function applyTheme() {
  document.documentElement.dataset.theme = resolveTheme(preference, media.matches);
}
themeSelect.value = preference;
applyTheme();
themeSelect.addEventListener('change', () => {
  preference = themeSelect.value;
  applyTheme();
  const saved = store.set(THEME_KEY, preference);
  showMessage(
    saved ? 'ok' : 'error',
    saved
      ? 'Preferência de tema salva.'
      : 'Tema aplicado, mas o navegador não permitiu salvar a preferência.',
  );
});
media.addEventListener('change', () => preference === 'system' && applyTheme());

/* ---------- Área de transferência ---------- */
async function copyAndReport(text, successText) {
  const result = await copyText(text);
  if (result.ok) showMessage('ok', successText);
  else showMessage('error', COPY_MESSAGES[result.reason]);
}
$('#copy-text').addEventListener('click', () =>
  copyAndReport($('#clip-source').value, 'Texto copiado.'),
);

/* ---------- Parâmetros da URL ---------- */
let entries = parseParams(location.search);
const paramsBody = $('#params-body');
function renderParams() {
  paramsBody.replaceChildren(
    ...entries.map(({ key, value }) =>
      h(
        'tr',
        {},
        h('th', { scope: 'row' }, key),
        h('td', {}, value),
        h(
          'td',
          {},
          h(
            'button',
            {
              type: 'button',
              class: 'secondary',
              'data-remove': key,
              'aria-label': `Remover parâmetro ${key}`,
            },
            'Remover',
          ),
        ),
      ),
    ),
  );
  $('#params-empty').hidden = entries.length > 0;
  $('#params-table').hidden = entries.length === 0;
}
function syncUrl() {
  history.replaceState(null, '', `${location.pathname}${buildSearch(entries)}`);
  renderParams();
}
$('#param-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const result = setParam(entries, form.elements.key.value, form.elements.value.value);
  if (result.error) {
    showMessage('error', result.error);
    form.elements.key.focus();
    return;
  }
  entries = result.entries;
  form.reset();
  syncUrl();
  showMessage('ok', 'Parâmetro adicionado à URL.');
});
paramsBody.addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove]');
  if (!button) return;
  entries = removeParam(entries, button.dataset.remove);
  syncUrl();
});
$('#copy-link').addEventListener('click', () =>
  copyAndReport(location.href, 'Link copiado.'),
);
renderParams();

/* ---------- Arquivos ---------- */
const fileInput = $('#file');
const info = $('#file-info');
const previewBox = $('#preview');
let objectUrl = null;

function clearPreview() {
  if (objectUrl) URL.revokeObjectURL(objectUrl); // libera memória do blob anterior
  objectUrl = null;
  previewBox.replaceChildren();
  info.textContent = '';
}

fileInput.addEventListener('change', async () => {
  clearPreview();
  const file = fileInput.files[0];
  if (!file) return;

  const check = validateFile(file);
  if (!check.ok) {
    fileInput.value = ''; // permite escolher o mesmo arquivo novamente depois
    showMessage('error', check.error);
    return;
  }
  info.textContent = `${file.name} · ${check.type} · ${formatBytes(file.size)}`;

  try {
    if (previewKind(check.type) === 'image') {
      objectUrl = URL.createObjectURL(file);
      previewBox.replaceChildren(
        h('img', {
          src: objectUrl,
          alt: `Pré-visualização de ${file.name}`,
          class: 'preview-image',
        }),
      );
    } else {
      const text = await file.text();
      const shown = prettyText(text.slice(0, 4000), effectiveType(file));
      previewBox.replaceChildren(
        h('pre', { tabIndex: 0, 'aria-label': `Conteúdo de ${file.name}` }, shown),
        text.length > 4000
          ? h('p', { class: 'muted' }, 'Mostrando os primeiros 4000 caracteres.')
          : null,
      );
    }
    showMessage('ok', 'Arquivo lido localmente. Nada foi enviado a nenhum servidor.');
  } catch {
    clearPreview();
    showMessage(
      'error',
      'Não foi possível ler o arquivo. Ele pode ter sido movido ou estar bloqueado.',
    );
  }
});
window.addEventListener('pagehide', clearPreview);

/* ---------- Disponibilidade das APIs ---------- */
const availability = [
  ['Clipboard API (navigator.clipboard)', Boolean(navigator.clipboard?.writeText)],
  ['Contexto seguro (HTTPS ou localhost)', window.isSecureContext],
  ['localStorage', store.available],
  ['URL.createObjectURL', typeof URL.createObjectURL === 'function'],
];
$('#availability').replaceChildren(
  ...availability.map(([name, ok]) =>
    h('li', {}, `${ok ? 'Disponível' : 'Indisponível'}: ${name}`),
  ),
);

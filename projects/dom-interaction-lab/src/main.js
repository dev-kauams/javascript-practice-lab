import { announce } from '../../_shared/dom.js';
import { initAccordion } from './components/accordion.js';
import { initCharCounter } from './components/char-counter.js';
import { initCounter } from './components/counter.js';
import { initItemsList } from './components/items-list.js';
import { initModal } from './components/modal.js';
import { initShortcuts } from './components/shortcuts.js';
import { initTabs } from './components/tabs.js';

const $ = (selector) => document.querySelector(selector);
const live = $('#live');

initCounter($('#demo-counter'), { min: 0, max: 10 });
const list = initItemsList($('#demo-list'), live);
initTabs($('#demo-tabs'));
initAccordion($('#demo-accordion'), { single: true });
initCharCounter($('#demo-chars'), live);

/* Modal de confirmação */
const result = $('#modal-result');
const confirmModal = initModal($('#confirm-dialog'), {
  onClose: (value) => {
    result.textContent = value === 'confirm' ? 'Ação confirmada.' : 'Ação cancelada.';
    announce(live, result.textContent);
  },
});
$('#open-confirm').addEventListener('click', (event) =>
  confirmModal.open(event.currentTarget),
);

/* Modal de ajuda dos atalhos */
const helpModal = initModal($('#help-dialog'));

/* Atalhos de teclado */
const lastShortcut = $('#last-shortcut');
initShortcuts(
  [
    {
      combo: 'alt+n',
      label: 'Alt+N: foco no campo da lista',
      action: () => list.focusInput(),
    },
    {
      combo: 'alt+m',
      label: 'Alt+M: modal de confirmação',
      action: () => confirmModal.open($('#open-confirm')),
    },
    { combo: '?', label: '?: ajuda de atalhos', action: () => helpModal.open() },
  ],
  (label) => {
    lastShortcut.textContent = label;
  },
);

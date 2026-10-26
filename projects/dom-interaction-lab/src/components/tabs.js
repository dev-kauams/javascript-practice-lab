import { nextTabIndex } from '../logic.js';

/** Tabs acessíveis: roving tabindex, setas, Home/End e aria-selected. */
export function initTabs(root) {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((tab) =>
    document.getElementById(tab.getAttribute('aria-controls')),
  );

  function select(index, { focus = false } = {}) {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
    });
    if (focus) tabs[index].focus();
  }

  tabs.forEach((tab, index) => tab.addEventListener('click', () => select(index)));
  root.querySelector('[role="tablist"]').addEventListener('keydown', (event) => {
    const current = tabs.indexOf(document.activeElement);
    const target = nextTabIndex(current, event.key, tabs.length);
    if (target === null) return;
    event.preventDefault();
    select(target, { focus: true });
  });
  select(0);
}

// Utilitários mínimos de DOM compartilhados pelos projetos.
// Regra do laboratório: dados do usuário ou de APIs entram no DOM via textContent,
// nunca via innerHTML.

/**
 * Cria um elemento. `props` define atributos/propriedades; `children` aceita
 * strings (viram nós de texto, portanto seguros) ou nós.
 */
export function h(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key in node && key !== 'list') node[key] = value;
    else node.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

/** Remove todos os filhos de um elemento. */
export function clear(node) {
  node.replaceChildren();
}

/**
 * Anuncia uma mensagem para leitores de tela em uma região aria-live.
 * Limpar e reescrever força a releitura de mensagens repetidas.
 */
export function announce(region, message) {
  region.textContent = '';
  requestAnimationFrame(() => {
    region.textContent = message;
  });
}

// Leitura e escrita de parâmetros da URL com URLSearchParams.

/** "?a=1&b=dois&a=3" -> [{key:'a',value:'1'},{key:'b',value:'dois'},{key:'a',value:'3'}] */
export function parseParams(search) {
  return [...new URLSearchParams(search).entries()].map(([key, value]) => ({
    key,
    value,
  }));
}

export function buildSearch(entries) {
  const params = new URLSearchParams();
  for (const { key, value } of entries) params.append(key, value);
  const text = params.toString();
  return text ? `?${text}` : '';
}

/** Adiciona (ou substitui) um parâmetro; chaves vazias são rejeitadas. */
export function setParam(entries, key, value) {
  const cleanKey = String(key ?? '').trim();
  if (!cleanKey) return { entries, error: 'Informe o nome do parâmetro.' };
  if (cleanKey.length > 50)
    return { entries, error: 'O nome pode ter no máximo 50 caracteres.' };
  const rest = entries.filter((entry) => entry.key !== cleanKey);
  return { entries: [...rest, { key: cleanKey, value: String(value ?? '') }], error: '' };
}

export const removeParam = (entries, key) => entries.filter((entry) => entry.key !== key);

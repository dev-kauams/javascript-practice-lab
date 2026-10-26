// Copiar para a área de transferência com tratamento dos casos em que ela falha.
// A API moderna (navigator.clipboard) só existe em contexto seguro (HTTPS/localhost)
// e pode ser negada pelo navegador. Há um plano B com execCommand('copy').

export function legacyCopy(text, doc = globalThis.document) {
  if (!doc?.body || typeof doc.execCommand !== 'function') return false;
  const area = doc.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  doc.body.append(area);
  area.select();
  try {
    return doc.execCommand('copy');
  } catch {
    return false;
  } finally {
    area.remove();
  }
}

/**
 * Retorna { ok, via } em caso de sucesso ou { ok: false, reason } com reason em:
 * 'empty' | 'denied' | 'unavailable' | 'error'.
 */
export async function copyText(
  text,
  { clipboard = globalThis.navigator?.clipboard, fallback = legacyCopy } = {},
) {
  if (!text) return { ok: false, reason: 'empty' };

  if (clipboard?.writeText) {
    try {
      await clipboard.writeText(text);
      return { ok: true, via: 'clipboard' };
    } catch (error) {
      if (error?.name !== 'NotAllowedError') {
        return fallback(text)
          ? { ok: true, via: 'fallback' }
          : { ok: false, reason: 'error' };
      }
      // Permissão negada: tentamos o plano B antes de desistir.
      return fallback(text)
        ? { ok: true, via: 'fallback' }
        : { ok: false, reason: 'denied' };
    }
  }
  return fallback(text)
    ? { ok: true, via: 'fallback' }
    : { ok: false, reason: 'unavailable' };
}

export const COPY_MESSAGES = {
  empty: 'Não há nada para copiar.',
  denied:
    'O navegador negou o acesso à área de transferência. Selecione o texto e copie com Ctrl+C.',
  unavailable:
    'A cópia automática não está disponível aqui (use HTTPS ou localhost). Copie manualmente com Ctrl+C.',
  error: 'Não foi possível copiar. Tente selecionar o texto e copiar manualmente.',
};

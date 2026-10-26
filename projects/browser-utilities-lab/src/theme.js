// Tema claro/escuro com preferência salva.
export const PREFERENCES = ['system', 'light', 'dark'];
export const THEME_KEY = 'practice-lab:theme';

export const isValidPreference = (value) => PREFERENCES.includes(value);

/** 'system' segue o sistema operacional; qualquer valor inválido cai em 'dark' (identidade do laboratório). */
export function resolveTheme(preference, systemPrefersDark) {
  if (preference === 'light') return 'light';
  if (preference === 'dark') return 'dark';
  if (preference === 'system') return systemPrefersDark ? 'dark' : 'light';
  return 'dark';
}

/**
 * Envolve o storage para nunca lançar erro: localStorage pode estar bloqueado
 * (modo privado, cookies desativados) e mesmo assim o app deve funcionar.
 */
export function safeStorage(getStorage) {
  let storage = null;
  try {
    storage = getStorage();
  } catch {
    storage = null;
  }
  return {
    available: storage !== null && storage !== undefined,
    get(key) {
      try {
        return storage?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        storage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },
  };
}

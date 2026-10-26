// Tratamento de exceções: erros próprios, Result e valores de reserva.

/** Erro de domínio: carrega o campo problemático e preserva a causa original. */
export class ValidationError extends Error {
  constructor(message, { field, cause } = {}) {
    super(message, { cause });
    this.name = 'ValidationError';
    this.field = field;
  }
}

/**
 * Padrão Result: em vez de lançar, devolve { ok: true, value } ou { ok: false, error }.
 * Quem chama é obrigado a olhar o resultado, e o fluxo normal não depende de try/catch.
 */
export function safeJsonParse(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (error) {
    return { ok: false, error: new ValidationError('JSON inválido.', { cause: error }) };
  }
}

export function assertPositiveInteger(value, field) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new ValidationError(`${field} deve ser um inteiro positivo.`, { field });
  }
  return value;
}

/** Executa `fn`; se lançar, devolve o valor de reserva (e avisa via onError, sem engolir em silêncio). */
export function withFallback(fn, fallback, onError = () => {}) {
  try {
    return fn();
  } catch (error) {
    onError(error);
    return fallback;
  }
}

/** Lê uma configuração JSON validando o formato, com erros que dizem exatamente o que falhou. */
export function parseConfig(text) {
  const parsed = safeJsonParse(text);
  if (!parsed.ok) return parsed;
  const config = parsed.value;
  if (config === null || typeof config !== 'object' || Array.isArray(config)) {
    return {
      ok: false,
      error: new ValidationError('A configuração deve ser um objeto.'),
    };
  }
  try {
    assertPositiveInteger(config.porta, 'porta');
    if (typeof config.host !== 'string' || config.host.trim() === '') {
      throw new ValidationError('host é obrigatório.', { field: 'host' });
    }
  } catch (error) {
    if (error instanceof ValidationError) return { ok: false, error };
    throw error; // erro inesperado (bug nosso): não escondemos
  }
  return { ok: true, value: { host: config.host.trim(), porta: config.porta } };
}

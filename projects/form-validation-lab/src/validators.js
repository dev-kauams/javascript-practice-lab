// Regras de validação puras (sem DOM): fáceis de testar em Node.js.
// Cada validador retorna uma string de erro ou '' quando o valor é válido.

export const PASSWORD_RULES = [
  { id: 'length', label: 'Pelo menos 8 caracteres', test: (p) => p.length >= 8 },
  { id: 'lower', label: 'Uma letra minúscula', test: (p) => /\p{Ll}/u.test(p) },
  { id: 'upper', label: 'Uma letra maiúscula', test: (p) => /\p{Lu}/u.test(p) },
  { id: 'digit', label: 'Um número', test: (p) => /\d/.test(p) },
  { id: 'symbol', label: 'Um símbolo (!@#$...)', test: (p) => /[^\p{L}\d\s]/u.test(p) },
];

export function validateRequired(value, label = 'Este campo') {
  return String(value ?? '').trim() === '' ? `${label} é obrigatório.` : '';
}

export function validateName(value) {
  const required = validateRequired(value, 'O nome');
  if (required) return required;
  const name = value.trim();
  if (name.length < 2) return 'Informe pelo menos 2 caracteres.';
  if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(name))
    return 'Use apenas letras, espaços e hífens.';
  return '';
}

// Regex pragmática: parte local, @, domínio com ponto e TLD de 2+ letras.
// Não tenta cobrir todo o RFC 5322; a verdade final é o e-mail de confirmação.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

export function validateEmail(value) {
  const required = validateRequired(value, 'O e-mail');
  if (required) return required;
  return EMAIL_PATTERN.test(value.trim())
    ? ''
    : 'Informe um e-mail válido, como nome@exemplo.com.';
}

/** Retorna cada regra com `passed`, mais a força de 0 a 5. */
export function evaluatePassword(password = '') {
  const rules = PASSWORD_RULES.map(({ id, label, test }) => ({
    id,
    label,
    passed: test(password),
  }));
  return { rules, score: rules.filter((rule) => rule.passed).length };
}

export function validatePassword(password) {
  if (!password) return 'A senha é obrigatória.';
  const failed = evaluatePassword(password).rules.find((rule) => !rule.passed);
  return failed ? `A senha precisa ter: ${failed.label.toLowerCase()}.` : '';
}

export function validateConfirm(password, confirmation) {
  if (!confirmation) return 'Confirme a senha.';
  return password === confirmation ? '' : 'As senhas não coincidem.';
}

export const digitsOnly = (value) => String(value ?? '').replace(/\D/g, '');

/** (11) 91234-5678 ou (11) 3123-4567; aceita digitação parcial. */
export function formatPhone(value) {
  const digits = digitsOnly(value).slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  const splitAt = digits.length > 10 ? 5 : 4;
  if (rest.length <= splitAt) return `(${ddd}) ${rest}`;
  return `(${ddd}) ${rest.slice(0, splitAt)}-${rest.slice(splitAt)}`;
}

/** Posição do cursor após reformatar, mantendo a quantidade de dígitos à esquerda. */
export function caretAfterFormat(formatted, digitsBeforeCaret) {
  if (digitsBeforeCaret <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i += 1) {
    if (/\d/.test(formatted[i])) seen += 1;
    if (seen === digitsBeforeCaret) return i + 1;
  }
  return formatted.length;
}

export function validatePhone(value) {
  const digits = digitsOnly(value);
  if (digits === '') return 'O telefone é obrigatório.';
  if (digits.length < 10) return 'Informe DDD e número (10 ou 11 dígitos).';
  if (/^(\d)\1+$/.test(digits)) return 'Informe um telefone real.';
  if (digits.length === 11 && digits[2] !== '9')
    return 'Celulares com 11 dígitos começam com 9 após o DDD.';
  return '';
}

export function validateTerms(checked) {
  return checked ? '' : 'Aceite os termos para continuar.';
}

/** Despacha pelo nome do campo; `values` dá acesso a campos relacionados. */
export function validateField(name, value, values = {}) {
  switch (name) {
    case 'name':
      return validateName(value);
    case 'email':
      return validateEmail(value);
    case 'phone':
      return validatePhone(value);
    case 'password':
      return validatePassword(value);
    case 'confirm':
      return validateConfirm(values.password ?? '', value);
    case 'terms':
      return validateTerms(Boolean(value));
    case 'loginPassword':
      return validateRequired(value, 'A senha');
    default:
      return '';
  }
}

export const SIGNUP_STEPS = [
  { id: 'profile', title: 'Dados pessoais', fields: ['name', 'email', 'phone'] },
  { id: 'security', title: 'Segurança', fields: ['password', 'confirm', 'terms'] },
];

/** Valida todos os campos de uma etapa; retorna só os que têm erro. */
export function validateStep(stepIndex, values) {
  const step = SIGNUP_STEPS[stepIndex];
  if (!step) return {};
  const errors = {};
  for (const field of step.fields) {
    const message = validateField(field, values[field], values);
    if (message) errors[field] = message;
  }
  return errors;
}

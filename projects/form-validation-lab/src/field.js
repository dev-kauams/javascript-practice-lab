// Ponte entre as regras puras e a Constraint Validation API do navegador.

/**
 * Aplica (ou limpa) um erro em um campo:
 *  - setCustomValidity mantém checkValidity()/reportValidity() coerentes
 *  - aria-invalid + aria-describedby avisam leitores de tela
 *  - o texto vai para o elemento .error com textContent
 */
export function setFieldError(input, message) {
  const holder = input.closest('.field');
  const errorEl = holder?.querySelector('.error');
  input.setCustomValidity(message);
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
  if (errorEl) errorEl.textContent = message;
}

export function readValue(input) {
  return input.type === 'checkbox' ? input.checked : input.value;
}

/** Liga validação em tempo real: após o primeiro blur, valida a cada digitação. */
export function bindLiveValidation(input, validate, onChange = () => {}) {
  let touched = false;
  const run = () => {
    setFieldError(input, validate(readValue(input)));
    onChange(input);
  };
  input.addEventListener('blur', () => {
    touched = true;
    run();
  });
  input.addEventListener('input', () => {
    if (touched) run();
  });
  if (input.type === 'checkbox') input.addEventListener('change', run);
  return run;
}

/** Botão de mostrar/ocultar senha, acessível via aria-pressed e aria-label. */
export function bindPasswordToggle(button, input) {
  button.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    button.setAttribute('aria-pressed', String(show));
    button.textContent = show ? 'Ocultar senha' : 'Mostrar senha';
  });
}

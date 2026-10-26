import { h, announce } from '../../_shared/dom.js';
import { bindLiveValidation, bindPasswordToggle, setFieldError } from './field.js';
import { simulateRequest } from './submit.js';
import {
  SIGNUP_STEPS,
  caretAfterFormat,
  digitsOnly,
  evaluatePassword,
  formatPhone,
  validateField,
  validateStep,
} from './validators.js';

const $ = (selector) => document.querySelector(selector);

/* ---------- Alternância entre login e cadastro ---------- */
const panels = { login: $('#login-panel'), signup: $('#signup-panel') };
const switches = { login: $('#show-login'), signup: $('#show-signup') };

function showPanel(name) {
  for (const key of Object.keys(panels)) {
    const active = key === name;
    panels[key].hidden = !active;
    switches[key].setAttribute('aria-pressed', String(active));
    switches[key].classList.toggle('secondary', !active);
  }
  panels[name].querySelector('input')?.focus();
}
switches.login.addEventListener('click', () => showPanel('login'));
switches.signup.addEventListener('click', () => showPanel('signup'));

/* ---------- Estado de envio compartilhado ---------- */
// Estados: idle -> loading -> success | error
async function submitWithState({ form, button, status, kind, payload, successMessage }) {
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  const originalLabel = button.textContent;
  button.textContent = 'Enviando';
  status.hidden = false;
  status.className = 'status';
  status.setAttribute('role', 'status');
  status.textContent = 'Enviando seus dados…';

  try {
    await simulateRequest(kind, payload);
    status.classList.add('ok');
    status.textContent = successMessage;
    form.reset();
    return true;
  } catch (error) {
    status.classList.add('error');
    status.setAttribute('role', 'alert'); // erros interrompem a leitura: alert
    status.textContent = error.message;
    return false;
  } finally {
    button.disabled = false;
    button.removeAttribute('aria-busy');
    button.textContent = originalLabel;
  }
}

/* ---------- Login ---------- */
(function setupLogin() {
  const form = $('#login-form');
  const email = $('#login-email');
  const password = $('#login-password');
  const status = $('#login-status');

  bindPasswordToggle($('#login-toggle'), password);
  bindLiveValidation(email, (value) => validateField('email', value));
  bindLiveValidation(password, (value) => validateField('loginPassword', value));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const errors = [
      [email, validateField('email', email.value)],
      [password, validateField('loginPassword', password.value)],
    ];
    errors.forEach(([input, message]) => setFieldError(input, message));
    const firstInvalid = errors.find(([, message]) => message);
    if (firstInvalid) {
      firstInvalid[0].focus();
      return;
    }
    await submitWithState({
      form,
      button: form.querySelector('[type="submit"]'),
      status,
      kind: 'login',
      payload: { email: email.value, password: password.value },
      successMessage: 'Login simulado com sucesso. Nenhuma sessão real foi criada.',
    });
  });
})();

/* ---------- Cadastro em etapas ---------- */
(function setupSignup() {
  const form = $('#signup-form');
  const fieldsets = [...form.querySelectorAll('fieldset')];
  const nextButton = $('#next');
  const backButton = $('#back');
  const submitButton = $('#submit');
  const status = $('#signup-status');
  const indicator = $('#step-indicator');
  const rulesList = $('#password-rules');
  const titles = [...SIGNUP_STEPS.map((step) => step.title), 'Revisão'];
  let current = 0;

  const input = (name) => form.elements[name];
  const values = () => ({
    name: input('name').value,
    email: input('email').value,
    phone: input('phone').value,
    password: input('password').value,
    confirm: input('confirm').value,
    terms: input('terms').checked,
  });

  /* Indicador de etapas */
  function renderIndicator() {
    indicator.replaceChildren(
      ...titles.map((title, index) =>
        h(
          'li',
          {
            class: index < current ? 'done' : '',
            'aria-current': index === current ? 'step' : null,
          },
          `${index + 1}. ${title}`,
        ),
      ),
    );
  }

  /* Pré-visualização dos dados antes de confirmar (textContent: seguro contra XSS) */
  function renderReview() {
    const data = values();
    const rows = [
      ['Nome', data.name.trim()],
      ['E-mail', data.email.trim()],
      ['Telefone', data.phone],
      ['Senha', '•'.repeat(Math.min(data.password.length, 12))],
    ];
    $('#review').replaceChildren(
      ...rows.flatMap(([label, value]) => [h('dt', {}, label), h('dd', {}, value)]),
    );
  }

  function goTo(step, { announceStep = true } = {}) {
    current = step;
    fieldsets.forEach((fieldset, index) => (fieldset.hidden = index !== current));
    backButton.hidden = current === 0;
    nextButton.hidden = current === fieldsets.length - 1;
    submitButton.hidden = current !== fieldsets.length - 1;
    if (current === fieldsets.length - 1) renderReview();
    renderIndicator();
    fieldsets[current].querySelector('input')?.focus();
    if (announceStep) {
      announce(status, `Etapa ${current + 1} de ${titles.length}: ${titles[current]}`);
      status.hidden = false;
      status.className = 'status';
    }
  }

  /* Valida a etapa atual, mostra os erros e foca o primeiro campo inválido */
  function validateCurrentStep() {
    const stepFields = SIGNUP_STEPS[current].fields;
    const errors = validateStep(current, values());
    stepFields.forEach((name) => setFieldError(input(name), errors[name] ?? ''));
    const firstInvalid = stepFields.find((name) => errors[name]);
    if (firstInvalid) {
      input(firstInvalid).focus();
      return false;
    }
    // A Constraint Validation API confirma que nenhum erro personalizado ficou pendente.
    return stepFields.every((name) => input(name).checkValidity());
  }

  nextButton.addEventListener('click', () => {
    if (validateCurrentStep()) goTo(current + 1);
  });
  backButton.addEventListener('click', () => goTo(current - 1));

  /* Validação em tempo real */
  const live = (name) =>
    bindLiveValidation(
      input(name),
      (value) => validateField(name, value, values()),
      () => {
        // Se a senha mudar depois da confirmação, revalida a confirmação.
        if (name === 'password' && input('confirm').value) {
          setFieldError(
            input('confirm'),
            validateField('confirm', input('confirm').value, values()),
          );
        }
      },
    );
  ['name', 'email', 'phone', 'password', 'confirm', 'terms'].forEach(live);

  /* Máscara de telefone preservando a posição do cursor */
  input('phone').addEventListener('input', (event) => {
    const field = event.target;
    const digitsBefore = digitsOnly(field.value.slice(0, field.selectionStart)).length;
    field.value = formatPhone(field.value);
    const caret = caretAfterFormat(field.value, digitsBefore);
    field.setSelectionRange(caret, caret);
  });

  /* Checklist da senha + alternância de visibilidade */
  bindPasswordToggle($('#signup-toggle'), input('password'));
  function renderRules() {
    const { rules } = evaluatePassword(input('password').value);
    rulesList.replaceChildren(
      ...rules.map((rule) =>
        h(
          'li',
          { class: rule.passed ? 'passed' : '' },
          `${rule.passed ? '✓' : '○'} ${rule.label}`,
        ),
      ),
    );
  }
  input('password').addEventListener('input', renderRules);
  renderRules();

  /* Envio final */
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    // Enter em uma etapa intermediária faz o papel de "Continuar", nunca envia.
    if (current < fieldsets.length - 1) {
      nextButton.click();
      return;
    }
    const data = values();
    const staleStep = SIGNUP_STEPS.findIndex(
      (_, index) => Object.keys(validateStep(index, data)).length > 0,
    );
    if (staleStep !== -1) {
      goTo(staleStep);
      return;
    }
    const ok = await submitWithState({
      form,
      button: submitButton,
      status,
      kind: 'signup',
      payload: data,
      successMessage: `Cadastro simulado concluído para ${data.email.trim()}.`,
    });
    if (ok) {
      renderRules();
      goTo(0, { announceStep: false }); // mantém a mensagem de sucesso visível
    }
  });

  renderIndicator();
})();

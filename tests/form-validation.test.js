import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  caretAfterFormat,
  evaluatePassword,
  formatPhone,
  validateConfirm,
  validateEmail,
  validateField,
  validateName,
  validatePassword,
  validatePhone,
  validateRequired,
  validateStep,
} from '../projects/form-validation-lab/src/validators.js';
import { simulateRequest } from '../projects/form-validation-lab/src/submit.js';

describe('campos obrigatórios e nome', () => {
  test('validateRequired rejeita vazio e só espaços', () => {
    assert.match(validateRequired('   ', 'O nome'), /obrigatório/);
    assert.match(validateRequired(undefined), /obrigatório/);
    assert.equal(validateRequired('a'), '');
  });
  test('validateName aceita acentos e rejeita números', () => {
    assert.equal(validateName("Ana-Júlia D'Ávila"), '');
    assert.match(validateName('A'), /2 caracteres/);
    assert.match(validateName('R2D2'), /apenas letras/);
  });
});

describe('e-mail', () => {
  test('aceita formatos comuns', () => {
    for (const email of ['a@b.co', 'nome.sobrenome+tag@empresa.com.br', ' ana@x.org ']) {
      assert.equal(validateEmail(email), '', email);
    }
  });
  test('rejeita formatos inválidos', () => {
    for (const email of [
      '',
      'sem-arroba',
      'a@b',
      'a@@b.com',
      'a b@c.com',
      'a@b.c',
      'a@.com',
    ]) {
      assert.notEqual(validateEmail(email), '', `"${email}" deveria ser inválido`);
    }
  });
});

describe('senha', () => {
  test('evaluatePassword reporta cada regra', () => {
    const { rules, score } = evaluatePassword('abc');
    assert.equal(rules.length, 5);
    assert.equal(score, 1);
    assert.equal(evaluatePassword('Senha@123').score, 5);
  });
  test('validatePassword aponta a primeira regra que falta', () => {
    assert.match(validatePassword(''), /obrigatória/);
    assert.match(validatePassword('abc'), /8 caracteres/);
    assert.match(validatePassword('abcdefgh'), /maiúscula/);
    assert.equal(validatePassword('Senha@123'), '');
  });
  test('espaços não contam como símbolo; acentuadas contam como letras', () => {
    assert.equal(
      evaluatePassword('Ação 1234').rules.find((r) => r.id === 'symbol').passed,
      false,
    );
    assert.equal(
      evaluatePassword('ÁÉ1a').rules.find((r) => r.id === 'upper').passed,
      true,
    );
  });
  test('validateConfirm', () => {
    assert.match(validateConfirm('a', ''), /Confirme/);
    assert.match(validateConfirm('a', 'b'), /não coincidem/);
    assert.equal(validateConfirm('a', 'a'), '');
  });
});

describe('telefone', () => {
  test('formatPhone aplica máscara progressiva', () => {
    assert.equal(formatPhone(''), '');
    assert.equal(formatPhone('1'), '(1');
    assert.equal(formatPhone('119'), '(11) 9');
    assert.equal(formatPhone('1131234567'), '(11) 3123-4567');
    assert.equal(formatPhone('11912345678'), '(11) 91234-5678');
    assert.equal(formatPhone('(11) 91234-5678999'), '(11) 91234-5678');
    assert.equal(formatPhone('abc'), '');
  });
  test('caretAfterFormat mantém o cursor entre os mesmos dígitos', () => {
    assert.equal(caretAfterFormat('(11) 91234-5678', 0), 0);
    assert.equal(caretAfterFormat('(11) 91234-5678', 2), 3);
    assert.equal(caretAfterFormat('(11) 91234-5678', 3), 6);
    assert.equal(caretAfterFormat('(11) 9', 99), 6);
  });
  test('validatePhone', () => {
    assert.match(validatePhone(''), /obrigatório/);
    assert.match(validatePhone('(11) 1234'), /DDD/);
    assert.match(validatePhone('(11) 11111-1111'), /real/);
    assert.match(validatePhone('(11) 81234-5678'), /começam com 9/);
    assert.equal(validatePhone('(11) 91234-5678'), '');
    assert.equal(validatePhone('(11) 3123-4567'), '');
  });
});

describe('etapas', () => {
  test('validateStep retorna somente campos com erro', () => {
    const errors = validateStep(0, { name: '', email: 'a@b.com', phone: '' });
    assert.deepEqual(Object.keys(errors).sort(), ['name', 'phone']);
    assert.deepEqual(
      validateStep(0, { name: 'Ana', email: 'a@b.com', phone: '(11) 91234-5678' }),
      {},
    );
  });
  test('etapa de segurança usa a senha para validar a confirmação', () => {
    const values = { password: 'Senha@123', confirm: 'outra', terms: false };
    assert.deepEqual(Object.keys(validateStep(1, values)).sort(), ['confirm', 'terms']);
    assert.deepEqual(
      validateStep(1, { ...values, confirm: 'Senha@123', terms: true }),
      {},
    );
  });
  test('etapa inexistente e campo desconhecido não quebram', () => {
    assert.deepEqual(validateStep(9, {}), {});
    assert.equal(validateField('inexistente', 'x'), '');
  });
});

describe('envio simulado', () => {
  test('login com senha errada falha e com a correta funciona', async () => {
    await assert.rejects(
      simulateRequest('login', { email: 'a@b.com', password: 'x' }),
      /incorretos/,
    );
    assert.deepEqual(
      await simulateRequest('login', { email: 'a@b.com', password: 'Senha@123' }),
      {
        ok: true,
        email: 'a@b.com',
      },
    );
  });
  test('e-mail erro@ simula falha do servidor', async () => {
    await assert.rejects(
      simulateRequest('signup', { email: 'erro@teste.com' }),
      /recusou/,
    );
  });
  test('cancelamento via AbortSignal rejeita com AbortError', async () => {
    const controller = new AbortController();
    const promise = simulateRequest(
      'signup',
      { email: 'a@b.com' },
      { signal: controller.signal },
    );
    controller.abort();
    await assert.rejects(promise, { name: 'AbortError' });
  });
});

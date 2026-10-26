# Form Validation Lab

Dificuldade: **intermediário**

## 1. Objetivo

Construir formulários de login e de cadastro em etapas com validação em tempo real e no envio, feedback acessível e estados de envio. Os envios são **simulados**: nenhum dado sai do navegador.

## 2. Tecnologias utilizadas

- HTML semântico: `<form novalidate>`, `<fieldset>`/`<legend>`, `<label>`, `autocomplete`, `inputmode`
- **Constraint Validation API**: `setCustomValidity`, `checkValidity`, `validity`
- JavaScript ES2022, expressões regulares Unicode (`\p{L}`, `\p{Lu}`), `Promise`, `AbortSignal`
- `node:test` para os validadores

## 3. Conceitos praticados

- Validadores puros que retornam mensagem de erro ou `''`
- Validação "preguiçosa": só após o primeiro `blur`, depois a cada `input`
- Regras de senha com checklist visual e confirmação dependente da senha
- Máscara de telefone com preservação da posição do cursor
- `aria-invalid`, `aria-describedby`, `aria-pressed`, `aria-busy`, `role="alert"`/`status`
- Máquina de estados do envio: ocioso, enviando, sucesso, erro
- Formulário em etapas com validação por etapa e revisão antes de confirmar

## 4. Desafios técnicos

- **Máscara com cursor**: reformatar `value` move o cursor para o fim; `caretAfterFormat` calcula a nova posição contando os dígitos à esquerda.
- **Constraint Validation vs. regras próprias**: o JavaScript é a fonte da verdade e `setCustomValidity` mantém `checkValidity()` coerente.
- **Enter em etapa intermediária**: o envio implícito do formulário não pode pular etapas; o handler de `submit` trata isso como "Continuar".
- **Dependência entre campos**: ao mudar a senha, a confirmação precisa ser revalidada.
- **Acessibilidade de erros**: erro de envio usa `role="alert"`; progresso usa `role="status"`.

## 5. Funcionalidades

- Login: e-mail e senha obrigatórios, alternância de visibilidade da senha, simulação de envio (senha correta: `Senha@123`).
- Cadastro em 3 etapas: dados pessoais, segurança e revisão com confirmação.
- Validação de nome, e-mail, telefone brasileiro (10 ou 11 dígitos), senha (5 regras), confirmação e aceite de termos.
- Máscara `(11) 91234-5678` durante a digitação.
- Estados de envio com botão desabilitado; use `erro@teste.com` para simular falha e `lento@teste.com` para uma resposta lenta de 3 s.
- Foco movido para o primeiro campo inválido.

## 6. Estrutura do código

| Arquivo             | Responsabilidade                                                |
| ------------------- | --------------------------------------------------------------- |
| `src/validators.js` | Regras puras, máscara, etapas (testadas em Node)                |
| `src/field.js`      | Ponte com o DOM: erros, validação ao vivo, alternância de senha |
| `src/submit.js`     | Envio simulado com atraso, falhas e cancelamento                |
| `src/main.js`       | Orquestra login, etapas, revisão e estados                      |

Testes: `tests/form-validation.test.js`.

## 7. Execução

```bash
npm start
# abra http://localhost:3000/projects/form-validation-lab/
```

**Teste manual no navegador** (a interface não é coberta por testes automatizados):

1. Em _Entrar_, envie vazio: os dois campos mostram erro e o foco vai ao e-mail.
2. Digite uma senha errada: mensagem de erro; digite `Senha@123`: sucesso.
3. Em _Criar conta_, digite `11912345678` no telefone: vira `(11) 91234-5678`.
4. Pressione Enter na etapa 1 com campos vazios: não avança e mostra erros.
5. Use `erro@teste.com` e confirme: mensagem de falha do servidor simulado.
6. Navegue só pelo teclado: o foco deve ficar sempre visível.

## 8. Checklist de aprendizado

- [ ] Sei usar `setCustomValidity` e `checkValidity`.
- [ ] Sei ligar `aria-describedby` a uma mensagem de erro.
- [ ] Sei validar após `blur` e revalidar a cada `input`.
- [ ] Sei aplicar uma máscara sem quebrar o cursor.
- [ ] Sei impedir envio duplicado desabilitando o botão durante a requisição.

## 9. Desafios extras

- Indicador de força da senha com `<meter>`.
- Validação de CPF com dígitos verificadores.
- Salvar rascunho do cadastro (sem a senha) e restaurá-lo.

## 10. Reconstrução de memória

Implemente: `validateEmail`, `evaluatePassword`, `formatPhone`, a ligação de validação ao vivo (`blur` e `input`) e o botão de mostrar senha com `aria-pressed`.

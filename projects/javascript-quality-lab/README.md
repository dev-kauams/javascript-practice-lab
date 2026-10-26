# JavaScript Quality Lab

Dificuldade: **intermediário**

## 1. Objetivo

Praticar o que torna o código confiável: testes, casos extremos, tratamento de erros, refatoração segura, comparação de implementações e depuração de erros comuns. A parte central são os **testes executáveis** em `tests/javascript-quality.test.js`.

## 2. Tecnologias utilizadas

- `node:test` e `node:assert/strict`
- ESLint (configuração em `eslint.config.js`) e Prettier (`.prettierrc.json`)
- JavaScript ES2022; DOM só na página de demonstração

## 3. Conceitos praticados

- Testes de funções puras, de validação e de transformação de dados
- Entradas inválidas e valores de fronteira (`null`, `''`, `NaN`, `-1`, lista vazia)
- Erros de domínio com `Error`, `cause` e padrão **Result** (`{ ok, value | error }`)
- Refatoração com testes de caracterização (mesma saída antes e depois)
- Comparação de implementações: primeiro **correção**, depois desempenho
- Relógio injetável para testar medição sem depender do tempo real

## 4. Desafios técnicos

- **Testar o bug**: para cada erro comum, o teste prova que a versão ruim falha _e_ que a corrigida acerta (`sort()` sem comparador, `==`, ponto flutuante, `var` em closures, `NaN`, `||` versus `??`, mutação de argumento).
- **Refatorar sem medo**: três funções copiadas viram uma só; os testes comparam as duas versões em várias entradas.
- **Não engolir erros**: `parseConfig` converte apenas `ValidationError`; erros inesperados são relançados.
- **Benchmark honesto**: a página avisa que micro-benchmarks variam; o teste garante que todas as implementações concordam.

## 5. Funcionalidades

- Sete demonstrações de bugs, com resultado da versão com bug ao lado da corrigida
- Refatoração antes/depois com o código exibido
- Comparador de implementações (remover duplicados, somar) com verificação de concordância e tempo médio
- Validador de JSON de configuração e de cadastro, com mensagens por campo

## 6. Estrutura do código

| Arquivo             | Responsabilidade                                                  |
| ------------------- | ----------------------------------------------------------------- |
| `src/bugs.js`       | Pares com bug/corrigido e o catálogo de demonstrações             |
| `src/refactor.js`   | Versão duplicada (`legacy`) e versão refatorada                   |
| `src/errors.js`     | `ValidationError`, `safeJsonParse`, `withFallback`, `parseConfig` |
| `src/validation.js` | `parseAge`, `normalizeEmail`, `normalizeUser`                     |
| `src/compare.js`    | Implementações alternativas e `compareImplementations`            |
| `src/main.js`       | Página de demonstração                                            |

Testes: `tests/javascript-quality.test.js`. Observação: `src/bugs.js` desliga as regras `eqeqeq`, `no-var` e `prefer-const` em `eslint.config.js` porque demonstra exatamente os problemas que elas previnem.

## 7. Execução

```bash
npm test               # roda todos os testes do laboratório
npm run lint           # ESLint
npm run format:check   # Prettier (somente verifica)
npm start              # página em http://localhost:3000/projects/javascript-quality-lab/
```

**Exercício de lint:** crie um arquivo temporário `tmp.js` na raiz com `var x = 1; if (x == "1") { console.log(y) }` e rode `npx eslint tmp.js`. Você deve ver `no-var`, `eqeqeq` e `no-undef`. Apague o arquivo depois.

## 8. Checklist de aprendizado

- [ ] Sei escrever um teste que falha antes da correção.
- [ ] Sei listar casos extremos de uma função (vazio, nulo, limites, tipos errados).
- [ ] Sei escolher entre lançar exceção e retornar um Result.
- [ ] Sei refatorar usando testes de caracterização.
- [ ] Sei ler a mensagem de uma regra do ESLint e corrigir o código.

## 9. Desafios extras

- Adicionar mais três bugs ao catálogo (com teste que prova o bug e a correção).
- Escrever testes de propriedade simples (por exemplo, `sort` é idempotente) com entradas geradas.
- Medir a cobertura com `node --test --experimental-test-coverage`.

## 10. Reconstrução de memória

Implemente: `safeJsonParse`, `parseAge`, `normalizeUser`, uma função parametrizada que substitua código duplicado e os testes de fronteira de cada uma.

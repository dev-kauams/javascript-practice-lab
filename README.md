# JavaScript Practice Lab

Laboratório de prática e consulta rápida para as habilidades de JavaScript do dia a dia. Em vez de dezenas de exercícios soltos, são **8 projetos coesos**, cada um agrupando desafios relacionados, com código real, testes para a lógica e um README que ensina **o que você pratica** ao estudá-lo.

- JavaScript puro (ES2022+), HTML5 semântico, CSS3 e APIs nativas do navegador
- Sem React, Vue, Angular ou TypeScript: o foco é a plataforma Web
- Node.js só para testes (`node:test`), ESLint e Prettier
- Documentação em português do Brasil
- Visual preto AMOLED com roxo ultravioleta, responsivo e com foco visível, rótulos e regiões `aria-live`

## Índice

- [Projetos](#projetos)
- [Como executar](#como-executar)
- [Qualidade e testes](#qualidade-e-testes)
- [Checklist geral de competências](#checklist-geral-de-competências)
- [Como adicionar novos desafios](#como-adicionar-novos-desafios)
- [Publicação no GitHub Pages](#publicação-no-github-pages)
- [Estrutura do repositório](#estrutura-do-repositório)

## Projetos

| Projeto                                                             | Tecnologias e conceitos                                                                             | Desafios principais                                                                | Dificuldade               |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------- |
| [JS Fundamentals Lab](projects/js-fundamentals-lab/README.md)       | Strings e regex, `map`/`filter`/`reduce`, desestruturação, spread/rest, `?.`/`??`, closures, `Intl` | Funções puras, casos extremos, conversão segura de tipos, datas e moedas           | Iniciante a intermediário |
| [Form Validation Lab](projects/form-validation-lab/README.md)       | DOM, eventos, Constraint Validation API, regex Unicode, ARIA, `Promise`                             | Validação ao vivo e no envio, máscara com cursor, etapas, estados de envio         | Intermediário             |
| [DOM Interaction Lab](projects/dom-interaction-lab/README.md)       | `createElement`, delegação de eventos, `<dialog>`, `KeyboardEvent`, ARIA                            | Gerenciamento de foco, tabs e modais acessíveis, atalhos de teclado                | Intermediário             |
| [Task Manager](projects/task-manager/README.md)                     | CRUD imutável, arrays e objetos, `localStorage`, `Intl.DateTimeFormat`                              | Estado, filtros e persistência com dados corrompidos                               | Iniciante a intermediário |
| [API Explorer](projects/api-explorer/README.md)                     | `fetch`, Promises, `async/await`, `AbortController`, `URLSearchParams`                              | Requisições assíncronas, cancelamento, debounce e tratamento de falhas             | Intermediário             |
| [Shopping Cart](projects/shopping-cart/README.md)                   | Dinheiro em centavos, `Intl.NumberFormat`, `localStorage`, estado derivado                          | Totais exatos, quantidades inválidas, carrinho salvo desatualizado                 | Intermediário             |
| [Browser Utilities Lab](projects/browser-utilities-lab/README.md)   | Clipboard API, `File`, `URL.createObjectURL`, `matchMedia`, `localStorage`                          | Permissões negadas, APIs indisponíveis, validação de arquivos                      | Intermediário             |
| [JavaScript Quality Lab](projects/javascript-quality-lab/README.md) | `node:test`, erros customizados, Result, ESLint, Prettier                                           | Testes de fronteira, refatoração segura, bugs comuns, comparação de implementações | Intermediário             |

### O que cada projeto entrega

| Projeto                | Demonstração                                                           | Testes automatizados                                |
| ---------------------- | ---------------------------------------------------------------------- | --------------------------------------------------- |
| JS Fundamentals Lab    | [`projects/js-fundamentals-lab/`](projects/js-fundamentals-lab/)       | `tests/js-fundamentals.test.js`                     |
| Form Validation Lab    | [`projects/form-validation-lab/`](projects/form-validation-lab/)       | `tests/form-validation.test.js`                     |
| DOM Interaction Lab    | [`projects/dom-interaction-lab/`](projects/dom-interaction-lab/)       | `tests/dom-interaction.test.js` (lógica pura)       |
| Task Manager           | [`projects/task-manager/`](projects/task-manager/)                     | `tests/task-manager.test.js`                        |
| API Explorer           | [`projects/api-explorer/`](projects/api-explorer/)                     | `tests/api-explorer.test.js` (com `fetch` simulado) |
| Shopping Cart          | [`projects/shopping-cart/`](projects/shopping-cart/)                   | `tests/shopping-cart.test.js`                       |
| Browser Utilities Lab  | [`projects/browser-utilities-lab/`](projects/browser-utilities-lab/)   | `tests/browser-utilities.test.js`                   |
| JavaScript Quality Lab | [`projects/javascript-quality-lab/`](projects/javascript-quality-lab/) | `tests/javascript-quality.test.js`                  |

Os testes cobrem a **lógica** que roda em Node.js. As interfaces dependem do navegador e são verificadas manualmente: cada README tem a seção _Execução_ com os passos de teste manual.

## Como executar

Requisitos: Node.js 20 ou superior.

```bash
git clone https://github.com/SEU-USUARIO/javascript-practice-lab.git
cd javascript-practice-lab
npm install
npm start
```

Abra `http://localhost:3000/`. O comando `npm start` roda um servidor estático sem dependências (`scripts/serve.js`); a porta pode ser trocada com `PORT=4000 npm start`.

> Por que um servidor? Os projetos usam módulos ES (`<script type="module">`), que os navegadores bloqueiam ao abrir o arquivo diretamente por `file://`.

## Qualidade e testes

```bash
npm test               # testes com node:test
npm run lint           # ESLint
npm run format:check   # Prettier (verifica)
npm run format         # Prettier (corrige)
```

A integração contínua (`.github/workflows/ci.yml`) executa lint, formatação e testes em Node 20 e 22.

## Checklist geral de competências

**Linguagem**

- [ ] Manipular strings e usar expressões regulares
- [ ] Transformar dados com `map`, `filter`, `reduce`, `find`, `some`, `every`
- [ ] Usar desestruturação, spread/rest, `?.` e `??`
- [ ] Explicar escopo e closures
- [ ] Converter e validar tipos sem `NaN` silencioso
- [ ] Formatar datas, moedas e números com `Intl`

**DOM e acessibilidade**

- [ ] Criar elementos de forma segura (sem `innerHTML` com dados externos)
- [ ] Usar delegação de eventos
- [ ] Gerenciar foco, rótulos e regiões `aria-live`
- [ ] Construir tabs, accordion e modal acessíveis

**Formulários e dados**

- [ ] Validar em tempo real e no envio
- [ ] Persistir com `localStorage` tolerando dados inválidos
- [ ] Manter estado e interface sincronizados

**Rede e plataforma**

- [ ] Usar `fetch` com `async/await`, `AbortController` e debounce
- [ ] Tratar falha de rede, erro HTTP e resposta inesperada
- [ ] Sincronizar estado com `URLSearchParams`
- [ ] Lidar com permissões negadas e APIs indisponíveis

**Qualidade**

- [ ] Escrever testes com `node:test`, incluindo casos extremos
- [ ] Refatorar com testes de caracterização
- [ ] Tratar exceções sem engolir erros inesperados
- [ ] Usar ESLint e Prettier

## Como adicionar novos desafios

1. **Procure antes de criar.** Veja a tabela de projetos e a seção _Conceitos praticados_ de cada README. Se o conceito já aparece em algum projeto, estenda esse projeto.
2. **Escolha o projeto pelo tipo de habilidade**, não pelo tema: lógica da linguagem em `js-fundamentals-lab`, formulários em `form-validation-lab`, DOM e acessibilidade em `dom-interaction-lab`, e assim por diante.
3. **Separe lógica e interface.** Funções puras em `src/*.js` (testáveis em Node) e DOM em `src/main.js` ou `src/components/`.
4. **Escreva o teste junto com o código** em `tests/`, incluindo entrada inválida e casos extremos.
5. **Atualize o README do projeto** (conceitos, desafios, funcionalidades, checklist, reconstrução de memória) e a tabela deste README. Documente só o que existe no código.
6. **Rode** `npm test`, `npm run lint` e `npm run format:check`.

Só crie um projeto novo se o desafio não couber em nenhum dos oito. Veja também [CONTRIBUTING.md](CONTRIBUTING.md).

## Estrutura do repositório

```text
javascript-practice-lab/
├── README.md
├── CONTRIBUTING.md
├── index.html                 # índice navegável (GitHub Pages)
├── package.json
├── eslint.config.js
├── .prettierrc.json
├── .editorconfig
├── scripts/serve.js           # servidor estático local
├── projects/
│   ├── _shared/               # theme.css e dom.js, compartilhados
│   ├── js-fundamentals-lab/
│   ├── form-validation-lab/
│   ├── dom-interaction-lab/
│   ├── task-manager/
│   ├── api-explorer/
│   ├── shopping-cart/
│   ├── browser-utilities-lab/
│   └── javascript-quality-lab/
├── tests/
└── .github/workflows/
```

Cada projeto tem `index.html`, `styles.css`, `src/` e `README.md`. A pasta `projects/_shared/` guarda apenas o tema visual e um helper mínimo de DOM, para evitar duplicação sem criar dependências entre os projetos.

## Licença

MIT.

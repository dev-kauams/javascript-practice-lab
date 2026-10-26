# JS Fundamentals Lab

Dificuldade: **iniciante a intermediário**

## 1. Objetivo

Praticar a linguagem JavaScript em funções puras pequenas, cada uma com um exemplo executável na página. Você edita a entrada, executa e lê o código da função, sem precisar abrir uma aplicação diferente para cada conceito.

## 2. Tecnologias utilizadas

- JavaScript ES2022 (módulos ES, `??=`, `replaceAll`)
- `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`, `Intl.ListFormat`
- DOM (`createElement`, `textContent`) via o helper compartilhado `../_shared/dom.js`
- `node:test` para os testes da lógica

## 3. Conceitos praticados

| Área    | Conceitos                                                                               |
| ------- | --------------------------------------------------------------------------------------- |
| Strings | `normalize("NFD")`, `replace` com regex, `match` com flag `g`, `Set`                    |
| Arrays  | `map`, `filter`, `reduce`, `find`, `some`, `every`, `sort` com `localeCompare`, `slice` |
| Objetos | desestruturação com padrões, spread, rest, `?.`, `??`, `Object.fromEntries`             |
| Funções | closures, funções de ordem superior, memoização, composição (`pipe`), callbacks         |
| Tipos   | `typeof` e suas armadilhas, `Number.isFinite`, conversão estrita                        |
| Intl    | moeda, porcentagem, notação compacta, datas, tempo relativo, listas                     |

## 4. Desafios técnicos

- **`slugify`**: entender que `normalize("NFD")` separa letra e acento para que a regex remova só o acento.
- **`totalByCategory` e `groupBy`**: o acumulador do `reduce` é um objeto; é preciso inicializar a chave antes de somar (`??`, `??=`).
- **`average`, `chunk`, `toNumberStrict`**: casos extremos (lista vazia, tamanho 0, `"1e3"`, `NaN`) devem ter comportamento definido, não `NaN` silencioso.
- **`deepMerge`**: spread é raso; mesclar objetos aninhados exige recursão sem mutar as entradas.
- **`formatDate`**: datas só com dia (`2026-10-24`) são interpretadas em UTC; formatar com o fuso errado desloca o dia.

## 5. Funcionalidades

- Seis grupos de desafios: strings, arrays, objetos, funções, tipos e Intl (31 desafios registrados em `challenges.js`).
- Cada desafio tem entrada editável, botão **Executar**, resultado e botão **Ver código** (mostra o código-fonte da função).
- Entradas inválidas (por exemplo, JSON quebrado) mostram uma mensagem de erro em vez de travar.
- Anúncio de "executado" em região `aria-live` para leitores de tela.

## 6. Estrutura do código

| Arquivo                                                                            | Responsabilidade                                                |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `src/strings.js`, `arrays.js`, `objects.js`, `functions.js`, `types.js`, `intl.js` | Funções puras, uma área por arquivo                             |
| `src/challenges.js`                                                                | Registro: liga cada função a um exemplo e à forma de executá-la |
| `src/main.js`                                                                      | Lê o registro e monta os cartões no DOM                         |
| `index.html`, `styles.css`                                                         | Página e estilos específicos                                    |

Testes: `tests/js-fundamentals.test.js`.

## 7. Execução

Na raiz do repositório:

```bash
npm start
# abra http://localhost:3000/projects/js-fundamentals-lab/
```

Os testes da lógica: `npm test`.

## 8. Checklist de aprendizado

- [ ] Sei explicar por que `reduce` precisa de valor inicial.
- [ ] Sei trocar `||` por `??` e dizer quando o resultado muda.
- [ ] Sei escrever uma closure que mantém estado privado.
- [ ] Sei remover acentos com `normalize` e regex.
- [ ] Sei formatar moeda, data e porcentagem sem concatenar strings.
- [ ] Sei tratar lista vazia e entrada inválida sem retornar `NaN`.

## 9. Desafios extras

- Adicionar `debounce` e `throttle` em `functions.js` com testes usando timers simulados.
- Criar `deepEqual` para objetos e arrays.
- Adicionar um desafio de `Intl.PluralRules` ("1 item" / "2 itens").

## 10. Reconstrução de memória

Sem olhar a solução, implemente: `slugify`, `groupBy` com `reduce`, `createCounter`, `once`, `deepMerge` e `toNumberStrict`.

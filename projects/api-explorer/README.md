# API Explorer

Dificuldade: **intermediário**

## 1. Objetivo

Consumir uma API pública de verdade e tratar tudo o que pode dar errado: lentidão, falha de rede, erro HTTP, resposta que não é JSON, formato inesperado e buscas que se atropelam.

API usada: [Open Library Search API](https://openlibrary.org/dev/docs/api/search) (`https://openlibrary.org/search.json`), pública e sem chave.

## 2. Tecnologias utilizadas

- `fetch`, `Promise`, `async/await`
- `AbortController`, `AbortSignal.timeout`, `AbortSignal.any`
- `URLSearchParams`, `history.replaceState`
- `node:test` com `fetch` simulado (os testes não usam a rede)

## 3. Conceitos praticados

- Estados da tela: ocioso, carregando, sucesso, vazio e erro
- Debounce (450 ms) na digitação
- Cancelamento da requisição anterior quando uma nova começa
- Erros com nome próprio: `NetworkError`, `HttpError`, `InvalidResponseError`
- Validação do formato da resposta antes de usá-la
- Estado da pesquisa na URL (`?q=dune&page=2&sort=new&covers=1`), com links compartilháveis
- Paginação, filtro local (somente com capa) e ordenação (servidor e local)

## 4. Desafios técnicos

- **Corrida de requisições**: se a resposta de uma busca antiga chegasse depois da nova, a tela mostraria dados errados. Cada busca cancela a anterior e `AbortError` é ignorado, não tratado como falha.
- **Timeout + cancelamento manual**: `AbortSignal.any([cancelar, timeout])` combina os dois motivos de aborto; `TimeoutError` vira mensagem amigável.
- **Não confiar na resposta**: `response.ok` pode ser falso, `.json()` pode lançar e o objeto pode não ter `docs`. Itens sem `key` ou `title` são descartados.
- **Sincronizar URL e tela**: a URL é lida ao iniciar e atualizada a cada mudança, sem criar histórico a cada tecla (`replaceState`).
- **Ordenação mista**: "Mais recentes/antigos" é do servidor; "Título" só reordena a página atual.

## 5. Funcionalidades

- Busca de livros por título, autor ou assunto, com capa, autores e ano da primeira publicação
- Estados de carregamento, sucesso, ausência de resultados e erro, com botão **Tentar novamente**
- Paginação (12 por página, até 100 páginas) e filtro "Somente com capa"
- Pesquisa restaurada a partir da URL

## 6. Estrutura do código

| Arquivo            | Responsabilidade                                        |
| ------------------ | ------------------------------------------------------- |
| `src/api.js`       | URL, requisição, classes de erro, validação da resposta |
| `src/debounce.js`  | `debounce` com `cancel`                                 |
| `src/transform.js` | Filtro local, ordenação local e total de páginas        |
| `src/url-state.js` | Ler e gravar o estado em `URLSearchParams`              |
| `src/main.js`      | Máquina de estados e eventos                            |

Testes: `tests/api-explorer.test.js`.

## 7. Execução

```bash
npm start
# abra http://localhost:3000/projects/api-explorer/
```

É preciso internet para a busca real. **Testes manuais sugeridos:**

1. Digite rápido: apenas uma requisição deve sair (aba _Rede_ das ferramentas do navegador).
2. Ative _Offline_ na aba _Rede_ e busque: deve aparecer o erro com **Tentar novamente**.
3. Com a rede em _Slow 3G_, troque a busca durante o carregamento: a anterior fica `canceled`.
4. Copie a URL com `?q=dune&page=2` em outra aba: a pesquisa é restaurada.

## 8. Checklist de aprendizado

- [ ] Sei explicar o que `AbortController` cancela e por que `AbortError` não é falha.
- [ ] Sei diferenciar falha de rede, status HTTP de erro e JSON inválido.
- [ ] Sei implementar debounce.
- [ ] Sei ler e escrever o estado em `URLSearchParams`.
- [ ] Sei modelar os estados da tela sem combinações impossíveis.

## 9. Desafios extras

- Nova tentativa automática com espera exponencial para erros 5xx.
- Cache em memória por consulta e página.
- Página de detalhes de um livro usando a chave `/works/...`.

## 10. Reconstrução de memória

Implemente: `searchBooks` com os três tipos de erro, `debounce`, o ciclo "cancelar anterior e iniciar nova" com `AbortController`, e `readState`/`toSearch`.

# Task Manager

Dificuldade: **iniciante a intermediário**

## 1. Objetivo

Gerenciar tarefas com anotações e prazo, mantendo o estado correto, a interface sincronizada e os dados salvos no navegador.

## 2. Tecnologias utilizadas

- JavaScript ES2022 (módulos), `localStorage`, `JSON`
- `Intl.DateTimeFormat` (datas em pt-BR)
- DOM com `textContent` e delegação de eventos
- `node:test` com `localStorage` falso injetado

## 3. Conceitos praticados

- CRUD com funções imutáveis (`map`, `filter`, spread)
- Separação entre dados (`store.js`), persistência (`storage.js`) e apresentação (`main.js`)
- Estado derivado: busca, filtro e ordenação são calculados na renderização, nunca guardados
- Validação de entrada e de dados lidos do armazenamento
- Datas "só dia" sem erros de fuso horário

## 4. Desafios técnicos

- **UI como função do estado**: um único `render()` reconstrói a lista a partir de `state`.
- **Dados salvos não são confiáveis**: JSON quebrado, tipos errados, datas impossíveis (`2026-02-30`) e ids duplicados são descartados e a pessoa é avisada.
- **Ordenação estável**: ordenar por prazo coloca tarefas sem prazo por último nas duas direções e `sort` não pode mutar o original.
- **Datas**: `new Date("2026-10-24")` é UTC e pode mostrar o dia anterior; o projeto monta a data local manualmente.
- **Armazenamento indisponível ou cheio**: o app continua funcionando e avisa.

## 5. Funcionalidades

- Criar, editar, concluir e remover tarefas (título até 80 caracteres, anotações até 500, prazo opcional)
- Remoção com **Desfazer**
- Busca por título e anotações (sem diferenciar acentos nem maiúsculas)
- Filtro: todas, abertas, concluídas
- Ordenação por criação, prazo, nome ou estado, crescente ou decrescente
- Resumo (total, abertas, concluídas, atrasadas) e destaque de tarefas atrasadas
- Persistência em `localStorage` com recuperação de dados inválidos
- Limpar concluídas

## 6. Estrutura do código

| Arquivo          | Responsabilidade                                                          |
| ---------------- | ------------------------------------------------------------------------- |
| `src/store.js`   | Regras puras: validar, criar, atualizar, filtrar, ordenar, resumir, datas |
| `src/storage.js` | `loadTasks`/`saveTasks` com sanitização e relatório de problemas          |
| `src/main.js`    | Estado, renderização e eventos                                            |

Testes: `tests/task-manager.test.js`.

## 7. Execução

```bash
npm start
# abra http://localhost:3000/projects/task-manager/
```

**Teste manual da recuperação de dados:** no console do navegador, execute `localStorage.setItem('practice-lab:task-manager:v1', '{quebrado')` e recarregue a página. Deve aparecer o aviso de dados corrompidos e a lista vazia.

## 8. Checklist de aprendizado

- [ ] Sei atualizar um array sem mutá-lo.
- [ ] Sei explicar por que filtros e ordenação não ficam no estado.
- [ ] Sei validar dados lidos de `localStorage`.
- [ ] Sei evitar o deslocamento de dia ao tratar datas.
- [ ] Sei devolver o foco após re-renderizar a lista.

## 9. Desafios extras

- Etiquetas (tags) com filtro múltiplo.
- Exportar e importar tarefas em JSON, com validação.
- Sincronizar abas com o evento `storage`.

## 10. Reconstrução de memória

Implemente: `createTask` com validação, `filterTasks`, `sortTasks`, `loadTasks` tolerante a dados corrompidos e o `render()` a partir do estado.

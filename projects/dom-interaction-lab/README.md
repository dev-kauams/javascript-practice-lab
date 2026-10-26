# DOM Interaction Lab

Dificuldade: **intermediário**

## 1. Objetivo

Reunir os componentes de interface mais comuns, construídos só com DOM e JavaScript, cada um em uma demonstração isolada da mesma página.

## 2. Tecnologias utilizadas

- DOM: `createElement`, `replaceChildren`, `closest`, `dataset`, `textContent`
- Elemento `<dialog>` com `showModal()`
- Atributos ARIA: `role="tab"`, `aria-selected`, `aria-expanded`, `aria-controls`, `aria-live`
- `KeyboardEvent` (`key`, `code`, modificadores)
- `node:test` para a lógica pura (`src/logic.js`)

## 3. Conceitos praticados

- Delegação de eventos (um listener na lista trata editar, salvar, cancelar e remover)
- Criação segura de nós (sem `innerHTML` com dados do usuário)
- Roving tabindex e navegação por setas em tabs
- Gerenciamento de foco: devolver o foco após remover, fechar modal ou cancelar edição
- Atalhos globais que respeitam campos de texto
- Contador de caracteres que anuncia apenas ao cruzar limiares

## 4. Desafios técnicos

- **Foco depois de re-renderizar**: ao remover um item, o botão focado deixa de existir; o foco vai para um vizinho.
- **Teclas e layouts**: com `Alt` no macOS, `event.key` muda; `matchesShortcut` também compara `event.code`.
- **Anúncios sem poluição**: anunciar a cada tecla torna o leitor de tela inutilizável; `shouldAnnounceRemaining` só dispara em 20, 10 e 0.
- **Modal**: `<dialog>` já prende foco e trata `Esc`; ainda é preciso devolver o foco ao botão de origem e fechar ao clicar no fundo.

## 5. Funcionalidades

- Contador com limites 0 a 10 (botões desabilitam nos extremos)
- Lista com criar, editar (inline) e remover, evitando itens vazios, longos demais e duplicados, com estado vazio
- Tabs com setas, Home e End
- Accordion (um painel aberto por vez)
- Modal de confirmação e modal de ajuda de atalhos
- Contador de caracteres (limite 140, emojis contam como 1)
- Atalhos: `Alt+N` (campo da lista), `Alt+M` (modal), `?` (ajuda, fora de campos de texto)

## 6. Estrutura do código

| Arquivo               | Responsabilidade                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------- |
| `src/logic.js`        | Funções puras testáveis: limites, navegação de tabs, atalhos, operações da lista                              |
| `src/components/*.js` | Um componente por arquivo: `counter`, `items-list`, `tabs`, `accordion`, `modal`, `char-counter`, `shortcuts` |
| `src/main.js`         | Liga os componentes à página                                                                                  |

Testes: `tests/dom-interaction.test.js`.

## 7. Execução

```bash
npm start
# abra http://localhost:3000/projects/dom-interaction-lab/
```

**Teste manual:** use só o teclado (Tab, setas, Enter, Esc). Verifique que o foco nunca desaparece e que `Esc` fecha o modal devolvendo o foco ao botão.

## 8. Checklist de aprendizado

- [ ] Sei explicar por que delegação de eventos funciona com itens criados depois.
- [ ] Sei montar um nó sem `innerHTML`.
- [ ] Sei implementar tabs acessíveis com roving tabindex.
- [ ] Sei devolver o foco ao elemento certo depois de uma ação.
- [ ] Sei usar `aria-live` sem sobrecarregar o leitor de tela.

## 9. Desafios extras

- Arrastar para reordenar itens, com alternativa por teclado.
- Tooltip acessível (`aria-describedby`, `Esc` para fechar).
- Desfazer a remoção de um item.

## 10. Reconstrução de memória

Implemente: lista com delegação de eventos, tabs com setas, accordion com `aria-expanded` e um modal com `<dialog>` que devolve o foco.

# Shopping Cart

Dificuldade: **intermediário**

> **Carrinho demonstrativo.** Os produtos são fictícios e **nenhum pagamento real é realizado**.

## 1. Objetivo

Praticar catálogo, busca, filtros, carrinho e totais, tratando dinheiro corretamente.

## 2. Tecnologias utilizadas

- JavaScript ES2022 (módulos)
- `Intl.NumberFormat` (`style: 'currency'`, BRL)
- `localStorage` com validação
- `node:test`

## 3. Conceitos praticados

- **Dinheiro em centavos inteiros** (`1990` em vez de `19.9`)
- Estado mínimo: o carrinho guarda só `{ productId, quantity }`; nomes, preços, subtotais e total são derivados do catálogo
- Funções imutáveis para adicionar, alterar e remover
- Validação de quantidade (inteiro de 1 a 99)
- Sanitização do carrinho salvo
- Busca sem acento, filtro por categoria e ordenação por nome ou preço

## 4. Desafios técnicos

- **Ponto flutuante**: `0.1 + 0.2 === 0.30000000000000004`. Somar centavos inteiros é exato; a conversão para reais só acontece ao exibir.
- **Ler preços digitados**: `parsePriceToCents` aceita `"19,90"`, `"19.90"` e `"R$ 1.234,56"`, e rejeita `"1,234"` e mais de 2 casas. Números JS não passam pela heurística de milhar (`1.005` não vira R$ 1.005,00).
- **Carrinho salvo desatualizado**: produtos que saíram do catálogo são ignorados; quantidades absurdas e ids duplicados são descartados.
- **Entrada inválida**: quantidade `0`, `-1`, `1.5` ou vazia não altera o carrinho e restaura o valor anterior.

## 5. Funcionalidades

- Catálogo de 12 produtos com busca, categoria e ordenação (nome, menor e maior preço)
- Adicionar ao carrinho, alterar quantidade, remover e esvaziar
- Subtotal por linha, total e contagem de itens
- Persistência em `localStorage`, com aviso para dados corrompidos ou armazenamento indisponível
- Botão "Finalizar (demonstração)" que apenas informa que nada é cobrado

## 6. Estrutura do código

| Arquivo          | Responsabilidade                          |
| ---------------- | ----------------------------------------- |
| `src/money.js`   | Centavos: conversão, formatação, soma     |
| `src/catalog.js` | Dados e funções de filtro e ordenação     |
| `src/cart.js`    | Operações do carrinho e valores derivados |
| `src/storage.js` | Carregar e salvar com validação           |
| `src/main.js`    | Renderização e eventos                    |

Testes: `tests/shopping-cart.test.js`.

## 7. Execução

```bash
npm start
# abra http://localhost:3000/projects/shopping-cart/
```

**Teste manual:** adicione 3 unidades de "Cabo USB-C trançado" (R$ 39,90): o subtotal deve ser R$ 119,70. Digite `0` ou `abc` na quantidade: aparece o aviso e o valor anterior volta. Recarregue a página: o carrinho permanece.

## 8. Checklist de aprendizado

- [ ] Sei explicar por que usar centavos inteiros.
- [ ] Sei formatar moeda com `Intl.NumberFormat`.
- [ ] Sei derivar totais em vez de guardá-los.
- [ ] Sei validar dados de `localStorage` antes de usá-los.
- [ ] Sei tratar quantidade inválida sem quebrar a tela.

## 9. Desafios extras

- Cupom de desconto percentual (arredondamento em centavos, testado).
- Frete por faixa de valor.
- Sincronizar o carrinho entre abas com o evento `storage`.

## 10. Reconstrução de memória

Implemente: `parsePriceToCents`, `formatCents`, `addToCart`, `setQuantity`, `cartLines` e `cartTotals` e a sanitização do carrinho salvo.

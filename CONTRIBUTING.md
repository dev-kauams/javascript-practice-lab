# Como contribuir

Obrigado por ajudar a melhorar o laboratório! Algumas regras mantêm o repositório coeso.

## Princípios

- **Poucos projetos, bem completos.** Prefira estender um dos 8 projetos a criar um novo.
- **JavaScript puro.** Sem frameworks, TypeScript ou bibliotecas de interface.
- **Código real.** Sem pseudocódigo, funções vazias, botões decorativos ou `TODO` no lugar de funcionalidades.
- **Documentação em pt-BR** e somente sobre o que está implementado.

## Fluxo

1. Faça um fork e crie uma branch: `git checkout -b feat/nome-curto`.
2. Instale as dependências: `npm install`.
3. Implemente a mudança e adicione testes em `tests/` para a lógica.
4. Atualize o README do projeto e, se necessário, o README principal.
5. Verifique:
   ```bash
   npm test
   npm run lint
   npm run format:check
   ```
6. Abra um Pull Request descrevendo o que a mudança ensina e como foi verificada. Para mudanças de interface, descreva o teste manual feito.

## Padrões de código

- Funções puras em `src/*.js`; manipulação do DOM separada.
- Nada de `innerHTML` com dados do usuário ou de APIs: use `textContent` ou o helper `h()` de `projects/_shared/dom.js`.
- Nomes descritivos em inglês ou português, de forma consistente dentro do arquivo.
- Formulários com `label`, foco visível, navegação por teclado e feedback em regiões `aria-live` quando a tela muda sem ação direta.
- Dados externos e `localStorage` podem faltar, falhar ou estar corrompidos: trate esses casos.
- Commits curtos e no imperativo (`Adiciona validação de CPF`).

## Estrutura de um README de projeto

Objetivo, tecnologias, conceitos praticados, desafios técnicos, funcionalidades, estrutura do código, execução, checklist de aprendizado, desafios extras e reconstrução de memória. Use os READMEs existentes como modelo.

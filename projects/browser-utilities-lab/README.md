# Browser Utilities Lab

Dificuldade: **intermediário**

## 1. Objetivo

Praticar APIs nativas do navegador que dependem de permissões, contexto seguro e arquivos do usuário, sempre com plano B para quando a API não existe ou é negada.

## 2. Tecnologias utilizadas

- Clipboard API (`navigator.clipboard.writeText`) com plano B `document.execCommand('copy')`
- File input, `File.text()`, `URL.createObjectURL`/`revokeObjectURL`
- `URLSearchParams` e `history.replaceState`
- `localStorage`, `matchMedia('(prefers-color-scheme: dark)')`
- `node:test` com objetos simulados

## 3. Conceitos praticados

- Detecção de recursos e degradação graciosa
- Tratamento de `NotAllowedError` e de contexto inseguro
- Validação de arquivo por tipo (com inferência pela extensão) e tamanho
- Liberação de memória de URLs de blob
- Preferência de tema persistida (`dark`, `light`, `system`) e reação à mudança do sistema
- Mensagens de sucesso e erro acessíveis (`role="status"`/`alert`)

## 4. Desafios técnicos

- **Clipboard**: a API só existe em HTTPS ou `localhost` e pode ser negada. `copyText` tenta a API moderna, depois o plano B e devolve um motivo claro (`denied`, `unavailable`, `error`, `empty`).
- **`file.type` vazio**: alguns sistemas não informam o tipo; usamos a extensão.
- **Segurança no preview**: SVG fica fora da lista permitida; o conteúdo de texto entra via `textContent`; o arquivo nunca é enviado.
- **Vazamento de memória**: cada `createObjectURL` precisa de um `revokeObjectURL`.
- **`localStorage` bloqueado**: `safeStorage` nunca lança; a interface avisa que a preferência não foi salva.

## 5. Funcionalidades

- Copiar um texto e copiar o link da página, com mensagem de sucesso ou do motivo da falha
- Escolher arquivo (PNG, JPEG, WebP, GIF, TXT ou JSON até 2 MB), validar e pré-visualizar (imagem, texto ou JSON formatado)
- Ler, adicionar e remover parâmetros da URL (a barra de endereço é atualizada)
- Alternar tema claro, escuro ou do sistema, com preferência salva
- Painel que mostra quais APIs estão disponíveis no navegador atual

## 6. Estrutura do código

| Arquivo            | Responsabilidade                               |
| ------------------ | ---------------------------------------------- |
| `src/clipboard.js` | Cópia com plano B e motivos de falha           |
| `src/files.js`     | Validação, formatação de tamanho, tipo efetivo |
| `src/params.js`    | Operações sobre parâmetros da URL              |
| `src/theme.js`     | Resolução de tema e `safeStorage`              |
| `src/main.js`      | Liga tudo à página                             |

Testes: `tests/browser-utilities.test.js`.

## 7. Execução

```bash
npm start
# abra http://localhost:3000/projects/browser-utilities-lab/
```

**Testes manuais:**

1. Abra por `http://127.0.0.1:3000` e por `http://localhost:3000`: a cópia deve funcionar. Em um endereço de rede (IP da máquina, sem HTTPS) o painel mostrará a Clipboard API como indisponível e o plano B entra em ação.
2. Selecione um `.pdf` ou um arquivo maior que 2 MB: mensagem de erro.
3. Selecione um `.json` inválido: o texto aparece sem formatação.
4. Troque o tema e recarregue: a escolha permanece.
5. Em uma janela anônima com cookies bloqueados, o aviso de preferência não salva deve aparecer.

## 8. Checklist de aprendizado

- [ ] Sei por que `navigator.clipboard` pode não existir.
- [ ] Sei tratar permissão negada sem quebrar a tela.
- [ ] Sei validar tipo e tamanho de arquivo.
- [ ] Sei liberar um `ObjectURL`.
- [ ] Sei persistir uma preferência com tolerância a falhas.

## 9. Desafios extras

- Arrastar e soltar arquivos com a mesma validação.
- Ler o conteúdo da área de transferência (`readText`) com tratamento de permissão.
- Detectar `prefers-reduced-motion` e `prefers-contrast` e mostrá-los no painel.

## 10. Reconstrução de memória

Implemente: `copyText` com plano B, `validateFile`, `resolveTheme`, `safeStorage` e `setParam` com `URLSearchParams`.

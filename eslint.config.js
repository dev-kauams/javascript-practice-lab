import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', '_site/'] },
  js.configs.recommended,
  {
    languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
    rules: {
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Código que roda no navegador
    files: ['projects/**/*.js', 'index.js'],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    // Código que roda no Node.js (testes e scripts)
    files: ['tests/**/*.js', 'scripts/**/*.js', 'eslint.config.js'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // Exemplos propositalmente "ruins" do laboratório de qualidade
    // (bugs didáticos usam == e var de forma controlada).
    files: ['projects/javascript-quality-lab/src/bugs.js'],
    rules: { eqeqeq: 'off', 'no-var': 'off', 'prefer-const': 'off' },
  },
];

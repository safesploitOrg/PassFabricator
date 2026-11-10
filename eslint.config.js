import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/**', 'dist/**', 'coverage/**', 'reports/**', 'test-results/**', 'playwright-report/**'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs}'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    rules: {
      'no-eval': 'error',
      'no-new-func': 'error',
      'no-implied-eval': 'error',
      'no-script-url': 'error',
      'no-unused-vars': ['error', { caughtErrors: 'none' }]
    }
  },
  { files: ['public/**/*.js'], languageOptions: { globals: globals.browser } },
  { files: ['*.config.js', 'scripts/**/*.mjs', 'tests/**/*.js'], languageOptions: { globals: globals.node } },
  {
    files: ['tests/browser/**/*.js'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } }
  }
];

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/*.test.js'],
    coverage: {
      provider: 'v8',
      include: [
        'public/assets/js/modules/analyse_password.js',
        'public/assets/js/modules/generate_password.js',
        'public/assets/js/modules/storage.js'
      ],
      reporter: ['text', 'json-summary', 'lcov'],
      thresholds: { perFile: true, lines: 90, statements: 90, functions: 95, branches: 85 }
    }
  }
});

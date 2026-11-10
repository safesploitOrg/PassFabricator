import { defineConfig } from '@playwright/test';

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 }
};
const BROWSERS = ['chromium', 'firefox', 'webkit'];
const BASE_URL = process.env.PASSFABRICATOR_TEST_URL || 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 3,
  timeout: 30_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'off',
    screenshot: 'off',
    video: 'off'
  },
  projects: BROWSERS.flatMap((browserName) => Object.entries(VIEWPORTS).map(([size, viewport]) => ({
    name: `${browserName}-${size}`,
    use: {
      browserName,
      viewport,
      ...(browserName === 'chromium' && process.env.PASSFABRICATOR_CHROMIUM_EXECUTABLE
        ? { launchOptions: { executablePath: process.env.PASSFABRICATOR_CHROMIUM_EXECUTABLE } }
        : {})
    }
  }))),
  webServer: process.env.PASSFABRICATOR_TEST_URL ? undefined : {
    command: 'node scripts/serve.mjs',
    url: BASE_URL,
    reuseExistingServer: false
  }
});

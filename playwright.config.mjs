import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './scripts',
  testMatch: 'browser.spec.mjs',
  use: { baseURL: 'http://localhost:8798' },
  webServer: { command: 'npx wrangler dev --port 8798', url: 'http://localhost:8798', reuseExistingServer: false, timeout: 60000 },
});

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.perf.mjs',
  workers: 1,
  repeatEach: 11,
  use: { ...devices['Desktop Chrome'] },
});

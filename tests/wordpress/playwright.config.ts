import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: path.resolve(__dirname),
  testMatch: ['theme-activation.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 10 * 60 * 1000,
  expect: {
    timeout: 30 * 1000,
  },
  reporter: [['html', { outputFolder: path.resolve(__dirname, 'playwright-report'), open: 'never' }]],
  outputDir: path.resolve(__dirname, 'test-results'),
  use: {
    baseURL: process.env.WP_TESTS_BASE_URL || 'http://localhost:8089',
    browserName: 'chromium',
    ...devices['Desktop Chrome'],
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 30 * 1000,
    navigationTimeout: 60 * 1000,
  },
  globalSetup: path.resolve(__dirname, 'global-setup.ts'),
  globalTeardown: path.resolve(__dirname, 'global-teardown.ts'),
});

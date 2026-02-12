import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: path.resolve(__dirname),
  testMatch: ['smoke.spec.ts', 'verticals.spec.ts'],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html', { outputFolder: path.resolve(__dirname, 'playwright-report'), open: 'never' }]],
  outputDir: path.resolve(__dirname, 'test-results'),
  use: {
    browserName: 'chromium',
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  }
});

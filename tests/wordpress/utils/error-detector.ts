import type { Page } from '@playwright/test';

const BLOCK_ERROR_PATTERNS = [
  'attempt recovery',
  'unexpected or invalid content',
  'this block contains unexpected or invalid content',
  'block validation failed',
  'has been modified externally',
];

export async function checkForAttemptRecovery(page: Page): Promise<boolean> {
  const text = (await page.locator('body').innerText()).toLowerCase();
  return text.includes('attempt recovery');
}

export async function checkForBlockErrors(page: Page): Promise<boolean> {
  const text = (await page.locator('body').innerText()).toLowerCase();
  return BLOCK_ERROR_PATTERNS.some((pattern) => text.includes(pattern));
}

export async function getEditorWarnings(page: Page): Promise<string[]> {
  const nodes = page.locator('.components-notice, [role="alert"], .editor-warning, .block-editor-warning');
  const count = await nodes.count();
  const warnings: string[] = [];

  for (let i = 0; i < count; i += 1) {
    const value = (await nodes.nth(i).innerText()).trim();
    if (value) {
      warnings.push(value);
    }
  }

  return Array.from(new Set(warnings));
}

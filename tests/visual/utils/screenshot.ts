import fs from 'node:fs/promises';
import path from 'node:path';
import type { Page } from '@playwright/test';

async function ensureDir(filePath: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

export async function captureHomepage(page: Page, outputPath: string): Promise<void> {
  await ensureDir(outputPath);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: outputPath, fullPage: true });
}

export async function captureAboveFold(page: Page, outputPath: string): Promise<void> {
  await ensureDir(outputPath);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: outputPath, fullPage: false });
}

export async function captureAllPages(
  page: Page,
  theme: { vertical: string; mode: string; specialPages?: readonly string[] },
  outputDir: string,
  resolvePageUrl: (slug?: string) => string
): Promise<void> {
  const homepage = path.join(outputDir, theme.vertical, `${theme.mode}-homepage.png`);
  await page.goto(resolvePageUrl('home'));
  await captureHomepage(page, homepage);

  const pages = theme.specialPages || [];
  for (const slug of pages) {
    const file = path.join(outputDir, theme.vertical, `${theme.mode}-${slug}.png`);
    await page.goto(resolvePageUrl(slug));
    await captureHomepage(page, file);
  }
}

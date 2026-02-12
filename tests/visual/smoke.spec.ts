import path from 'node:path';
import { test, expect } from '@playwright/test';
import { generateThemeForVisual } from './setup/generate-theme';
import { serveThemeFromZip } from './setup/serve-theme';
import { captureHomepage } from './utils/screenshot';

const SCREENSHOT_ROOT = path.resolve(process.cwd(), 'tests/visual/screenshots');

test('smoke: restaurant modern visual capture', async ({ page }) => {
  test.setTimeout(180_000);

  const generated = await generateThemeForVisual({
    vertical: 'restaurant',
    recipe: 'classic-bistro',
    brandMode: 'modern',
    outputDir: '/tmp/pp-visual-smoke-restaurant-modern',
    slug: 'visual-smoke-restaurant-modern'
  });

  const served = await serveThemeFromZip(generated.themeZipPath);

  try {
    await page.goto(served.resolvePageUrl('home'));
    const out = path.join(SCREENSHOT_ROOT, 'restaurant', 'modern-homepage.png');
    await captureHomepage(page, out);

    await page.goto(served.resolvePageUrl('menu'));
    const menuOut = path.join(SCREENSHOT_ROOT, 'restaurant', 'modern-menu.png');
    await captureHomepage(page, menuOut);

    expect(generated.themeZipPath).toContain('.zip');
  } finally {
    await served.close();
  }
});

import path from 'node:path';
import { test, expect } from '@playwright/test';
import { generateThemeForVisual } from './setup/generate-theme';
import { serveThemeFromZip } from './setup/serve-theme';
import { captureAllPages, captureAboveFold } from './utils/screenshot';

const VERTICALS = [
  { name: 'restaurant', recipe: 'classic-bistro', special: ['menu'] },
  { name: 'saas', recipe: 'startup-landing', special: [] },
  { name: 'portfolio', recipe: 'creative-professional', special: ['gallery'] },
  { name: 'local-service', recipe: 'home-services', special: [] },
  { name: 'ecommerce', recipe: 'boutique-store', special: ['shop'] },
] as const;

const BRAND_MODES = ['modern', 'playful', 'bold', 'minimal'] as const;
const SCREENSHOT_ROOT = path.resolve(process.cwd(), 'tests/visual/screenshots');

test.describe.configure({ mode: 'serial' });

for (const vertical of VERTICALS) {
  for (const mode of BRAND_MODES) {
    test(`${vertical.name} ${mode} visual capture`, async ({ page }, testInfo) => {
      test.setTimeout(180_000);

      const slug = `visual-${vertical.name}-${mode}`;
      const outputDir = `/tmp/pp-visual-${vertical.name}-${mode}`;

      const generated = await generateThemeForVisual({
        vertical: vertical.name,
        recipe: vertical.recipe,
        brandMode: mode,
        outputDir,
        slug,
      });

      const served = await serveThemeFromZip(generated.themeZipPath);

      try {
        await captureAllPages(
          page,
          { vertical: vertical.name, mode, specialPages: vertical.special },
          SCREENSHOT_ROOT,
          served.resolvePageUrl
        );

        await page.goto(served.resolvePageUrl('home'));
        await captureAboveFold(
          page,
          path.join(SCREENSHOT_ROOT, vertical.name, `${mode}-above-fold.png`)
        );

        await testInfo.attach('theme-json', {
          body: JSON.stringify(generated, null, 2),
          contentType: 'application/json'
        });

        expect(generated.themeZipPath.endsWith('.zip')).toBeTruthy();
      } finally {
        await served.close();
      }
    });
  }
}

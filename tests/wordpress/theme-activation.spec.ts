import path from 'node:path';
import { test, expect, type Page } from '@playwright/test';
import { generateThemeForVisual } from '../visual/setup/generate-theme';
import { installTheme, resetWordPress } from './setup/wp-cli';
import { isDockerAvailable } from './setup/docker';
import { checkForAttemptRecovery, checkForBlockErrors, getEditorWarnings } from './utils/error-detector';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'tests/wordpress/screenshots');
const ADMIN_USER = process.env.WP_TESTS_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.WP_TESTS_ADMIN_PASS || 'admin';
const EDITOR_READY_SELECTOR =
  '.edit-site-visual-editor, .edit-site-layout, iframe[name="editor-canvas"]';

const CASES = [
  { vertical: 'restaurant', recipe: 'classic-bistro', specialPage: 'menu' },
  { vertical: 'portfolio', recipe: 'creative-professional', specialPage: 'gallery' },
  { vertical: 'ecommerce', recipe: 'boutique-store', specialPage: 'shop' },
] as const;

async function loginAdmin(page: Page): Promise<void> {
  await page.goto('/wp-login.php');

  if (page.url().includes('/wp-admin')) return;

  await page.fill('#user_login', ADMIN_USER);
  await page.fill('#user_pass', ADMIN_PASS);
  await page.click('#wp-submit');
  await page.waitForURL(/wp-admin/, { timeout: 60_000 });
}

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  const dockerAvailable = await isDockerAvailable();
  test.skip(!dockerAvailable, 'Docker is not available on this machine.');
});

for (const item of CASES) {
  test(`${item.vertical}/modern activates in WordPress without recovery errors`, async ({ page }) => {
    test.setTimeout(10 * 60 * 1000);

    const slug = `wp-${item.vertical}-modern`;
    const generated = await generateThemeForVisual({
      vertical: item.vertical,
      recipe: item.recipe,
      brandMode: 'modern',
      outputDir: `/tmp/pp-wp-${item.vertical}-modern`,
      slug,
    });

    await resetWordPress();
    await installTheme(generated.themeZipPath);

    await loginAdmin(page);

    await page.goto('/wp-admin/site-editor.php', { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector(EDITOR_READY_SELECTOR, { timeout: 60_000 });
    await page.waitForTimeout(1500);

    const attemptRecovery = await checkForAttemptRecovery(page);
    const blockErrors = await checkForBlockErrors(page);
    const warnings = await getEditorWarnings(page);

    await test.info().attach(`${item.vertical}-editor-warnings.json`, {
      body: JSON.stringify(warnings, null, 2),
      contentType: 'application/json',
    });

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${item.vertical}-editor.png`), fullPage: true });

    expect(attemptRecovery).toBeFalsy();
    expect(blockErrors).toBeFalsy();

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${item.vertical}-homepage.png`), fullPage: true });

    await page.goto(`/${item.specialPage}`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${item.vertical}-${item.specialPage}.png`), fullPage: true });
  });
}

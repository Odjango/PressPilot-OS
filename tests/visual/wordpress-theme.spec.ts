/**
 * Visual Tests for Generated WordPress Themes
 *
 * Captures screenshots of generated themes in WordPress environment.
 * Requires either:
 *   - Local WordPress at localhost:8089 (configured in playwright.config.js)
 *   - WordPress Playground (browser-based, no setup needed)
 *
 * Usage:
 *   1. Ensure WordPress is running at localhost:8089
 *   2. Install/activate the generated theme
 *   3. Run tests: npx playwright test tests/visual/wordpress-theme.spec.ts
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = 'output/visual-tests';
const WP_URL = 'http://localhost:8089';
const WP_ADMIN_URL = `${WP_URL}/wp-admin`;

// WordPress credentials (defaults for local dev)
const WP_USER = process.env.WP_USER || 'admin';
const WP_PASS = process.env.WP_PASS || 'password';

test.describe('WordPress Theme Visual Tests', () => {
    test.beforeAll(async () => {
        fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    });

    test.beforeEach(async ({ page }) => {
        // Set longer timeout for WordPress operations
        test.setTimeout(60000);
    });

    test('capture front page', async ({ page }) => {
        await page.goto(WP_URL);
        await page.waitForLoadState('networkidle');

        // Wait for fonts and images to load
        await page.waitForTimeout(1000);

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'wp-front-page.png'),
            fullPage: true,
        });

        console.log('Captured: WordPress front page');
    });

    test('capture hero section', async ({ page }) => {
        await page.goto(WP_URL);
        await page.waitForLoadState('networkidle');

        // Try to find and capture just the hero/cover block
        const heroSection = page.locator('.wp-block-cover').first();

        if (await heroSection.isVisible({ timeout: 5000 }).catch(() => false)) {
            await heroSection.screenshot({
                path: path.join(SCREENSHOT_DIR, 'wp-hero-section.png'),
            });
            console.log('Captured: Hero section');
        } else {
            // Fallback to viewport capture
            await page.screenshot({
                path: path.join(SCREENSHOT_DIR, 'wp-hero-viewport.png'),
            });
            console.log('Captured: Hero viewport (cover block not found)');
        }
    });

    test('capture Site Editor', async ({ page }) => {
        // Login to WordPress admin
        await wpLogin(page);

        // Navigate to Site Editor
        await page.goto(`${WP_ADMIN_URL}/site-editor.php`);
        await page.waitForLoadState('networkidle');

        // Wait for editor to fully load
        await page.waitForTimeout(3000);

        // Dismiss any welcome modals
        const closeButton = page.locator('button[aria-label="Close"]').first();
        if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            await closeButton.click();
        }

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'wp-site-editor.png'),
            fullPage: true,
        });

        console.log('Captured: Site Editor');
    });

    test('capture template parts', async ({ page }) => {
        await wpLogin(page);

        // Navigate to template parts in Site Editor
        await page.goto(`${WP_ADMIN_URL}/site-editor.php?postType=wp_template_part`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'wp-template-parts.png'),
            fullPage: true,
        });

        console.log('Captured: Template parts');
    });
});

test.describe('WordPress Playground Tests', () => {
    /**
     * Tests using WordPress Playground - no local WordPress needed
     * Playground loads WordPress entirely in the browser
     */

    const PLAYGROUND_URL = 'https://playground.wordpress.net/';

    test.skip('capture Playground front page', async ({ page }) => {
        // Note: This test is skipped by default as it requires internet access
        // and theme upload to Playground

        await page.goto(PLAYGROUND_URL);
        await page.waitForLoadState('networkidle');

        // Wait for Playground to initialize
        await page.waitForTimeout(5000);

        // Playground loads WordPress in an iframe
        const wpFrame = page.frameLocator('iframe').first();

        // Capture the Playground view
        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'wp-playground.png'),
            fullPage: true,
        });
    });
});

test.describe('Theme Comparison Tests', () => {
    /**
     * Capture screenshots for comparing different palette/mood combinations
     * Requires themes to be generated and installed beforehand
     */

    const THEME_VARIANTS = ['test-a', 'test-b', 'test-c', 'test-d'];

    for (const variant of THEME_VARIANTS) {
        test.skip(`capture ${variant} theme`, async ({ page }) => {
            // This test assumes themes are installed and can be switched via URL param
            // or requires manual theme activation between captures

            await page.goto(WP_URL);
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1000);

            await page.screenshot({
                path: path.join(SCREENSHOT_DIR, `wp-theme-${variant}.png`),
                fullPage: true,
            });
        });
    }
});

/**
 * Helper: Login to WordPress admin
 */
async function wpLogin(page: Page): Promise<void> {
    await page.goto(`${WP_URL}/wp-login.php`);

    // Check if already logged in
    if (page.url().includes('wp-admin')) {
        return;
    }

    // Fill login form
    await page.fill('#user_login', WP_USER);
    await page.fill('#user_pass', WP_PASS);
    await page.click('#wp-submit');

    // Wait for redirect to admin
    await page.waitForURL(/wp-admin/, { timeout: 10000 });
}

/**
 * Helper: Switch active theme
 */
async function switchTheme(page: Page, themeSlug: string): Promise<void> {
    await wpLogin(page);
    await page.goto(`${WP_ADMIN_URL}/themes.php`);
    await page.waitForLoadState('networkidle');

    // Find and activate the theme
    const themeCard = page.locator(`[data-slug="${themeSlug}"]`).first();
    if (await themeCard.isVisible()) {
        await themeCard.hover();
        const activateButton = themeCard.locator('a:has-text("Activate")');
        if (await activateButton.isVisible()) {
            await activateButton.click();
            await page.waitForLoadState('networkidle');
        }
    }
}

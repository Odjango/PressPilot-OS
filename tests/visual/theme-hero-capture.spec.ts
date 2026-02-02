/**
 * Theme Hero Screenshot Tests
 *
 * Captures REAL hero section screenshots from generated WordPress themes.
 * Shows actual layout, typography, Unsplash images, and color schemes.
 *
 * Prerequisites:
 *   - WordPress running at localhost:8089
 *   - Test themes installed (upload ZIPs via Appearance > Themes > Add New > Upload)
 *   - Generate themes first: npx tsx scripts/test-palette-mood-combinations.ts
 *
 * Usage:
 *   npx playwright test tests/visual/theme-hero-capture.spec.ts
 *   Or click tests in VS Code Playwright Test sidebar
 */

import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Output directory for hero screenshots
const ARTIFACTS_DIR = path.join(process.cwd(), 'tests', 'artifacts', 'heroes');

// WordPress settings
const WP_URL = 'http://localhost:8089';
const WP_ADMIN_URL = `${WP_URL}/wp-admin`;
const WP_USER = process.env.WP_USER || 'admin';
const WP_PASS = process.env.WP_PASS || 'password123';

// Test themes to capture - matches scripts/test-palette-mood-combinations.ts
const TEST_THEMES = [
    { id: 'test-a', name: 'Test A', mood: 'Warm', palette: 'Restaurant Soft', expectedColors: 'amber/cream' },
    { id: 'test-b', name: 'Test B', mood: 'Fresh', palette: 'Restaurant Soft', expectedColors: 'green/teal' },
    { id: 'test-c', name: 'Test C', mood: 'Minimal', palette: 'SaaS Bright', expectedColors: 'red/white' },
    { id: 'test-d', name: 'Test D', mood: 'Dark', palette: 'E-Commerce Bold', expectedColors: 'blue/slate' },
];

/**
 * Helper: Login to WordPress admin
 */
async function wpLogin(page: Page): Promise<void> {
    await page.goto(`${WP_URL}/wp-login.php`);

    // Check if already logged in (redirected to admin)
    if (page.url().includes('wp-admin')) {
        return;
    }

    // Fill login form
    await page.fill('#user_login', WP_USER);
    await page.fill('#user_pass', WP_PASS);
    await page.click('#wp-submit');

    // Wait for redirect to admin
    await page.waitForURL(/wp-admin/, { timeout: 15000 });
}

/**
 * Helper: Activate a theme by slug
 * Returns true if theme was found and activated, false if not found
 */
async function activateTheme(page: Page, themeSlug: string): Promise<boolean> {
    await wpLogin(page);
    await page.goto(`${WP_ADMIN_URL}/themes.php`);
    await page.waitForLoadState('networkidle');

    // Find theme card by data-slug attribute
    const themeCard = page.locator(`[data-slug="${themeSlug}"]`);

    if (!await themeCard.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log(`⚠️ Theme "${themeSlug}" not found. Install it first via Appearance > Themes > Add New.`);
        return false;
    }

    // Hover to reveal Activate button
    await themeCard.hover();

    // Click Activate if visible (theme not already active)
    const activateBtn = themeCard.locator('a:has-text("Activate")');
    if (await activateBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await activateBtn.click();
        await page.waitForLoadState('networkidle');
        console.log(`✅ Activated theme: ${themeSlug}`);
    } else {
        console.log(`ℹ️ Theme "${themeSlug}" already active`);
    }

    return true;
}

/**
 * Helper: Capture hero section (wp:cover block)
 * Falls back to viewport capture if no cover block found
 */
async function captureHero(page: Page, outputPath: string): Promise<void> {
    // Wait for page to fully render
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500); // Extra time for images/fonts

    // Try to find the hero section (wp:cover block)
    const heroSection = page.locator('.wp-block-cover').first();

    if (await heroSection.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Capture just the hero section
        await heroSection.screenshot({ path: outputPath });
        console.log(`📸 Captured hero section: ${path.basename(outputPath)}`);
    } else {
        // Fallback: capture top portion of viewport
        await page.screenshot({
            path: outputPath,
            clip: { x: 0, y: 0, width: 1400, height: 800 }
        });
        console.log(`📸 Captured viewport (no .wp-block-cover found): ${path.basename(outputPath)}`);
    }
}

// ============================================================================
// TEST SUITES
// ============================================================================

test.describe('Theme Hero Screenshots', () => {
    test.beforeAll(async () => {
        // Ensure artifacts directory exists
        fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
        console.log(`📁 Screenshots will be saved to: ${ARTIFACTS_DIR}`);
    });

    // Generate individual tests for each theme
    for (const theme of TEST_THEMES) {
        test.describe(`${theme.name} (${theme.mood} - ${theme.expectedColors})`, () => {

            test(`capture home hero - ${theme.id}`, async ({ page }) => {
                test.setTimeout(90000); // 90s for theme switching + capture

                // Activate the theme
                const activated = await activateTheme(page, theme.id);
                if (!activated) {
                    test.skip(true, `Theme ${theme.id} not installed. Run: npx tsx scripts/test-palette-mood-combinations.ts`);
                    return;
                }

                // Navigate to front page
                await page.goto(WP_URL);

                // Capture hero
                const heroPath = path.join(ARTIFACTS_DIR, `${theme.id}-home-hero.png`);
                await captureHero(page, heroPath);

                // Verify file was created
                expect(fs.existsSync(heroPath)).toBeTruthy();
            });

            test(`capture about page - ${theme.id}`, async ({ page }) => {
                test.setTimeout(90000);

                // Activate the theme (may already be active)
                const activated = await activateTheme(page, theme.id);
                if (!activated) {
                    test.skip(true, `Theme ${theme.id} not installed`);
                    return;
                }

                // Navigate to about page
                await page.goto(`${WP_URL}/about/`);

                // Capture hero
                const aboutPath = path.join(ARTIFACTS_DIR, `${theme.id}-about-hero.png`);
                await captureHero(page, aboutPath);

                // Verify file was created
                expect(fs.existsSync(aboutPath)).toBeTruthy();
            });

            test(`capture services page - ${theme.id}`, async ({ page }) => {
                test.setTimeout(90000);

                const activated = await activateTheme(page, theme.id);
                if (!activated) {
                    test.skip(true, `Theme ${theme.id} not installed`);
                    return;
                }

                // Navigate to services page
                await page.goto(`${WP_URL}/services/`);

                // Capture hero
                const servicesPath = path.join(ARTIFACTS_DIR, `${theme.id}-services-hero.png`);
                await captureHero(page, servicesPath);

                expect(fs.existsSync(servicesPath)).toBeTruthy();
            });
        });
    }
});

test.describe('Full Page Captures', () => {
    test.beforeAll(async () => {
        fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
    });

    // Full-page screenshot of each theme's home page
    for (const theme of TEST_THEMES) {
        test(`full page screenshot - ${theme.id} (${theme.mood})`, async ({ page }) => {
            test.setTimeout(90000);

            const activated = await activateTheme(page, theme.id);
            if (!activated) {
                test.skip(true, `Theme ${theme.id} not installed`);
                return;
            }

            await page.goto(WP_URL);
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000); // Wait for all images

            const fullPath = path.join(ARTIFACTS_DIR, `${theme.id}-full-page.png`);
            await page.screenshot({ path: fullPath, fullPage: true });

            console.log(`📸 Captured full page: ${path.basename(fullPath)}`);
            expect(fs.existsSync(fullPath)).toBeTruthy();
        });
    }
});

test.describe('Side-by-Side Comparison', () => {
    /**
     * This test captures all four themes in sequence for easy comparison.
     * Useful for visual regression testing.
     */
    test('capture all themes for comparison', async ({ page }) => {
        test.setTimeout(300000); // 5 minutes for all themes

        fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

        const capturedThemes: string[] = [];

        for (const theme of TEST_THEMES) {
            const activated = await activateTheme(page, theme.id);
            if (!activated) {
                console.log(`⚠️ Skipping ${theme.id} - not installed`);
                continue;
            }

            // Capture home page hero
            await page.goto(WP_URL);
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(1500);

            const heroPath = path.join(ARTIFACTS_DIR, `comparison-${theme.id}-hero.png`);
            await captureHero(page, heroPath);

            capturedThemes.push(theme.id);
        }

        console.log(`\n✅ Captured ${capturedThemes.length} themes for comparison:`);
        capturedThemes.forEach(id => console.log(`   - ${id}`));

        // At least one theme should have been captured
        expect(capturedThemes.length).toBeGreaterThan(0);
    });
});

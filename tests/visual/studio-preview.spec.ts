/**
 * Visual Tests for Studio Preview
 *
 * Captures screenshots of the Studio preview panel with different palette/mood combinations.
 * Useful for visual regression testing and documentation.
 *
 * Usage:
 *   1. Start the dev server: npm run dev
 *   2. Run tests: npx playwright test tests/visual/studio-preview.spec.ts
 *   3. View report: npx playwright show-report
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = 'output/visual-tests';
const STUDIO_URL = 'http://localhost:3000/studio';

// Palette/Mood combinations to capture
const COMBINATIONS = [
    { palette: 'restaurant-soft', mood: 'warm', label: 'Restaurant Soft + Warm' },
    { palette: 'restaurant-soft', mood: 'fresh', label: 'Restaurant Soft + Fresh' },
    { palette: 'saas-bright', mood: 'minimal', label: 'SaaS Bright + Minimal' },
    { palette: 'ecommerce-bold', mood: 'dark', label: 'E-Commerce Bold + Dark' },
];

test.describe('Studio Preview Visual Tests', () => {
    test.beforeAll(async () => {
        // Ensure screenshot directory exists
        fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    });

    test('should load Studio page', async ({ page }) => {
        await page.goto(STUDIO_URL);
        await page.waitForLoadState('networkidle');

        // Verify page loaded
        await expect(page).toHaveTitle(/Studio|PressPilot/i);

        // Capture initial state
        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'studio-initial.png'),
            fullPage: true,
        });
    });

    test('capture preview with different palettes', async ({ page }) => {
        await page.goto(STUDIO_URL);
        await page.waitForLoadState('networkidle');

        // Fill in required Step 1 fields to enable Step 3
        // Business name
        const nameInput = page.locator('input[placeholder*="business"]').first();
        if (await nameInput.isVisible()) {
            await nameInput.fill('Test Restaurant');
        }

        // Try to navigate through steps or directly access preview
        // This will depend on the actual Studio UI structure

        // Wait for any animations
        await page.waitForTimeout(500);

        // Capture the preview panel area
        const previewPanel = page.locator('[data-testid="preview-panel"]').first();

        if (await previewPanel.isVisible()) {
            await previewPanel.screenshot({
                path: path.join(SCREENSHOT_DIR, 'studio-preview-panel.png'),
            });
        } else {
            // Fallback to full page screenshot
            await page.screenshot({
                path: path.join(SCREENSHOT_DIR, 'studio-full-page.png'),
                fullPage: true,
            });
        }
    });

    // Individual tests for each combination (useful for parallel execution)
    for (const combo of COMBINATIONS) {
        test(`capture ${combo.label}`, async ({ page }) => {
            await page.goto(STUDIO_URL);
            await page.waitForLoadState('networkidle');

            // Navigate to step 3 (Refine) - this may need adjustment based on actual UI
            // Try clicking through steps or using URL params if available

            // Select palette by clicking the palette button
            const paletteButton = page.locator(`button:has-text("${combo.palette.replace('-', ' ')}")`).first();
            if (await paletteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await paletteButton.click();
            }

            // Select mood by clicking the mood button
            const moodButton = page.locator(`button:has-text("${combo.mood}")`).first();
            if (await moodButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                await moodButton.click();
            }

            // Wait for color transitions (300ms configured in StudioClient)
            await page.waitForTimeout(400);

            // Capture screenshot
            await page.screenshot({
                path: path.join(SCREENSHOT_DIR, `studio-${combo.palette}-${combo.mood}.png`),
                fullPage: true,
            });

            console.log(`Captured: ${combo.label}`);
        });
    }
});

test.describe('Studio Preview - Quick Capture', () => {
    test('capture current state (manual trigger)', async ({ page }) => {
        /**
         * This test is for quick manual captures.
         * Run after manually navigating to the desired state:
         *   npx playwright test tests/visual/studio-preview.spec.ts -g "manual trigger"
         */
        await page.goto(STUDIO_URL);
        await page.waitForLoadState('networkidle');

        // Wait for user to set up the state they want to capture
        // In CI, this just captures the default state
        await page.waitForTimeout(1000);

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, `studio-manual-${timestamp}.png`),
            fullPage: true,
        });
    });
});

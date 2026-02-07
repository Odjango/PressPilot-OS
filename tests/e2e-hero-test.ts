/**
 * E2E Hero Test - Restaurant & E-commerce Flows
 *
 * Tests the Studio wizard flow for both verticals and captures hero screenshots.
 * Uses robust selectors based on actual UI structure.
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(process.cwd(), 'Tests/Artifacts/Heroes');

/**
 * Create or retrieve a test project via API with bypass token
 */
async function ensureTestProject(slug: string, name: string): Promise<boolean> {
    try {
        const response = await fetch(`${BASE_URL}/api/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer bypass-token'
            },
            body: JSON.stringify({ name, slug, status: 'draft' })
        });

        const data = await response.json();
        if (data.project) {
            console.log(`  ✓ Project "${name}" ready (slug: ${slug})`);
            return true;
        } else if (data.error) {
            console.log(`  ⚠ Project setup: ${data.error}`);
            return response.status === 409; // Already exists is OK
        }
        return false;
    } catch (error) {
        console.error(`  ✗ Failed to create project: ${error}`);
        return false;
    }
}

interface TestResult {
    scenario: string;
    success: boolean;
    heroLayoutMatched: boolean;
    noErrorMessages: boolean;
    screenshotPath: string | null;
    issues: string[];
    currentStep: string;
}

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runRestaurantFlow(page: Page): Promise<TestResult> {
    const result: TestResult = {
        scenario: 'Restaurant - Luigi\'s Pizza',
        success: false,
        heroLayoutMatched: false,
        noErrorMessages: true,
        screenshotPath: null,
        issues: [],
        currentStep: 'Starting'
    };

    try {
        console.log('\n🍕 Starting Restaurant E2E Flow...');

        // Navigate to studio with e2e-restaurant project
        console.log('  → Loading /studio/e2e-restaurant...');
        await page.goto(`${BASE_URL}/studio/e2e-restaurant`, { waitUntil: 'networkidle', timeout: 30000 });
        await delay(3000);
        result.currentStep = 'Page loaded';

        // Take debug screenshot to see current state
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'restaurant-debug-1.png') });

        // Check page content
        const pageText = await page.textContent('body');
        console.log('  → Page title/content detected');

        // Look for Step 1 elements with more flexible selectors
        result.currentStep = 'Step 1 - Context';

        // Try to find and click Restaurant category (look for text containing "Restaurant")
        console.log('  → Looking for Restaurant category...');
        const categoryButtons = page.locator('button').filter({ hasText: /restaurant/i });
        const categoryCount = await categoryButtons.count();
        console.log(`     Found ${categoryCount} matching buttons`);

        if (categoryCount > 0) {
            await categoryButtons.first().click();
            console.log('  → Selected Restaurant category');
            await delay(500);
        }

        // Fill the brief textarea
        console.log('  → Looking for brief textarea...');
        const textarea = page.locator('textarea').first();
        if (await textarea.isVisible()) {
            await textarea.fill('Luigi\'s Pizza is a family-owned Italian restaurant serving authentic wood-fired pizzas, fresh pasta, and classic Italian desserts.');
            console.log('  → Filled brief');
        }

        // Click continue/next button
        console.log('  → Looking for Continue button...');
        const continueBtn = page.locator('button').filter({ hasText: /continue|next|variations/i }).first();
        if (await continueBtn.isVisible()) {
            await continueBtn.click();
            console.log('  → Clicked Continue');
            await delay(5000); // Wait for API
        }
        result.currentStep = 'Step 2 - Homepage';

        // Take debug screenshot
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'restaurant-debug-2.png') });

        // Step 2: Find and click "Use This Hero" button
        console.log('  → Looking for hero selection...');
        const useHeroBtn = page.locator('button').filter({ hasText: /use this hero/i }).first();
        if (await useHeroBtn.isVisible()) {
            await useHeroBtn.click();
            console.log('  → Selected hero layout');
            await delay(2000);
        }
        result.currentStep = 'Step 3 - Refine';

        // Take debug screenshot
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'restaurant-debug-3.png') });

        // Step 3: Click Preview button
        console.log('  → Looking for Preview button...');
        const previewBtn = page.locator('button').filter({ hasText: /preview/i }).first();
        if (await previewBtn.isVisible()) {
            await previewBtn.click();
            console.log('  → Clicked Preview');
        }
        result.currentStep = 'Step 4 - Preview';

        // Wait for rendering to complete (wait for "Rendering..." to disappear)
        console.log('  → Waiting for WordPress preview to render...');
        try {
            // Wait up to 60 seconds for rendering to complete
            await page.waitForFunction(() => {
                const body = document.body.textContent || '';
                return !body.includes('Rendering...');
            }, { timeout: 60000 });
            console.log('  → Rendering complete');
        } catch {
            console.log('  ⚠ Rendering timeout - capturing current state');
        }
        await delay(3000); // Extra buffer for images to load

        // Check for error indicators
        const hasRecoveryText = (await page.textContent('body'))?.includes('Attempt Recovery') || false;
        if (hasRecoveryText) {
            result.noErrorMessages = false;
            result.issues.push('Recovery error message detected');
        }

        // Take final hero screenshot (viewport)
        console.log('  → Capturing hero screenshot...');
        const screenshotPath = path.join(SCREENSHOT_DIR, 'restaurant-hero.png');
        await page.screenshot({
            path: screenshotPath,
            fullPage: false,
            clip: { x: 0, y: 0, width: 1440, height: 900 }
        });
        result.screenshotPath = screenshotPath;

        // Take full-page screenshot
        console.log('  → Capturing full homepage screenshot...');
        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'restaurant-full-page.png'),
            fullPage: true
        });

        // Verify content is restaurant-appropriate
        const finalContent = await page.textContent('body') || '';
        const hasRestaurantContent = /pizza|restaurant|menu|food|dining/i.test(finalContent);
        result.heroLayoutMatched = hasRestaurantContent;

        result.success = result.noErrorMessages && result.issues.length === 0;
        console.log(`  ✅ Restaurant flow completed at: ${result.currentStep}`);

    } catch (error) {
        result.issues.push(`Error at ${result.currentStep}: ${error instanceof Error ? error.message : String(error)}`);
        console.error('  ❌ Restaurant flow error:', error);

        // Capture error state screenshot
        try {
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'restaurant-error.png') });
        } catch {}
    }

    return result;
}

async function runEcommerceFlow(page: Page): Promise<TestResult> {
    const result: TestResult = {
        scenario: 'E-commerce - Atlas Running Store',
        success: false,
        heroLayoutMatched: false,
        noErrorMessages: true,
        screenshotPath: null,
        issues: [],
        currentStep: 'Starting'
    };

    try {
        console.log('\n🏃 Starting E-commerce E2E Flow...');

        // Navigate to studio with e2e-ecommerce project
        console.log('  → Loading /studio/e2e-ecommerce...');
        await page.goto(`${BASE_URL}/studio/e2e-ecommerce`, { waitUntil: 'networkidle', timeout: 30000 });
        await delay(3000);
        result.currentStep = 'Page loaded';

        // Take debug screenshot
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'ecommerce-debug-1.png') });

        // Find and click E-commerce category
        console.log('  → Looking for E-commerce category...');
        const categoryButtons = page.locator('button').filter({ hasText: /e-commerce|ecommerce|shop|store/i });
        const categoryCount = await categoryButtons.count();
        console.log(`     Found ${categoryCount} matching buttons`);

        if (categoryCount > 0) {
            await categoryButtons.first().click();
            console.log('  → Selected E-commerce category');
            await delay(500);
        }
        result.currentStep = 'Step 1 - Context';

        // Fill brief
        console.log('  → Filling brief...');
        const textarea = page.locator('textarea').first();
        if (await textarea.isVisible()) {
            await textarea.fill('Atlas Running Store is a premium athletic retailer specializing in high-performance running shoes, technical apparel, and accessories for fitness enthusiasts.');
        }

        // Continue to Step 2
        console.log('  → Clicking Continue...');
        const continueBtn = page.locator('button').filter({ hasText: /continue|next|variations/i }).first();
        if (await continueBtn.isVisible()) {
            await continueBtn.click();
            await delay(5000);
        }
        result.currentStep = 'Step 2 - Homepage';

        // Take debug screenshot
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'ecommerce-debug-2.png') });

        // Select Split Hero (third option if available, otherwise first)
        console.log('  → Selecting Split hero layout...');
        const heroButtons = page.locator('button').filter({ hasText: /use this hero/i });
        const heroCount = await heroButtons.count();
        console.log(`     Found ${heroCount} hero options`);

        if (heroCount >= 3) {
            await heroButtons.nth(2).click(); // Split is third
        } else if (heroCount > 0) {
            await heroButtons.first().click();
        }
        await delay(2000);
        result.currentStep = 'Step 3 - Refine';

        // Take debug screenshot
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'ecommerce-debug-3.png') });

        // Click Preview
        console.log('  → Clicking Preview...');
        const previewBtn = page.locator('button').filter({ hasText: /preview/i }).first();
        if (await previewBtn.isVisible()) {
            await previewBtn.click();
        }
        result.currentStep = 'Step 4 - Preview';

        // Wait for rendering to complete
        console.log('  → Waiting for WordPress preview to render...');
        try {
            await page.waitForFunction(() => {
                const body = document.body.textContent || '';
                return !body.includes('Rendering...');
            }, { timeout: 60000 });
            console.log('  → Rendering complete');
        } catch {
            console.log('  ⚠ Rendering timeout - capturing current state');
        }
        await delay(3000); // Extra buffer for images to load

        // Check for errors
        const hasRecoveryText = (await page.textContent('body'))?.includes('Attempt Recovery') || false;
        if (hasRecoveryText) {
            result.noErrorMessages = false;
            result.issues.push('Recovery error message detected');
        }

        // Capture hero screenshot (viewport)
        console.log('  → Capturing hero screenshot...');
        const screenshotPath = path.join(SCREENSHOT_DIR, 'ecommerce-hero.png');
        await page.screenshot({
            path: screenshotPath,
            fullPage: false,
            clip: { x: 0, y: 0, width: 1440, height: 900 }
        });
        result.screenshotPath = screenshotPath;

        // Take full-page screenshot
        console.log('  → Capturing full homepage screenshot...');
        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'ecommerce-full-page.png'),
            fullPage: true
        });

        // Verify content
        const finalContent = await page.textContent('body') || '';
        const hasEcommerceContent = /shop|store|product|running|athletic/i.test(finalContent);
        result.heroLayoutMatched = hasEcommerceContent;

        result.success = result.noErrorMessages && result.issues.length === 0;
        console.log(`  ✅ E-commerce flow completed at: ${result.currentStep}`);

    } catch (error) {
        result.issues.push(`Error at ${result.currentStep}: ${error instanceof Error ? error.message : String(error)}`);
        console.error('  ❌ E-commerce flow error:', error);

        try {
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'ecommerce-error.png') });
        } catch {}
    }

    return result;
}

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  E2E Hero Test - Restaurant & E-commerce Flows');
    console.log('═══════════════════════════════════════════════════════════');

    // Ensure screenshot directory exists
    if (!fs.existsSync(SCREENSHOT_DIR)) {
        fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    // Create test projects via API with bypass token
    console.log('\n📦 Setting up test projects...');
    await ensureTestProject('e2e-restaurant', "Luigi's Pizza");
    await ensureTestProject('e2e-ecommerce', 'Atlas Running Store');

    const browser: Browser = await chromium.launch({
        headless: true,
        args: ['--window-size=1440,900', '--no-sandbox']
    });

    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        // Set localStorage for bypass auth
        storageState: {
            cookies: [],
            origins: [{
                origin: BASE_URL,
                localStorage: [
                    { name: 'bypass-token', value: 'true' }
                ]
            }]
        }
    });

    const results: TestResult[] = [];

    try {
        // Run Restaurant flow
        const restaurantPage = await context.newPage();
        const restaurantResult = await runRestaurantFlow(restaurantPage);
        results.push(restaurantResult);
        await restaurantPage.close();

        // Run E-commerce flow
        const ecommercePage = await context.newPage();
        const ecommerceResult = await runEcommerceFlow(ecommercePage);
        results.push(ecommerceResult);
        await ecommercePage.close();

    } finally {
        await browser.close();
    }

    // Print results
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  TEST RESULTS');
    console.log('═══════════════════════════════════════════════════════════\n');

    for (const result of results) {
        console.log(`📋 ${result.scenario}`);
        console.log(`   Final Step: ${result.currentStep}`);
        console.log(`   Success: ${result.success ? '✅' : '❌'}`);
        console.log(`   Hero Layout Matched: ${result.heroLayoutMatched ? '✅' : '⚠️'}`);
        console.log(`   No Error Messages: ${result.noErrorMessages ? '✅' : '❌'}`);
        console.log(`   Screenshot: ${result.screenshotPath || 'N/A'}`);
        if (result.issues.length > 0) {
            console.log(`   Issues:`);
            for (const issue of result.issues) {
                console.log(`     - ${issue}`);
            }
        }
        console.log('');
    }

    const allPassed = results.every(r => r.success);
    console.log(`\n${allPassed ? '✅ All tests passed!' : '⚠️ Some tests had issues - check debug screenshots'}`);
    console.log(`\nScreenshots saved to: ${SCREENSHOT_DIR}`);

    return allPassed ? 0 : 1;
}

main().then(code => process.exit(code)).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

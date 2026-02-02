/**
 * WordPress Setup Script for Visual Testing
 *
 * Automates:
 * 1. WordPress installation wizard (language + installation form)
 * 2. Installing test themes (test-a, test-b, test-c, test-d)
 *
 * Prerequisites:
 *   - WordPress running at localhost:8089 (via docker compose up)
 *   - Test theme ZIPs in output/ folder
 *
 * Usage:
 *   npx tsx scripts/setup-wordpress-for-tests.ts
 */

import { chromium, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const WP_URL = 'http://localhost:8089';
const WP_ADMIN_URL = `${WP_URL}/wp-admin`;

// WordPress setup credentials
const WP_SITE_TITLE = 'PressPilot Test Site';
const WP_USERNAME = 'admin';
const WP_PASSWORD = 'password123!';  // Stronger password to avoid weak password prompt
const WP_EMAIL = 'admin@test.local';

// Test themes to install
const TEST_THEMES = ['test-a', 'test-b', 'test-c', 'test-d'];

async function setupWordPress(page: Page): Promise<boolean> {
    console.log('\n📦 Step 1: WordPress Installation');
    console.log('=' .repeat(50));

    // Navigate to WordPress
    await page.goto(WP_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);

    // Check if already installed (login page or dashboard)
    if (currentUrl.includes('wp-login.php')) {
        console.log('✅ WordPress already installed (login page shown)');
        return true;
    }

    if (currentUrl.includes('wp-admin') && !currentUrl.includes('install')) {
        console.log('✅ WordPress already installed (admin shown)');
        return true;
    }

    // Check for language selection page
    const languageSelect = page.locator('#language-continue');
    if (await languageSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('   Selecting language (English)...');
        // English is usually pre-selected, just click Continue
        await languageSelect.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
    }

    // Check for installation form
    const siteTitle = page.locator('#weblog_title');
    if (await siteTitle.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('   Filling installation form...');

        // Fill the form
        await siteTitle.fill(WP_SITE_TITLE);
        await page.fill('#user_login', WP_USERNAME);

        // Handle password field - clear and set
        const passField = page.locator('#pass1');
        await passField.click();
        await page.waitForTimeout(300);
        await passField.fill('');
        await page.waitForTimeout(200);
        await passField.fill(WP_PASSWORD);
        await page.waitForTimeout(500);

        // Check weak password checkbox if it appears
        const weakPwCheckbox = page.locator('#pw_weak');
        if (await weakPwCheckbox.isVisible({ timeout: 1000 }).catch(() => false)) {
            await weakPwCheckbox.check();
            console.log('   Checked weak password confirmation');
        }

        await page.fill('#admin_email', WP_EMAIL);

        // Uncheck search engine visibility
        const searchEngines = page.locator('#blog_public');
        if (await searchEngines.isVisible().catch(() => false)) {
            await searchEngines.uncheck();
        }

        await page.waitForTimeout(500);

        // Submit the form
        console.log('   Submitting installation...');
        const submitBtn = page.locator('#submit');

        // Wait for submit button to be enabled
        await page.waitForFunction(() => {
            const btn = document.querySelector('#submit') as HTMLButtonElement;
            return btn && !btn.disabled;
        }, { timeout: 10000 }).catch(() => {
            console.log('   Submit button may be disabled, trying force click...');
        });

        await submitBtn.click({ force: true });

        // Wait for the installation to complete - look for success message or login link
        console.log('   Waiting for installation to complete...');
        try {
            await page.waitForURL(/install\.php\?step=2|wp-login\.php/, { timeout: 60000 });
        } catch {
            // Check if we're on a success page
            const pageContent = await page.content();
            if (pageContent.includes('Success') || pageContent.includes('WordPress has been installed')) {
                console.log('   Success page detected');
            }
        }

        // Wait a bit more for database operations
        await page.waitForTimeout(2000);

        // Look for success indicators
        const successText = page.locator('h1:has-text("Success"), .step:has-text("Success"), p:has-text("WordPress has been installed")');
        if (await successText.isVisible({ timeout: 5000 }).catch(() => false)) {
            console.log('✅ WordPress installed successfully!');
        }

        // Click Log In if visible
        const loginLink = page.locator('a:has-text("Log In")');
        if (await loginLink.isVisible({ timeout: 3000 }).catch(() => false)) {
            await loginLink.click();
            await page.waitForLoadState('networkidle');
        }

        // Verify installation by checking if we can reach the admin
        await page.goto(`${WP_URL}/wp-login.php`);
        await page.waitForLoadState('networkidle');

        if (page.url().includes('install.php')) {
            console.log('❌ Installation did not complete - still showing install page');
            await page.screenshot({ path: 'output/debug-install-incomplete.png' });
            return false;
        }

        console.log('✅ WordPress installation verified');
        return true;
    }

    // Check if front page is showing (already installed)
    console.log('   Checking if WordPress is showing front page...');
    await page.goto(`${WP_URL}/wp-login.php`);
    await page.waitForLoadState('networkidle');

    if (page.url().includes('wp-login.php')) {
        console.log('✅ WordPress already installed');
        return true;
    }

    console.log('❌ Could not determine WordPress state');
    return false;
}

async function loginToWordPress(page: Page): Promise<void> {
    console.log('\n🔑 Logging in to WordPress admin...');

    await page.goto(`${WP_URL}/wp-login.php`);
    await page.waitForLoadState('networkidle');

    // Check if already logged in
    if (page.url().includes('wp-admin') && !page.url().includes('wp-login')) {
        console.log('   Already logged in');
        return;
    }

    // Wait for login form
    await page.waitForSelector('#user_login', { timeout: 10000 });

    // Fill login form
    await page.fill('#user_login', WP_USERNAME);
    await page.fill('#user_pass', WP_PASSWORD);
    await page.click('#wp-submit');

    await page.waitForURL(/wp-admin/, { timeout: 15000 });
    console.log('✅ Logged in successfully');
}

async function installTheme(page: Page, themeName: string): Promise<boolean> {
    const zipPath = path.join(process.cwd(), 'output', `${themeName}.zip`);

    if (!fs.existsSync(zipPath)) {
        console.log(`⚠️ Theme ZIP not found: ${zipPath}`);
        console.log(`   Run: npx tsx scripts/test-palette-mood-combinations.ts`);
        return false;
    }

    console.log(`\n📦 Installing theme: ${themeName}`);

    // Go to themes page
    await page.goto(`${WP_ADMIN_URL}/themes.php`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Check if theme already installed
    const existingTheme = page.locator(`[data-slug="${themeName}"]`);
    if (await existingTheme.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`   ✅ Theme "${themeName}" already installed`);
        return true;
    }

    // Navigate to Add New Theme page
    await page.goto(`${WP_ADMIN_URL}/theme-install.php`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Click "Upload Theme" button
    const uploadBtn = page.locator('a.upload-view-toggle, .upload-view-toggle');
    if (await uploadBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await uploadBtn.click();
        await page.waitForTimeout(500);
    } else {
        // Try going directly to upload page
        await page.goto(`${WP_ADMIN_URL}/theme-install.php`);
        await page.waitForLoadState('networkidle');
        // Click the upload button that should now be visible
        await page.locator('.upload-view-toggle').first().click({ force: true }).catch(() => {});
        await page.waitForTimeout(500);
    }

    // Wait for file input to be available
    const fileInput = page.locator('#themezip');
    try {
        await fileInput.waitFor({ state: 'visible', timeout: 5000 });
    } catch {
        console.log('   Upload form not visible, taking debug screenshot...');
        await page.screenshot({ path: `output/debug-upload-${themeName}.png` });

        // Last resort: try clicking upload toggle again
        await page.evaluate(() => {
            const toggle = document.querySelector('.upload-view-toggle') as HTMLElement;
            if (toggle) toggle.click();
        });
        await page.waitForTimeout(1000);
    }

    // Upload the ZIP file
    await fileInput.setInputFiles(zipPath);

    // Click Install Now
    const installBtn = page.locator('#install-theme-submit');
    await installBtn.click();

    // Wait for installation to complete
    await page.waitForSelector('.wrap a:has-text("Activate"), .wrap a:has-text("Go to Themes page")', { timeout: 60000 });

    console.log(`   ✅ Theme "${themeName}" installed`);
    return true;
}

async function createTestPages(page: Page): Promise<void> {
    console.log('\n📝 Creating test pages...');

    const pages = [
        { title: 'About', slug: 'about' },
        { title: 'Services', slug: 'services' },
        { title: 'Contact', slug: 'contact' },
    ];

    for (const pageData of pages) {
        // Check if page exists
        await page.goto(`${WP_ADMIN_URL}/edit.php?post_type=page`);
        await page.waitForLoadState('networkidle');

        const existingPage = page.locator(`a.row-title:has-text("${pageData.title}")`);
        if (await existingPage.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log(`   Page "${pageData.title}" already exists`);
            continue;
        }

        // Create new page
        await page.goto(`${WP_ADMIN_URL}/post-new.php?post_type=page`);
        await page.waitForLoadState('networkidle');

        // Handle block editor welcome modal
        const closeModal = page.locator('button[aria-label="Close"]');
        if (await closeModal.isVisible({ timeout: 2000 }).catch(() => false)) {
            await closeModal.click();
        }

        // Set title
        const titleInput = page.locator('.editor-post-title__input, [aria-label="Add title"]');
        if (await titleInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            await titleInput.fill(pageData.title);
        }

        // Publish
        const publishBtn = page.locator('.editor-post-publish-button__button, button:has-text("Publish")').first();
        if (await publishBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await publishBtn.click();
            await page.waitForTimeout(1000);

            // Confirm publish
            const confirmBtn = page.locator('.editor-post-publish-button:has-text("Publish")');
            if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                await confirmBtn.click();
            }
        }

        console.log(`   ✅ Created page: ${pageData.title}`);
        await page.waitForTimeout(1000);
    }
}

async function main() {
    console.log('=' .repeat(60));
    console.log('🚀 WordPress Setup for PressPilot Visual Testing');
    console.log('=' .repeat(60));

    const browser = await chromium.launch({
        headless: false, // Show browser so user can see progress
        slowMo: 50
    });

    const context = await browser.newContext({
        viewport: { width: 1400, height: 900 }
    });

    const page = await context.newPage();

    try {
        // Step 1: Setup WordPress
        const installed = await setupWordPress(page);
        if (!installed) {
            throw new Error('WordPress installation failed');
        }

        // Step 2: Login
        await loginToWordPress(page);

        // Step 3: Install test themes
        console.log('\n📦 Step 2: Installing Test Themes');
        console.log('=' .repeat(50));

        let installedCount = 0;
        for (const theme of TEST_THEMES) {
            const success = await installTheme(page, theme);
            if (success) installedCount++;
        }

        // Step 4: Create test pages
        await createTestPages(page);

        // Step 5: Activate first theme for testing
        console.log('\n🎨 Activating test-a theme...');
        await page.goto(`${WP_ADMIN_URL}/themes.php`);
        await page.waitForLoadState('networkidle');

        const themeCard = page.locator('[data-slug="test-a"]');
        if (await themeCard.isVisible({ timeout: 3000 }).catch(() => false)) {
            await themeCard.hover();
            const activateBtn = themeCard.locator('a:has-text("Activate")');
            if (await activateBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                await activateBtn.click();
                await page.waitForLoadState('networkidle');
                console.log('✅ Activated test-a theme');
            }
        }

        // Summary
        console.log('\n' + '=' .repeat(60));
        console.log('✅ SETUP COMPLETE!');
        console.log('=' .repeat(60));
        console.log(`\n📊 Summary:`);
        console.log(`   • WordPress URL: ${WP_URL}`);
        console.log(`   • Admin URL: ${WP_ADMIN_URL}`);
        console.log(`   • Username: ${WP_USERNAME}`);
        console.log(`   • Password: ${WP_PASSWORD}`);
        console.log(`   • Themes installed: ${installedCount}/${TEST_THEMES.length}`);
        console.log(`\n🎯 Next step: Run Playwright tests to capture hero screenshots:`);
        console.log(`   npx playwright test tests/visual/theme-hero-capture.spec.ts`);
        console.log('\n   Or use VS Code Playwright Test sidebar!\n');

    } catch (error) {
        console.error('\n❌ Setup failed:', error);
        await page.screenshot({ path: 'output/debug-setup-failed.png' });
    } finally {
        // Keep browser open briefly so user can see result
        await page.waitForTimeout(3000);
        await browser.close();
    }
}

main().catch(console.error);

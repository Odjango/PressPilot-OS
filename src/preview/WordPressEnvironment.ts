/**
 * WordPress Environment Handler
 *
 * Manages WordPress availability checking and theme installation
 * for the Real Hero Preview feature.
 */

import { chromium, Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs-extra';

export interface WordPressConfig {
    url: string;
    adminUser: string;
    adminPass: string;
    debugScreenshots?: boolean;
}

const DEFAULT_CONFIG: WordPressConfig = {
    url: process.env.WP_PREVIEW_URL || 'http://localhost:8089',
    adminUser: process.env.WP_PREVIEW_USER || 'admin',
    adminPass: process.env.WP_PREVIEW_PASS || 'password123',
    debugScreenshots: process.env.WP_DEBUG_SCREENSHOTS === 'true'
};

export class WordPressEnvironment {
    private config: WordPressConfig;

    constructor(config: Partial<WordPressConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    get url(): string {
        return this.config.url;
    }

    get adminUrl(): string {
        return `${this.config.url}/wp-admin`;
    }

    /**
     * Check if WordPress is available and responding
     */
    async isAvailable(): Promise<boolean> {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${this.config.url}/wp-json`, {
                signal: controller.signal
            });

            clearTimeout(timeout);
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * Save debug screenshot if enabled
     */
    private async debugScreenshot(page: Page, name: string): Promise<void> {
        if (this.config.debugScreenshots) {
            const debugDir = path.join(process.cwd(), 'output', 'wp-debug');
            await fs.ensureDir(debugDir);
            await page.screenshot({ path: path.join(debugDir, `${name}.png`), fullPage: true });
            console.log(`[WordPressEnvironment] Debug screenshot: ${name}.png`);
        }
    }

    /**
     * Dismiss any WordPress admin notices/modals
     */
    private async dismissNotices(page: Page): Promise<void> {
        try {
            // Dismiss update nag
            const updateNag = page.locator('.update-nag .notice-dismiss, .notice-dismiss');
            if (await updateNag.first().isVisible({ timeout: 1000 }).catch(() => false)) {
                await updateNag.first().click();
            }

            // Close any modal overlays
            const modalClose = page.locator('.media-modal-close, .tb-close-icon, [aria-label="Close"]');
            if (await modalClose.first().isVisible({ timeout: 500 }).catch(() => false)) {
                await modalClose.first().click();
            }
        } catch {
            // Ignore errors - notices might not exist
        }
    }

    /**
     * Login to WordPress admin via Playwright
     */
    async login(page: Page): Promise<void> {
        console.log(`[WordPressEnvironment] Attempting login to ${this.config.url}`);

        await page.goto(`${this.config.url}/wp-login.php`, { waitUntil: 'domcontentloaded' });

        // Check if already logged in (redirected to admin)
        const currentUrl = page.url();
        if (currentUrl.includes('wp-admin') && !currentUrl.includes('wp-login')) {
            console.log('[WordPressEnvironment] Already logged in');
            return;
        }

        await this.debugScreenshot(page, '01-login-page');

        // Wait for login form to be ready
        await page.waitForSelector('#user_login', { state: 'visible', timeout: 10000 });

        // Fill login form
        await page.fill('#user_login', this.config.adminUser);
        await page.fill('#user_pass', this.config.adminPass);

        // Check "Remember Me" if available
        const rememberMe = page.locator('#rememberme');
        if (await rememberMe.isVisible().catch(() => false)) {
            await rememberMe.check();
        }

        await this.debugScreenshot(page, '02-login-filled');

        await page.click('#wp-submit');

        // Wait for navigation - could be admin OR login page with error
        await page.waitForLoadState('networkidle', { timeout: 20000 });

        await this.debugScreenshot(page, '03-after-login');

        // Check if login failed
        const loginError = page.locator('#login_error');
        if (await loginError.isVisible({ timeout: 1000 }).catch(() => false)) {
            const errorText = await loginError.textContent();
            throw new Error(`WordPress login failed: ${errorText}`);
        }

        // Verify we're in admin area
        if (!page.url().includes('wp-admin')) {
            // Try direct navigation to admin
            await page.goto(`${this.adminUrl}/`, { waitUntil: 'networkidle' });
        }

        console.log('[WordPressEnvironment] Login successful');
        await this.dismissNotices(page);
    }

    /**
     * Install a theme by copying directly to WordPress themes folder
     * This bypasses upload permissions issues in Docker environments
     */
    async installThemeViaCopy(themeDir: string, themeSlug: string): Promise<boolean> {
        try {
            const containerName = process.env.WP_CONTAINER_NAME || 'presspilot-os-wordpress-1';
            const wpThemesPath = '/var/www/html/wp-content/themes';

            console.log(`[WordPressEnvironment] Installing theme via docker cp: ${themeSlug}`);

            // Copy theme directory to WordPress container
            const { execSync } = require('child_process');

            // First, remove existing theme if present
            try {
                execSync(`docker exec ${containerName} rm -rf ${wpThemesPath}/${themeSlug}`, { stdio: 'pipe' });
            } catch {
                // Ignore error if theme doesn't exist
            }

            // Copy the theme directory
            execSync(`docker cp "${themeDir}" "${containerName}:${wpThemesPath}/"`, { stdio: 'pipe' });

            // Fix permissions so WordPress can read the theme
            execSync(`docker exec ${containerName} chown -R www-data:www-data ${wpThemesPath}/${themeSlug}`, { stdio: 'pipe' });

            console.log(`[WordPressEnvironment] Theme copied successfully: ${themeSlug}`);
            return true;
        } catch (error) {
            console.error('[WordPressEnvironment] Theme copy failed:', error);
            return false;
        }
    }

    /**
     * Install a theme ZIP via WordPress admin
     * Returns true if successful, false otherwise
     */
    async installTheme(page: Page, zipPath: string): Promise<boolean> {
        try {
            console.log(`[WordPressEnvironment] Installing theme from: ${zipPath}`);

            await this.login(page);

            // Navigate to theme upload page
            await page.goto(`${this.adminUrl}/theme-install.php`, { waitUntil: 'networkidle' });
            await this.dismissNotices(page);
            await this.debugScreenshot(page, '04-theme-install-page');

            // WordPress 6.x uses a button with class "upload-view-toggle page-title-action"
            // The DOM structure varies by WP version, so we need to find the actual form container

            // Wait a moment for WordPress JS to initialize
            await page.waitForTimeout(1000);

            // Analyze the DOM structure - using plain JS to avoid TypeScript runtime issues
            const domAnalysis = await page.evaluate(`
                (function() {
                    var fileInput = document.querySelector('#themezip, input[name="themezip"]');
                    var submitBtn = document.querySelector('#install-theme-submit');
                    var uploadBtn = document.querySelector('.upload-view-toggle, .page-title-action');

                    var hiddenParents = [];
                    var el = submitBtn ? submitBtn.parentElement : null;
                    while (el) {
                        var style = window.getComputedStyle(el);
                        if (style.display === 'none' || style.visibility === 'hidden') {
                            hiddenParents.push(el.tagName + '.' + el.className + ' (display:' + style.display + ')');
                        }
                        el = el.parentElement;
                    }

                    return {
                        fileInputExists: !!fileInput,
                        submitBtnExists: !!submitBtn,
                        submitBtnVisible: submitBtn ? submitBtn.offsetParent !== null : false,
                        uploadBtnExists: !!uploadBtn,
                        hasUploadWrap: !!document.querySelector('.upload-theme-wrap'),
                        hiddenParents: hiddenParents
                    };
                })()
            `);

            console.log('[WordPressEnvironment] DOM analysis:', JSON.stringify(domAnalysis, null, 2));

            // Click the upload button and force visibility of all elements in the form chain
            await page.evaluate(`
                (function() {
                    // Click the upload toggle button
                    var uploadBtn = document.querySelector('.upload-view-toggle, .page-title-action');
                    if (uploadBtn) {
                        uploadBtn.click();
                    }

                    // Find the form elements
                    var fileInput = document.querySelector('#themezip, input[name="themezip"]');
                    var submitBtn = document.querySelector('#install-theme-submit');

                    // Make all parent elements visible
                    function makeVisible(element) {
                        var current = element;
                        while (current && current !== document.body) {
                            if (current.style) {
                                current.style.display = current.tagName === 'FORM' ? 'block' : '';
                                current.style.visibility = 'visible';
                                current.style.opacity = '1';
                                current.style.height = 'auto';
                                current.style.overflow = 'visible';
                            }
                            if (current.classList) {
                                current.classList.remove('hidden', 'hide-if-js', 'screen-reader-text');
                            }
                            current = current.parentElement;
                        }
                    }

                    makeVisible(fileInput);
                    makeVisible(submitBtn);

                    // Ensure submit button is visible
                    if (submitBtn) {
                        submitBtn.style.display = 'inline-block';
                        submitBtn.style.visibility = 'visible';
                        submitBtn.disabled = false;
                    }
                })()
            `);

            await page.waitForTimeout(500);
            await this.debugScreenshot(page, '05-upload-form-visible');

            // Now the upload form should be visible
            // The file input is inside the form
            const fileInput = page.locator('input#themezip, input[name="themezip"]');
            await fileInput.waitFor({ state: 'attached', timeout: 5000 });

            // Set the file
            await fileInput.setInputFiles(zipPath);
            console.log('[WordPressEnvironment] File selected');

            await this.debugScreenshot(page, '06-file-selected');

            // Wait for and click install button
            const installButton = page.locator('#install-theme-submit');
            await installButton.waitFor({ state: 'visible', timeout: 5000 });

            // Small delay to ensure button is ready
            await page.waitForTimeout(300);
            await installButton.click();

            console.log('[WordPressEnvironment] Clicked install button');

            // Wait for installation to complete (uploads and extracts the theme)
            await page.waitForLoadState('networkidle', { timeout: 60000 });
            await page.waitForTimeout(2000);

            await this.debugScreenshot(page, '07-after-install');

            // Check for success message
            const pageContent = await page.content();
            const success = pageContent.includes('Theme installed successfully') ||
                   pageContent.includes('Installing Theme from uploaded file') ||
                   pageContent.includes('Successfully installed');

            if (success) {
                console.log('[WordPressEnvironment] Theme installed successfully');

                // Try to click "Activate" if available on the success page
                const activateLink = page.locator('a:has-text("Activate")').first();
                if (await activateLink.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await activateLink.click();
                    await page.waitForLoadState('networkidle');
                    console.log('[WordPressEnvironment] Theme activated from install page');
                }
            } else if (pageContent.includes('already installed') || pageContent.includes('Destination folder already exists')) {
                console.log('[WordPressEnvironment] Theme already installed');
                return true;
            } else {
                console.log('[WordPressEnvironment] Install result unclear, checking themes page...');
            }

            return success;
        } catch (error) {
            console.error('[WordPressEnvironment] Theme installation failed:', error);
            await this.debugScreenshot(page, 'error-install-failed');
            return false;
        }
    }

    /**
     * Activate a theme by slug
     * Returns true if successful or already active
     */
    async activateTheme(page: Page, themeSlug: string): Promise<boolean> {
        try {
            console.log(`[WordPressEnvironment] Activating theme: ${themeSlug}`);

            await this.login(page);

            // Navigate to themes page
            await page.goto(`${this.adminUrl}/themes.php`, { waitUntil: 'networkidle' });
            await this.dismissNotices(page);
            await this.debugScreenshot(page, '08-themes-page');

            // Try multiple slug formats (WP sometimes normalizes slugs)
            const slugVariants = [
                themeSlug,
                themeSlug.toLowerCase(),
                themeSlug.replace(/_/g, '-'),
                themeSlug.replace(/-/g, '_')
            ];

            let themeCard = null;
            for (const slug of slugVariants) {
                const card = page.locator(`[data-slug="${slug}"]`);
                if (await card.isVisible({ timeout: 2000 }).catch(() => false)) {
                    themeCard = card;
                    console.log(`[WordPressEnvironment] Found theme with slug: ${slug}`);
                    break;
                }
            }

            // If not found by data-slug, try searching by theme name in the page
            if (!themeCard) {
                // Scroll down to load all themes
                await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
                await page.waitForTimeout(1000);

                // Try finding by partial slug match in aria-label
                const partialMatch = page.locator(`[aria-label*="${themeSlug.split('-')[0]}"]`).first();
                if (await partialMatch.isVisible({ timeout: 2000 }).catch(() => false)) {
                    themeCard = partialMatch;
                    console.log('[WordPressEnvironment] Found theme by partial match');
                }
            }

            if (!themeCard) {
                console.log(`[WordPressEnvironment] Theme "${themeSlug}" not found on themes page`);
                await this.debugScreenshot(page, 'error-theme-not-found');
                return false;
            }

            await this.debugScreenshot(page, '09-theme-found');

            // Check if already active
            const isActive = await themeCard.locator('.theme-screenshot').evaluate(
                (el) => el.closest('.theme')?.classList.contains('active')
            ).catch(() => false);

            if (isActive) {
                console.log(`[WordPressEnvironment] Theme "${themeSlug}" is already active`);
                return true;
            }

            // Hover to reveal Activate button
            await themeCard.hover();
            await page.waitForTimeout(300);

            // Click Activate button
            const activateBtn = themeCard.locator('a:has-text("Activate")');
            if (await activateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
                await activateBtn.click();
                await page.waitForLoadState('networkidle', { timeout: 30000 });
                console.log(`[WordPressEnvironment] Activated theme: ${themeSlug}`);
                await this.debugScreenshot(page, '10-theme-activated');
                return true;
            }

            // If no activate button, theme might be active or there's an issue
            console.log(`[WordPressEnvironment] Activate button not found, checking current theme...`);

            // Check if our theme is now the active one
            const activeTheme = page.locator('.theme.active');
            if (await activeTheme.isVisible().catch(() => false)) {
                const activeSlug = await activeTheme.getAttribute('data-slug');
                if (slugVariants.includes(activeSlug || '')) {
                    console.log('[WordPressEnvironment] Theme is already active');
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('[WordPressEnvironment] Theme activation failed:', error);
            await this.debugScreenshot(page, 'error-activation-failed');
            return false;
        }
    }

    /**
     * Uninstall a theme by slug
     */
    async uninstallTheme(page: Page, themeSlug: string): Promise<boolean> {
        try {
            await this.login(page);

            // Navigate to themes page
            await page.goto(`${this.adminUrl}/themes.php`);
            await page.waitForLoadState('networkidle');

            // Find and click theme card
            const themeCard = page.locator(`[data-slug="${themeSlug}"]`);

            if (!await themeCard.isVisible({ timeout: 3000 }).catch(() => false)) {
                return true; // Already uninstalled
            }

            // Click on the theme to open details
            await themeCard.click();
            await page.waitForTimeout(500);

            // Click Delete link in theme details modal
            const deleteLink = page.locator('.theme-actions a:has-text("Delete")');
            if (await deleteLink.isVisible({ timeout: 2000 }).catch(() => false)) {
                // Accept confirmation dialog
                page.on('dialog', dialog => dialog.accept());
                await deleteLink.click();
                await page.waitForLoadState('networkidle');
                return true;
            }

            return false;
        } catch (error) {
            console.error('[WordPressEnvironment] Theme uninstallation failed:', error);
            return false;
        }
    }
}

// Export singleton factory
export function getWordPressEnvironment(config?: Partial<WordPressConfig>): WordPressEnvironment {
    return new WordPressEnvironment(config);
}

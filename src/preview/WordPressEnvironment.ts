/**
 * WordPress Environment Handler
 *
 * Manages WordPress availability checking and theme installation
 * for the Real Hero Preview feature.
 */

import { chromium, Page } from 'playwright';

export interface WordPressConfig {
    url: string;
    adminUser: string;
    adminPass: string;
}

const DEFAULT_CONFIG: WordPressConfig = {
    url: process.env.WP_PREVIEW_URL || 'http://localhost:8089',
    adminUser: process.env.WP_PREVIEW_USER || 'admin',
    adminPass: process.env.WP_PREVIEW_PASS || 'password123'
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
     * Login to WordPress admin via Playwright
     */
    async login(page: Page): Promise<void> {
        await page.goto(`${this.config.url}/wp-login.php`);

        // Check if already logged in (redirected to admin)
        if (page.url().includes('wp-admin')) {
            return;
        }

        // Fill login form
        await page.fill('#user_login', this.config.adminUser);
        await page.fill('#user_pass', this.config.adminPass);
        await page.click('#wp-submit');

        // Wait for redirect to admin
        await page.waitForURL(/wp-admin/, { timeout: 15000 });
    }

    /**
     * Install a theme ZIP via WordPress admin
     * Returns true if successful, false otherwise
     */
    async installTheme(page: Page, zipPath: string): Promise<boolean> {
        try {
            await this.login(page);

            // Navigate to theme upload page
            await page.goto(`${this.adminUrl}/theme-install.php?upload`);
            await page.waitForLoadState('networkidle');

            // Upload the theme ZIP
            const fileInput = page.locator('input[type="file"]#themezip');
            await fileInput.setInputFiles(zipPath);

            // Click install button
            await page.click('#install-theme-submit');

            // Wait for installation to complete
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);

            // Check for success message
            const pageContent = await page.content();
            return pageContent.includes('Theme installed successfully') ||
                   pageContent.includes('Installing Theme from uploaded file');
        } catch (error) {
            console.error('[WordPressEnvironment] Theme installation failed:', error);
            return false;
        }
    }

    /**
     * Activate a theme by slug
     * Returns true if successful or already active
     */
    async activateTheme(page: Page, themeSlug: string): Promise<boolean> {
        try {
            await this.login(page);

            // Navigate to themes page
            await page.goto(`${this.adminUrl}/themes.php`);
            await page.waitForLoadState('networkidle');

            // Find theme card by data-slug attribute
            const themeCard = page.locator(`[data-slug="${themeSlug}"]`);

            if (!await themeCard.isVisible({ timeout: 5000 }).catch(() => false)) {
                console.log(`[WordPressEnvironment] Theme "${themeSlug}" not found`);
                return false;
            }

            // Hover to reveal Activate button
            await themeCard.hover();

            // Click Activate if visible (theme not already active)
            const activateBtn = themeCard.locator('a:has-text("Activate")');
            if (await activateBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                await activateBtn.click();
                await page.waitForLoadState('networkidle');
                console.log(`[WordPressEnvironment] Activated theme: ${themeSlug}`);
            } else {
                console.log(`[WordPressEnvironment] Theme "${themeSlug}" already active`);
            }

            return true;
        } catch (error) {
            console.error('[WordPressEnvironment] Theme activation failed:', error);
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

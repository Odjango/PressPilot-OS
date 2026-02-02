/**
 * Hero Preview Runner
 *
 * Orchestrates Playwright to capture WordPress-rendered screenshots
 * of all 4 hero layout variants for the Real Hero Preview feature.
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs-extra';
import * as path from 'path';
import { HeroLayout, PageContent } from '../generator/types';
import { WordPressEnvironment, WordPressConfig } from './WordPressEnvironment';
import { injectHeroPreviewSupport, removeHeroPreviewSupport } from './heroPreviewInjector';

export interface PreviewResult {
    layout: HeroLayout;
    label: string;
    description: string;
    screenshotPath: string;
    screenshotUrl: string;
}

export interface HeroPreviewRunnerOptions {
    /** Path to the generated theme directory (unzipped) */
    themeDir: string;
    /** Theme slug (directory name) */
    themeSlug: string;
    /** Path to the theme ZIP file */
    zipPath: string;
    /** WordPress URL (default: http://localhost:8089) */
    wordpressUrl?: string;
    /** WordPress admin username (default: admin) */
    adminUser?: string;
    /** WordPress admin password (default: password123) */
    adminPass?: string;
    /** Output directory for screenshots (default: public/tmp/previews/<sessionId>) */
    outputDir: string;
    /** Session ID for this preview run */
    sessionId: string;
    /** Page content for hero customization */
    pageContent: PageContent;
}

/** Hero layout metadata */
const HERO_LAYOUTS: Array<{
    id: HeroLayout;
    label: string;
    description: string;
}> = [
    {
        id: 'fullBleed',
        label: 'Full-Bleed Hero',
        description: 'Image fills the top of the page with text overlay'
    },
    {
        id: 'fullWidth',
        label: 'Full-Width Band',
        description: 'Bold hero band with solid color background'
    },
    {
        id: 'split',
        label: 'Split Hero',
        description: 'Text and image side by side in columns'
    },
    {
        id: 'minimal',
        label: 'Minimal',
        description: 'Clean text-only hero on white background'
    }
];

export class HeroPreviewRunner {
    private browser: Browser | null = null;
    private options: HeroPreviewRunnerOptions;
    private wpEnv: WordPressEnvironment;

    constructor(options: HeroPreviewRunnerOptions) {
        this.options = options;

        const wpConfig: Partial<WordPressConfig> = {
            url: options.wordpressUrl || process.env.WP_PREVIEW_URL || 'http://localhost:8089',
            adminUser: options.adminUser || process.env.WP_PREVIEW_USER || 'admin',
            adminPass: options.adminPass || process.env.WP_PREVIEW_PASS || 'password123'
        };

        this.wpEnv = new WordPressEnvironment(wpConfig);
    }

    /**
     * Run the full preview capture workflow
     * Returns screenshots for all 4 hero layouts
     */
    async runAll(): Promise<PreviewResult[]> {
        const results: PreviewResult[] = [];

        console.log('[HeroPreviewRunner] Starting preview capture...');
        console.log(`[HeroPreviewRunner] Theme: ${this.options.themeSlug}`);
        console.log(`[HeroPreviewRunner] Output: ${this.options.outputDir}`);

        try {
            // 1. Check WordPress availability
            const wpAvailable = await this.wpEnv.isAvailable();
            if (!wpAvailable) {
                throw new Error(`WordPress not available at ${this.wpEnv.url}. Start your local WordPress instance.`);
            }
            console.log('[HeroPreviewRunner] WordPress is available');

            // 2. Inject hero preview PHP support into the theme
            await injectHeroPreviewSupport(this.options.themeDir, this.options.pageContent);
            console.log('[HeroPreviewRunner] Injected hero preview support');

            // 3. Ensure output directory exists
            await fs.ensureDir(this.options.outputDir);

            // 4. Launch browser
            this.browser = await chromium.launch({
                headless: true, // Run headless for speed
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            console.log('[HeroPreviewRunner] Browser launched');

            // 5. Create page context
            const page = await this.browser.newPage({
                viewport: { width: 1400, height: 900 }
            });

            // 6. Install and activate theme
            const installed = await this.wpEnv.installTheme(page, this.options.zipPath);
            if (!installed) {
                console.warn('[HeroPreviewRunner] Theme may already be installed, trying to activate...');
            }

            const activated = await this.wpEnv.activateTheme(page, this.options.themeSlug);
            if (!activated) {
                throw new Error(`Failed to activate theme: ${this.options.themeSlug}`);
            }
            console.log('[HeroPreviewRunner] Theme activated');

            // 7. Capture screenshots for each hero layout
            for (const layout of HERO_LAYOUTS) {
                try {
                    const result = await this.captureHeroLayout(page, layout);
                    results.push(result);
                    console.log(`[HeroPreviewRunner] Captured: ${layout.id}`);
                } catch (error) {
                    console.error(`[HeroPreviewRunner] Failed to capture ${layout.id}:`, error);
                    // Continue with other layouts
                }
            }

            // 8. Cleanup: Remove hero preview PHP code (optional, for clean final theme)
            // We leave it for now since the final generate will create a fresh theme
            // await removeHeroPreviewSupport(this.options.themeDir);

            return results;

        } finally {
            // Cleanup browser
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
                console.log('[HeroPreviewRunner] Browser closed');
            }
        }
    }

    /**
     * Capture a single hero layout screenshot
     */
    private async captureHeroLayout(
        page: Page,
        layout: { id: HeroLayout; label: string; description: string }
    ): Promise<PreviewResult> {
        // Navigate to front page with hero layout query parameter
        const previewUrl = `${this.wpEnv.url}?pp_hero_preview=${layout.id}`;
        await page.goto(previewUrl, { waitUntil: 'networkidle' });

        // Wait for content to fully render
        await page.waitForTimeout(1500); // Extra time for images/fonts

        // Define output paths
        const filename = `${layout.id}.png`;
        const screenshotPath = path.join(this.options.outputDir, filename);
        const screenshotUrl = `/tmp/previews/${this.options.sessionId}/${filename}`;

        // Try to capture just the hero section
        await this.captureHeroSection(page, screenshotPath);

        return {
            layout: layout.id,
            label: layout.label,
            description: layout.description,
            screenshotPath,
            screenshotUrl
        };
    }

    /**
     * Capture the hero section (wp:cover or first alignfull block)
     * Falls back to viewport capture if no hero found
     */
    private async captureHeroSection(page: Page, outputPath: string): Promise<void> {
        // Try to find the hero section - multiple selectors for different layout types
        const heroSelectors = [
            '.wp-block-cover.alignfull',           // Full-bleed hero
            '.wp-block-group.alignfull:first-of-type', // Full-width band or minimal
            '.wp-block-cover',                      // Any cover block
            '.wp-block-group.alignfull'             // Any alignfull group
        ];

        let heroElement = null;

        for (const selector of heroSelectors) {
            const element = page.locator(selector).first();
            if (await element.isVisible({ timeout: 2000 }).catch(() => false)) {
                heroElement = element;
                break;
            }
        }

        if (heroElement) {
            // Capture just the hero section
            await heroElement.screenshot({ path: outputPath });
        } else {
            // Fallback: capture top portion of viewport (header + hero area)
            await page.screenshot({
                path: outputPath,
                clip: { x: 0, y: 0, width: 1400, height: 800 }
            });
        }
    }

    /**
     * Get the public URL for a screenshot
     */
    static getPublicUrl(sessionId: string, layout: HeroLayout): string {
        return `/tmp/previews/${sessionId}/${layout}.png`;
    }
}

/**
 * Factory function for creating a HeroPreviewRunner
 */
export function createHeroPreviewRunner(options: HeroPreviewRunnerOptions): HeroPreviewRunner {
    return new HeroPreviewRunner(options);
}

/**
 * Generate a unique session ID for preview runs
 */
export function generatePreviewSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
}

import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import path from 'path';
import { StorageOperations } from '@/lib/supabase/operations';

/**
 * Screenshot Service
 * Captures hero section previews using Puppeteer
 */
export class ScreenshotService {
    private browser: puppeteer.Browser | null = null;

    /**
     * Initialize browser instance
     */
    async init() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
    }

    /**
     * Capture screenshot of HTML content
     */
    async captureHero(html: string, style: string): Promise<Buffer> {
        await this.init();

        const page = await this.browser!.newPage();

        try {
            // Set viewport for consistent screenshots
            await page.setViewport({
                width: 1400,
                height: 600,
                deviceScaleFactor: 2 // Retina quality
            });

            // Load HTML content
            await page.setContent(html, {
                waitUntil: 'networkidle0'
            });

            // Wait for fonts to load
            await page.evaluateHandle('document.fonts.ready');

            // Capture screenshot
            const screenshot = await page.screenshot({
                type: 'png',
                fullPage: false
            });

            return screenshot as Buffer;

        } finally {
            await page.close();
        }
    }

    /**
     * Capture and upload hero preview
     */
    async captureAndUpload(
        html: string,
        style: string,
        previewId: string
    ): Promise<string> {
        // Capture screenshot
        const screenshot = await this.captureHero(html, style);

        // Save to temp file
        const tempDir = path.join(process.cwd(), 'tmp', 'previews');
        await fs.ensureDir(tempDir);

        const tempPath = path.join(tempDir, `${previewId}-${style}.png`);
        await fs.writeFile(tempPath, screenshot);

        // Upload to Supabase Storage
        const fileName = `hero-previews/${previewId}/${style}.png`;
        const publicUrl = await StorageOperations.uploadTheme(tempPath, fileName);

        // Clean up temp file
        await fs.remove(tempPath);

        return publicUrl;
    }

    /**
     * Close browser instance
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
}

// Singleton instance
let screenshotService: ScreenshotService | null = null;

export function getScreenshotService(): ScreenshotService {
    if (!screenshotService) {
        screenshotService = new ScreenshotService();
    }
    return screenshotService;
}

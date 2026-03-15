/**
 * Quick visual verification script for dark section text fixes
 * Captures screenshot of the fixed theme's front page
 */

import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

const PLAYGROUND_URL = 'https://playground.wordpress.net/';
const THEME_ZIP_PATH = path.join(__dirname, 'themes', 'gold-standard-restaurant-fixed.zip');
const SCREENSHOT_DIR = path.join(__dirname, 'verification-screenshots');

async function captureFixedTheme() {
    console.log('🚀 Starting theme verification capture...\n');

    // Ensure screenshot directory exists
    if (!fs.existsSync(SCREENSHOT_DIR)) {
        fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1400, height: 900 }
    });
    const page = await context.newPage();

    try {
        console.log('📦 Loading WordPress Playground...');
        await page.goto(PLAYGROUND_URL, { waitUntil: 'networkidle', timeout: 60000 });

        console.log('⏳ Waiting for playground to initialize...');
        await page.waitForTimeout(5000);

        // Find the playground iframe
        const playgroundFrame = page.frameLocator('iframe[src*="playground"]').first();

        console.log('🎨 Installing theme...');
        // This is a simplified approach - you may need to interact with the playground's file upload UI
        console.log('NOTE: Manual upload required in the browser window');
        console.log(`1. Navigate to Appearance > Themes > Add New > Upload Theme`);
        console.log(`2. Upload: ${THEME_ZIP_PATH}`);
        console.log(`3. Activate the theme`);
        console.log('\nWaiting 30 seconds for manual upload...');
        await page.waitForTimeout(30000);

        console.log('📸 Capturing homepage screenshot...');
        await page.screenshot({
            path: path.join(SCREENSHOT_DIR, 'fixed-theme-homepage.png'),
            fullPage: true
        });

        console.log('✅ Screenshot saved to:', path.join(SCREENSHOT_DIR, 'fixed-theme-homepage.png'));

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        console.log('\n🏁 Closing browser...');
        await browser.close();
    }
}

captureFixedTheme().catch(console.error);

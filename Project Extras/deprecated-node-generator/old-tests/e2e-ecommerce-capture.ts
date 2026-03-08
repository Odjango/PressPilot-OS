/**
 * E2E Ecommerce Capture - Phase 4 Visual Verification
 *
 * Generates branded ecommerce themes with Modern and Bold brand modes
 * and captures ACTUAL WORDPRESS HOMEPAGE screenshots.
 *
 * REQUIREMENTS:
 * - Docker containers running (docker compose up -d)
 * - WordPress at localhost:8089
 *
 * Output: tests/artifacts/Gallery/home-ecommerce-{mode}-v3.jpg
 */

// Load environment variables from .env.local BEFORE other imports
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
console.log(`[ENV] UNSPLASH_ACCESS_KEY loaded: ${process.env.UNSPLASH_ACCESS_KEY ? 'YES' : 'NO'}`);

import { chromium, Page } from 'playwright';
import { execSync } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
// DEPRECATED: Old Node.js generator removed.
// import { generateTheme } from '../src/generator';
import { buildSaaSInputFromStudioInput, StudioFormInput } from '../lib/presspilot/studioAdapter';
import { transformSaaSInputToGeneratorData } from '../lib/presspilot/dataTransformer';
import type { TT4PaletteId, TT4HeroLayout, TT4BrandStyle } from '../lib/theme/palettes';

const WP_URL = 'http://localhost:8089';
const WP_CONTAINER = 'presspilot-os-wordpress-1';
const DB_CONTAINER = 'presspilot-os-db-1';
const GALLERY_DIR = path.join(process.cwd(), 'tests/artifacts/Gallery');

// ============================================================================
// ECOMMERCE SCENARIOS
// ============================================================================

interface Scenario {
    slug: string;
    name: string;
    category: string;
    brief: string;
    brandStyle: TT4BrandStyle;
    heroLayout: TT4HeroLayout;
    paletteId: TT4PaletteId;
    outputFile: string;
}

const ECOMMERCE_SCENARIOS: Scenario[] = [
    {
        slug: 'ecommerce-modern-v3',
        name: 'Urban Threads Clothing',
        category: 'ecommerce',
        brief: 'Urban Threads is a contemporary fashion retailer offering curated streetwear, sustainable basics, and limited-edition collaborations. Premium quality, free shipping over $50.',
        brandStyle: 'modern',
        heroLayout: 'fullBleed',
        paletteId: 'ecommerce-bold',
        outputFile: 'home-ecommerce-modern-v3.jpg'
    },
    {
        slug: 'ecommerce-bold-v3',
        name: 'Flash Deals Outlet',
        category: 'ecommerce',
        brief: 'Flash Deals Outlet is your one-stop shop for unbeatable discounts on electronics, home goods, and fashion. New deals daily, prices you won\'t find anywhere else.',
        brandStyle: 'bold',
        heroLayout: 'fullBleed',
        paletteId: 'ecommerce-bold',
        outputFile: 'home-ecommerce-bold-v3.jpg'
    }
];

// ============================================================================
// WORDPRESS HELPERS
// ============================================================================

function copyThemeToWordPress(themeDir: string, themeSlug: string): boolean {
    try {
        const wpThemesPath = '/var/www/html/wp-content/themes';

        // Remove existing theme if present
        try {
            execSync(`docker exec ${WP_CONTAINER} rm -rf ${wpThemesPath}/${themeSlug}`, { stdio: 'pipe' });
        } catch { /* Ignore if doesn't exist */ }

        // Copy the theme directory
        execSync(`docker cp "${themeDir}" "${WP_CONTAINER}:${wpThemesPath}/"`, { stdio: 'pipe' });

        // Fix permissions
        execSync(`docker exec ${WP_CONTAINER} chown -R www-data:www-data ${wpThemesPath}/${themeSlug}`, { stdio: 'pipe' });

        return true;
    } catch (error) {
        console.error('  ✗ Theme copy failed:', error);
        return false;
    }
}

function activateThemeViaDatabase(themeSlug: string): boolean {
    try {
        const sql = `UPDATE wp_options SET option_value='${themeSlug}' WHERE option_name IN ('template', 'stylesheet');`;
        execSync(`docker exec ${DB_CONTAINER} mysql -uwordpress -pwordpress wordpress -e "${sql}"`, {
            stdio: 'pipe'
        });
        return true;
    } catch (error) {
        console.error('  ✗ Theme activation failed:', error);
        return false;
    }
}

function clearWordPressCache(): boolean {
    try {
        // Clear all transients (temporary cached data)
        const clearTransients = `DELETE FROM wp_options WHERE option_name LIKE '%_transient_%';`;
        execSync(`docker exec ${DB_CONTAINER} mysql -uwordpress -pwordpress wordpress -e "${clearTransients}"`, {
            stdio: 'pipe'
        });

        // Clear theme mods for any old themes (forces fresh load)
        const clearThemeMods = `DELETE FROM wp_options WHERE option_name LIKE 'theme_mods_%' AND option_name NOT LIKE 'theme_mods_ecommerce%';`;
        execSync(`docker exec ${DB_CONTAINER} mysql -uwordpress -pwordpress wordpress -e "${clearThemeMods}"`, {
            stdio: 'pipe'
        });

        return true;
    } catch (error) {
        console.error('  ✗ Cache clear failed:', error);
        return false;
    }
}

async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// THEME GENERATION
// ============================================================================

async function generateThemeForScenario(scenario: Scenario): Promise<{ themeDir: string; themeSlug: string } | null> {
    try {
        const input: StudioFormInput = {
            businessName: scenario.name,
            businessDescription: scenario.brief,
            businessCategory: scenario.category,
            slug: scenario.slug,
            heroTitle: scenario.name,
            selectedPaletteId: scenario.paletteId,
            heroLayout: scenario.heroLayout,
            brandStyle: scenario.brandStyle
        };

        const saasInput = buildSaaSInputFromStudioInput(input);
        const generatorData = transformSaaSInputToGeneratorData(saasInput);

        const result = await generateTheme({
            data: generatorData,
            slug: scenario.slug
        });

        const themeSlug = path.basename(result.themeDir);
        return { themeDir: result.themeDir, themeSlug };
    } catch (error) {
        console.error('  ✗ Theme generation failed:', error);
        return null;
    }
}

// ============================================================================
// SCREENSHOT CAPTURE
// ============================================================================

async function captureHomepage(page: Page, outputPath: string): Promise<boolean> {
    try {
        // Navigate to WordPress homepage
        await page.goto(WP_URL, { waitUntil: 'networkidle', timeout: 30000 });

        // Wait for content to settle
        await delay(2000);

        // Capture full-page screenshot
        await page.screenshot({
            path: outputPath,
            fullPage: true,
            type: 'jpeg',
            quality: 90
        });

        return true;
    } catch (error) {
        console.error('  ✗ Screenshot capture failed:', error);
        return false;
    }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  Ecommerce Gallery Capture - Phase 4 Visual Verification');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('Scenarios:');
    console.log('  1. Ecommerce + Modern (clean radii, product-focused)');
    console.log('  2. Ecommerce + Bold (sharp edges, high contrast CTAs)');
    console.log('');

    // Ensure gallery directory exists
    await fs.ensureDir(GALLERY_DIR);

    // Check Docker containers
    console.log('📡 Checking Docker containers...');
    try {
        execSync(`docker ps --filter "name=${WP_CONTAINER}" --format "{{.Status}}"`, { stdio: 'pipe' });
        console.log(`  ✓ ${WP_CONTAINER} is running`);
        execSync(`docker ps --filter "name=${DB_CONTAINER}" --format "{{.Status}}"`, { stdio: 'pipe' });
        console.log(`  ✓ ${DB_CONTAINER} is running`);
    } catch {
        console.error('  ✗ Docker containers not running. Run: docker compose up -d');
        process.exit(1);
    }

    // Launch browser
    console.log('\n🌐 Launching browser...');
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox']
    });

    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 }
    });

    const page = await context.newPage();

    let successCount = 0;
    const total = ECOMMERCE_SCENARIOS.length;

    console.log(`\n🎨 Processing ${total} ecommerce scenarios...\n`);

    for (let i = 0; i < ECOMMERCE_SCENARIOS.length; i++) {
        const scenario = ECOMMERCE_SCENARIOS[i];
        const prefix = `[${i + 1}/${total}]`;

        console.log(`${prefix} ${scenario.name}`);
        console.log(`      Brand Mode: ${scenario.brandStyle}`);
        console.log(`      Hero Layout: ${scenario.heroLayout}`);

        try {
            // Step 1: Generate theme
            console.log('      → Generating theme...');
            const themeInfo = await generateThemeForScenario(scenario);
            if (!themeInfo) {
                throw new Error('Theme generation failed');
            }
            console.log(`        Generated: ${themeInfo.themeSlug}`);

            // Step 2: Copy to WordPress
            console.log('      → Installing in WordPress...');
            const copied = copyThemeToWordPress(themeInfo.themeDir, themeInfo.themeSlug);
            if (!copied) {
                throw new Error('Theme copy failed');
            }

            // Step 3: Activate via database
            console.log('      → Activating theme...');
            const activated = activateThemeViaDatabase(themeInfo.themeSlug);
            if (!activated) {
                throw new Error('Theme activation failed');
            }

            // Step 3.5: Clear WordPress caches to ensure fresh content
            console.log('      → Clearing WordPress caches...');
            clearWordPressCache();

            // Longer delay for WordPress to fully recognize the theme
            await delay(3000);

            // Step 4: Capture screenshot
            console.log('      → Capturing homepage...');
            const outputPath = path.join(GALLERY_DIR, scenario.outputFile);
            const captured = await captureHomepage(page, outputPath);
            if (!captured) {
                throw new Error('Screenshot capture failed');
            }

            successCount++;
            console.log(`      ✅ Saved: ${scenario.outputFile}\n`);

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`      ❌ Error: ${errorMsg}\n`);
        }
    }

    await browser.close();

    // ======== RESULTS REPORT ========
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  ECOMMERCE GALLERY COMPLETE');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`✅ ${successCount}/${total} WordPress homepages captured`);
    console.log(`\n📁 Gallery saved to: ${GALLERY_DIR}\n`);

    // List files
    try {
        const files = await fs.readdir(GALLERY_DIR);
        const ecomFiles = files.filter(f => f.includes('ecommerce') && (f.endsWith('.png') || f.endsWith('.jpg'))).sort();
        console.log('Ecommerce files:');
        for (const file of ecomFiles) {
            const stats = await fs.stat(path.join(GALLERY_DIR, file));
            const sizeKb = (stats.size / 1024).toFixed(0);
            console.log(`  • ${file} (${sizeKb} KB)`);
        }
    } catch (err) {
        console.log('  (Could not list files)');
    }

    return successCount === total ? 0 : 1;
}

main().then(code => process.exit(code)).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

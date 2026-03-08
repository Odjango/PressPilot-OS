/**
 * E2E Gallery Capture - All Business Verticals
 *
 * Generates branded WordPress themes for every supported vertical and captures
 * ACTUAL WORDPRESS HOMEPAGE screenshots.
 *
 * This script:
 * 1. Generates themes via the generator
 * 2. Copies them to WordPress via docker cp
 * 3. Activates via database update (bypasses login issues)
 * 4. Captures homepage via Playwright
 *
 * REQUIREMENTS:
 * - Docker containers running (docker compose up -d)
 * - WordPress at localhost:8089
 *
 * Output: Tests/Artifacts/Gallery/home-{vertical}.png
 */

import { chromium, Browser, Page } from 'playwright';
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
const GALLERY_DIR = path.join(process.cwd(), 'Tests/Artifacts/Gallery');

// ============================================================================
// SCENARIO DEFINITIONS
// ============================================================================

interface Scenario {
    slug: string;
    name: string;
    category: string;
    brief: string;
    brandStyle?: TT4BrandStyle;
    heroLayout: TT4HeroLayout;
    paletteId?: TT4PaletteId;
    outputFile: string;
}

const SCENARIOS: Scenario[] = [
    {
        slug: 'gallery-restaurant-playful',
        name: 'Bella Cucina Trattoria',
        category: 'restaurant_cafe',
        brief: 'Bella Cucina is a warm, family-owned Italian trattoria serving homemade pasta, wood-fired pizzas, and traditional recipes passed down through generations.',
        brandStyle: 'playful',
        heroLayout: 'fullBleed',
        paletteId: 'restaurant-soft',
        outputFile: 'home-restaurant-playful-v2.jpg'
    },
    {
        slug: 'gallery-restaurant-modern',
        name: 'Frost & Ember Steakhouse',
        category: 'restaurant_cafe',
        brief: 'Frost & Ember is an upscale steakhouse featuring dry-aged prime cuts, craft cocktails, and an award-winning wine list.',
        brandStyle: 'modern',
        heroLayout: 'fullBleed',
        paletteId: 'restaurant-soft',
        outputFile: 'home-restaurant-modern-v2.jpg'
    },
    {
        slug: 'gallery-ecommerce',
        name: 'Urban Threads Clothing',
        category: 'ecommerce',
        brief: 'Urban Threads is a contemporary fashion retailer offering curated streetwear, sustainable basics, and limited-edition collaborations.',
        heroLayout: 'split',
        paletteId: 'ecommerce-bold',
        outputFile: 'home-ecommerce.png'
    },
    {
        slug: 'gallery-saas',
        name: 'CloudSync Analytics',
        category: 'saas_product',
        brief: 'CloudSync Analytics is a real-time data platform that helps businesses track KPIs, visualize metrics, and make data-driven decisions.',
        heroLayout: 'fullWidth',
        paletteId: 'saas-bright',
        outputFile: 'home-saas.png'
    },
    {
        slug: 'gallery-portfolio',
        name: 'Maya Chen Photography',
        category: 'service',
        brief: 'Maya Chen is an award-winning portrait and wedding photographer based in San Francisco. Available for destination shoots worldwide.',
        heroLayout: 'minimal',
        paletteId: 'saas-bright',
        outputFile: 'home-portfolio.png'
    },
    {
        slug: 'gallery-fitness',
        name: 'Peak Performance Fitness',
        category: 'service',
        brief: 'Peak Performance is a boutique gym offering personalized training, group fitness classes, and nutrition coaching.',
        heroLayout: 'fullBleed',
        paletteId: 'local-biz-soft',
        outputFile: 'home-fitness.png'
    },
    {
        slug: 'gallery-professional',
        name: 'Greenfield Law Partners',
        category: 'service',
        brief: 'Greenfield Law Partners is a trusted business law firm specializing in corporate transactions, intellectual property, and employment law.',
        heroLayout: 'split',
        paletteId: 'local-biz-soft',
        outputFile: 'home-professional.png'
    },
    {
        slug: 'gallery-local-service',
        name: 'Precision Plumbing Co.',
        category: 'local_store',
        brief: 'Precision Plumbing provides residential and commercial plumbing services. 24/7 emergency repairs, transparent pricing, 100% satisfaction guaranteed.',
        heroLayout: 'minimal',
        paletteId: 'local-biz-soft',
        outputFile: 'home-local-service.png'
    }
];

// ============================================================================
// WORDPRESS HELPERS (Docker + Database)
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
        // Update both template and stylesheet options
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

        // Wait a moment for any dynamic content
        await delay(2000);

        // Capture full-page screenshot
        await page.screenshot({
            path: outputPath,
            fullPage: true
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

interface CaptureResult {
    scenario: Scenario;
    success: boolean;
    screenshotPath: string | null;
    error?: string;
}

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  Visual Gallery Generation - WordPress Homepages');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('Generates real WordPress homepage screenshots by:');
    console.log('  1. Generating themes via PressPilot generator');
    console.log('  2. Installing themes via docker cp');
    console.log('  3. Activating themes via database');
    console.log('  4. Capturing homepage with Playwright');
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

    const results: CaptureResult[] = [];
    const total = SCENARIOS.length;

    console.log(`\n🎨 Processing ${total} scenarios...\n`);

    for (let i = 0; i < SCENARIOS.length; i++) {
        const scenario = SCENARIOS[i];
        const prefix = `[${i + 1}/${total}]`;

        console.log(`${prefix} ${scenario.name}`);
        console.log(`      Category: ${scenario.category}${scenario.brandStyle ? ` (${scenario.brandStyle})` : ''}`);
        console.log(`      Hero: ${scenario.heroLayout}`);

        const result: CaptureResult = {
            scenario,
            success: false,
            screenshotPath: null
        };

        try {
            // Step 1: Generate theme
            console.log('      → Generating theme...');
            const themeInfo = await generateThemeForScenario(scenario);
            if (!themeInfo) {
                throw new Error('Theme generation failed');
            }

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

            // Small delay for WordPress to recognize the theme
            await delay(1000);

            // Step 4: Capture screenshot
            console.log('      → Capturing homepage...');
            const outputPath = path.join(GALLERY_DIR, scenario.outputFile);
            const captured = await captureHomepage(page, outputPath);
            if (!captured) {
                throw new Error('Screenshot capture failed');
            }

            result.success = true;
            result.screenshotPath = outputPath;
            console.log(`      ✅ Saved: ${scenario.outputFile}\n`);

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            result.error = errorMsg;
            console.error(`      ❌ Error: ${errorMsg}\n`);
        }

        results.push(result);
    }

    await browser.close();

    // ======== RESULTS REPORT ========
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  GALLERY COMPLETE');
    console.log('═══════════════════════════════════════════════════════════\n');

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`✅ ${successCount}/${total} WordPress homepages captured`);
    if (failureCount > 0) {
        console.log(`❌ ${failureCount}/${total} failed`);
    }

    console.log(`\n📁 Gallery saved to: ${GALLERY_DIR}\n`);

    console.log('Files:');
    for (const result of results) {
        const status = result.success ? '✅' : '❌';
        console.log(`  ${status} ${result.scenario.outputFile}`);
        if (result.error) {
            console.log(`      └─ ${result.error}`);
        }
    }

    // List actual files
    console.log('\n───────────────────────────────────────────────────────────');
    console.log('  FILES IN GALLERY');
    console.log('───────────────────────────────────────────────────────────');

    try {
        const files = await fs.readdir(GALLERY_DIR);
        const imageFiles = files.filter(f => f.endsWith('.png') || f.endsWith('.jpg')).sort();
        for (const file of imageFiles) {
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

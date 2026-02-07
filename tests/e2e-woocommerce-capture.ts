/**
 * E2E WooCommerce Capture - Visual Verification for Shop & Product Pages
 *
 * Generates branded ecommerce themes with WooCommerce templates
 * and captures screenshots of homepage, shop archive, and product pages.
 *
 * REQUIREMENTS:
 * - Docker containers running (docker compose up -d)
 * - WordPress at localhost:8089
 *
 * Output:
 * - tests/artifacts/Gallery/home-ecommerce-modern-v3.jpg
 * - tests/artifacts/Gallery/shop-ecommerce-modern-v3.jpg
 * - tests/artifacts/Gallery/product-ecommerce-modern-v3.jpg
 */

// Load environment variables from .env.local BEFORE other imports
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
console.log(`[ENV] UNSPLASH_ACCESS_KEY loaded: ${process.env.UNSPLASH_ACCESS_KEY ? 'YES' : 'NO'}`);

import { chromium, Page } from 'playwright';
import { execSync } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import { generateTheme } from '../src/generator';
import { buildSaaSInputFromStudioInput, StudioFormInput } from '../lib/presspilot/studioAdapter';
import { transformSaaSInputToGeneratorData } from '../lib/presspilot/dataTransformer';
import type { TT4PaletteId, TT4HeroLayout, TT4BrandStyle } from '../lib/theme/palettes';

const WP_URL = 'http://localhost:8089';
const WP_CONTAINER = 'presspilot-os-wordpress-1';
const CLI_CONTAINER = 'presspilot-os-cli';
const DB_CONTAINER = 'presspilot-os-db-1';
const GALLERY_DIR = path.join(process.cwd(), 'tests/artifacts/Gallery');

// ============================================================================
// WOOCOMMERCE SCENARIOS
// ============================================================================

interface Scenario {
    slug: string;
    name: string;
    category: string;
    brief: string;
    brandStyle: TT4BrandStyle;
    heroLayout: TT4HeroLayout;
    paletteId: TT4PaletteId;
    outputPrefix: string;
}

const WOOCOMMERCE_SCENARIOS: Scenario[] = [
    {
        slug: 'ecommerce-modern-v3',
        name: 'Urban Threads Clothing',
        category: 'ecommerce',
        brief: 'Urban Threads is a contemporary fashion retailer offering curated streetwear, sustainable basics, and limited-edition collaborations. Premium quality, free shipping over $50.',
        brandStyle: 'modern',
        heroLayout: 'fullBleed',
        paletteId: 'ecommerce-bold',
        outputPrefix: 'ecommerce-modern-v3'
    }
];

// Sample products to create
const SAMPLE_PRODUCTS = [
    { name: 'Classic T-Shirt', price: '29.99', description: 'Premium cotton t-shirt with a relaxed fit.' },
    { name: 'Denim Jacket', price: '89.99', description: 'Vintage-inspired denim jacket with brass buttons.' },
    { name: 'Running Shoes', price: '119.99', description: 'Lightweight performance shoes for everyday comfort.' },
    { name: 'Canvas Backpack', price: '49.99', description: 'Durable canvas backpack with laptop compartment.' }
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

function installWooCommerce(): boolean {
    try {
        console.log('      → Installing WooCommerce plugin...');

        // Check if WooCommerce is already installed (use CLI container with WP-CLI)
        try {
            execSync(
                `docker exec ${CLI_CONTAINER} wp plugin is-installed woocommerce --allow-root 2>&1`,
                { stdio: 'pipe' }
            );
        } catch {
            // Plugin not installed, install it
            execSync(
                `docker exec ${CLI_CONTAINER} wp plugin install woocommerce --activate --allow-root`,
                { stdio: 'pipe', timeout: 120000 }
            );
            console.log('        WooCommerce installed and activated');
            return true;
        }

        // Plugin is installed, just activate it
        execSync(
            `docker exec ${CLI_CONTAINER} wp plugin activate woocommerce --allow-root`,
            { stdio: 'pipe' }
        );
        console.log('        WooCommerce activated');
        return true;
    } catch (error) {
        console.error('  ✗ WooCommerce installation failed:', error);
        return false;
    }
}

function createSampleProducts(): boolean {
    try {
        console.log('      → Creating sample products...');

        for (const product of SAMPLE_PRODUCTS) {
            try {
                // Check if product already exists (use CLI container)
                const checkCmd = `docker exec ${CLI_CONTAINER} wp post list --post_type=product --name="${product.name.toLowerCase().replace(/ /g, '-')}" --format=count --allow-root`;
                const count = execSync(checkCmd, { stdio: 'pipe' }).toString().trim();

                if (count === '0') {
                    // Create product using WP-CLI wc command
                    const createCmd = `docker exec ${CLI_CONTAINER} wp wc product create --name="${product.name}" --type=simple --regular_price=${product.price} --description="${product.description}" --status=publish --allow-root --user=1`;
                    execSync(createCmd, { stdio: 'pipe' });
                    console.log(`        Created: ${product.name}`);
                } else {
                    console.log(`        Exists: ${product.name}`);
                }
            } catch (err) {
                // Try alternative method using wp post create
                try {
                    const altCmd = `docker exec ${CLI_CONTAINER} wp post create --post_type=product --post_title="${product.name}" --post_status=publish --allow-root`;
                    execSync(altCmd, { stdio: 'pipe' });
                    console.log(`        Created (basic): ${product.name}`);
                } catch {
                    console.warn(`        Skipped: ${product.name} (creation failed)`);
                }
            }
        }

        return true;
    } catch (error) {
        console.error('  ✗ Product creation failed:', error);
        return false;
    }
}

function setupWooCommercePages(): boolean {
    try {
        console.log('      → Setting up WooCommerce pages...');

        // Run WooCommerce page installation (use CLI container)
        execSync(
            `docker exec ${CLI_CONTAINER} wp wc tool run install_pages --allow-root --user=1`,
            { stdio: 'pipe' }
        );

        console.log('        WooCommerce pages configured');
        return true;
    } catch (error) {
        // Non-fatal - pages may already exist
        console.log('        WooCommerce pages may already exist');
        return true;
    }
}

function setupPermalinks(): boolean {
    try {
        console.log('      → Setting up permalinks...');

        // Set permalink structure to "post name" for pretty URLs
        execSync(
            `docker exec ${CLI_CONTAINER} wp rewrite structure '/%postname%/' --allow-root`,
            { stdio: 'pipe' }
        );

        // Write .htaccess rules directly (WP-CLI can't always write to .htaccess)
        const htaccessContent = `# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
RewriteBase /
RewriteRule ^index\\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress`;

        execSync(
            `docker exec ${WP_CONTAINER} bash -c 'cat > /var/www/html/.htaccess << "HTEOF"
${htaccessContent}
HTEOF'`,
            { stdio: 'pipe' }
        );

        console.log('        Permalinks configured');
        return true;
    } catch (error) {
        console.error('  ✗ Permalink setup failed:', error);
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

async function capturePageScreenshot(page: Page, url: string, outputPath: string): Promise<boolean> {
    try {
        // Navigate to URL
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

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
        console.error(`  ✗ Screenshot capture failed for ${url}:`, error);
        return false;
    }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  WooCommerce Gallery Capture - Shop & Product Pages');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('Pages to capture:');
    console.log('  1. Homepage (with Shop link + cart icon)');
    console.log('  2. Shop Archive (archive-product.html)');
    console.log('  3. Single Product (single-product.html)');
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

    // Setup WooCommerce
    console.log('\n🛒 Setting up WooCommerce...');
    const wooInstalled = installWooCommerce();
    if (!wooInstalled) {
        console.error('  ✗ Failed to install WooCommerce. Continuing without products...');
    } else {
        setupWooCommercePages();
        setupPermalinks();
        createSampleProducts();
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
    const total = WOOCOMMERCE_SCENARIOS.length * 3; // 3 pages per scenario

    console.log(`\n🎨 Processing ${WOOCOMMERCE_SCENARIOS.length} scenario(s)...\n`);

    for (let i = 0; i < WOOCOMMERCE_SCENARIOS.length; i++) {
        const scenario = WOOCOMMERCE_SCENARIOS[i];
        const prefix = `[${i + 1}/${WOOCOMMERCE_SCENARIOS.length}]`;

        console.log(`${prefix} ${scenario.name}`);
        console.log(`      Brand Mode: ${scenario.brandStyle}`);

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

            // Step 4: Clear WordPress caches
            console.log('      → Clearing WordPress caches...');
            clearWordPressCache();

            // Longer delay for WordPress to fully recognize the theme
            await delay(3000);

            // Step 5: Capture screenshots
            const pagesToCapture = [
                { url: WP_URL, output: `home-${scenario.outputPrefix}.jpg`, label: 'Homepage' },
                { url: `${WP_URL}/shop`, output: `shop-${scenario.outputPrefix}.jpg`, label: 'Shop Archive' },
                { url: `${WP_URL}/?post_type=product`, output: `product-${scenario.outputPrefix}.jpg`, label: 'Product Page' }
            ];

            for (const pageConfig of pagesToCapture) {
                console.log(`      → Capturing ${pageConfig.label}...`);
                const outputPath = path.join(GALLERY_DIR, pageConfig.output);
                const captured = await capturePageScreenshot(page, pageConfig.url, outputPath);
                if (captured) {
                    successCount++;
                    console.log(`        ✅ Saved: ${pageConfig.output}`);
                } else {
                    console.log(`        ❌ Failed: ${pageConfig.output}`);
                }
            }

            console.log('');

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`      ❌ Error: ${errorMsg}\n`);
        }
    }

    await browser.close();

    // ======== RESULTS REPORT ========
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  WOOCOMMERCE GALLERY COMPLETE');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log(`✅ ${successCount}/${total} pages captured`);
    console.log(`\n📁 Gallery saved to: ${GALLERY_DIR}\n`);

    // List files
    try {
        const files = await fs.readdir(GALLERY_DIR);
        const wooFiles = files.filter(f =>
            (f.includes('ecommerce') || f.includes('shop') || f.includes('product')) &&
            (f.endsWith('.png') || f.endsWith('.jpg'))
        ).sort();
        console.log('WooCommerce screenshots:');
        for (const file of wooFiles) {
            const stats = await fs.stat(path.join(GALLERY_DIR, file));
            const sizeKb = (stats.size / 1024).toFixed(0);
            console.log(`  • ${file} (${sizeKb} KB)`);
        }
    } catch (err) {
        console.log('  (Could not list files)');
    }

    return successCount >= 1 ? 0 : 1;
}

main().then(code => process.exit(code)).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});

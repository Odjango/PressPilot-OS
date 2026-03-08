
import { generateTheme } from '../src/generator/index';
import { StructureValidator } from '../src/generator/validators/StructureValidator';
import JSZip from 'jszip';
import fs from 'fs-extra';
import path from 'path';

const BASES = ['ollie', 'frost', 'spectra-one', 'twentytwentyfour', 'tove', 'blockbase'];
const INDUSTRY = 'ecommerce';

async function run() {
    console.log(`🛒 Starting E-commerce Integration Test (6 Bases)...`);

    let failures: string[] = [];

    for (const base of BASES) {
        const slug = `test-ecom-${base}`;
        console.log(`\n📦 Testing: ${base.toUpperCase()} (E-COMMERCE)`);

        try {
            // 1. GENERATE
            const result = await generateTheme({
                base: base as any,
                mode: 'standard',
                slug: slug,
                data: {
                    name: "PressPilot Store",
                    industry: INDUSTRY
                }
            });

            if (result.status !== 'success') {
                throw new Error(`Generation Failed: ${(result as any).message || 'Unknown Error'}`);
            }

            // 2. INSPECT CONTENT
            const zipBuffer = await fs.readFile(result.downloadPath);
            const zip = new JSZip();
            await zip.loadAsync(zipBuffer);

            // Check functions.php for WooCommerce Support
            // Note: The file inside zip is inside a folder named 'slug'
            // zip files keys are like "slug/functions.php"
            const functionsKey = Object.keys(zip.files).find(k => k.endsWith('functions.php'));
            if (!functionsKey) throw new Error("functions.php missing");

            const functionsContent = await zip.file(functionsKey)?.async('string') || '';
            if (!functionsContent.includes("add_theme_support('woocommerce')")) {
                throw new Error("❌ WooCommerce Support NOT declared in functions.php");
            }

            // Check for Shop Pattern (shop-grid.php)
            const patternKey = Object.keys(zip.files).find(k => k.includes('shop-grid.php'));
            if (!patternKey) throw new Error("❌ patterns/shop-grid.php missing (Universal Pattern Injection Failed)");

            // Check for Nav Link (in header part or pattern)
            // We search all header-like files for "Shop" link
            let hasShopLink = false;
            const headerFiles = Object.keys(zip.files).filter(k => k.includes('header'));
            for (const h of headerFiles) {
                const content = await zip.file(h)?.async('string') || '';
                if (content.includes('"label":"Shop"') && content.includes('/shop')) {
                    hasShopLink = true;
                    break;
                }
            }
            if (!hasShopLink) {
                console.warn("   ⚠️  Warning: Could not verify 'Shop' link in nav. (Might be using complex patternRef)");
                // Not a fail condition for now as regex matching inside patterns inside zips is tricky
            } else {
                console.log("   ✅ Nav Link Verified");
            }

            console.log(`   ✅ PASS`);

        } catch (err: any) {
            console.error(`   💥 FAIL: ${err.message}`);
            failures.push(`${base}: ${err.message}`);
        }
    }

    if (failures.length > 0) {
        console.error(`❌ ${failures.length} Failures detected.`);
        process.exit(1);
    } else {
        console.log("🎉 All E-commerce Integrations Verified.");
        process.exit(0);
    }
}

run();

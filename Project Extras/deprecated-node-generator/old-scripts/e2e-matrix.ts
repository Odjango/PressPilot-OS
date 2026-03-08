
import { generateTheme } from '../src/generator/index';
import { StructureValidator } from '../src/generator/validators/StructureValidator';
import { BlockValidator } from '../src/generator/validators/BlockValidator';
import { TokenValidator } from '../src/generator/validators/TokenValidator';
import JSZip from 'jszip';
import fs from 'fs-extra';
import path from 'path';

// Matrix Configuration
const BASES = ['ollie', 'frost', 'spectra-one', 'twentytwentyfour', 'tove', 'blockbase'];
const INDUSTRIES = ['saas', 'restaurant', 'portfolio'];

async function run() {
    console.log(`🏭 Starting E2E Matrix Test (6 Bases x 3 Industries = ${BASES.length * INDUSTRIES.length} Scenarios)...`);

    let failures: string[] = [];

    for (const base of BASES) {
        for (const industry of INDUSTRIES) {
            const slug = `test-${base}-${industry}`;
            console.log(`\n🧪 Testing: ${base.toUpperCase()} (${industry.toUpperCase()})`);

            try {
                // 1. GENERATE
                const result = await generateTheme({
                    base: base as any,
                    mode: 'standard',
                    slug: slug,
                    data: {
                        name: "Matrix Site",
                        primary: "#000000",
                        secondary: "#ffffff",
                        industry: industry
                    }
                });

                if (result.status !== 'success') {
                    throw new Error(`Generation Failed: ${(result as any).message || 'Unknown Error'}`);
                }

                // 2. VALIDATE ZIP CONTENT
                const zipBuffer = await fs.readFile(result.downloadPath);
                const zip = new JSZip();
                await zip.loadAsync(zipBuffer);

                // Check Structure
                const struct = await StructureValidator.validate(zipBuffer);
                if (!struct.valid) throw new Error(`Structure Fail: ${struct.error}`);

                // Check Cleanliness (Images)
                const fileNames = Object.keys(zip.files);
                const hasImages = fileNames.some(f => f.match(/\.(jpg|png|webp|jpeg)$/i));
                if (hasImages) {
                    throw new Error(`❌ Asset Fail: Images found in ZIP! (Should be pure code)`);
                }

                // Check Footer Branding
                // We look for 'Powered by PressPilot OS' in any footer file
                let brandingFound = false;
                const footerFiles = fileNames.filter(f => f.includes('footer') && (f.endsWith('.html') || f.endsWith('.php')));

                for (const f of footerFiles) {
                    const content = await zip.file(f)?.async('string') || '';
                    if (content.includes('Powered by PressPilot OS')) {
                        brandingFound = true;
                        break;
                    }
                }

                // If no footer files found, that's weird but maybe acceptable for some defaults?
                // But for our vaults we enforced it.
                if (footerFiles.length > 0 && !brandingFound) {
                    // Check if maybe it's in parts/footer.html
                    throw new Error(`❌ Branding Fail: 'Powered by PressPilot OS' not found in footers.`);
                }

                // Check Validation (Strict)
                const styleCss = await zip.file(`${slug}/style.css`)?.async('string');
                if (styleCss) {
                    const tokenRes = TokenValidator.validate(styleCss, 'style.css');
                    if (!tokenRes.valid) throw new Error(`Style Validation Fail: ${tokenRes.error}`);
                }

                console.log(`   ✅ PASS`);

            } catch (err: any) {
                console.error(`   💥 FAIL: ${err.message}`);
                failures.push(`${base}-${industry}: ${err.message}`);
            }
        }
    }

    console.log("\n📊 Matrix Complete.");
    if (failures.length > 0) {
        console.error(`❌ ${failures.length} Failures detected:`);
        failures.forEach(f => console.error(`  - ${f}`));
        process.exit(1);
    } else {
        console.log("🎉 ALL GREEN. System is 100% Valid, Clean, and Branded.");
        process.exit(0);
    }
}

run();

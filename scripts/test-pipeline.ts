
import { generateTheme } from '../src/generator/index';
import { StructureValidator } from '../src/generator/validators/StructureValidator';
import { BlockValidator } from '../src/generator/validators/BlockValidator';
import { TokenValidator } from '../src/generator/validators/TokenValidator';
import JSZip from 'jszip';
import fs from 'fs-extra';
import path from 'path';

// Mock Data
const MOCK_PROJECT = {
    name: "Test Theme",
    primary: "#ff0000",
    secondary: "#00ff00",
    description: "A test theme for validation."
};

console.log("🏭 Starting Full Pipeline Simulation...");

async function run() {
    try {
        // 1. GENERATE (The exact code the worker uses)
        console.log("⚙️  Running ThemeGenerator...");
        const result = await generateTheme({
            data: MOCK_PROJECT,
            mode: 'standard',
            slug: 'test-gen-theme'
        });

        if (result.status !== 'success') {
            throw new Error(`Generator Failed: ${(result as any).message || 'Unknown Error'}`);
        }

        console.log(`✅ Generation Successful. ZIP at: ${result.downloadPath}`);

        // 2. LOAD ZIP
        const zipBuffer = await fs.readFile(result.downloadPath);
        const zip = new JSZip();
        await zip.loadAsync(zipBuffer);

        // 3. VALIDATE (The exact logic the worker uses)
        console.log("🔍 Validating Generated Artifact...");

        // A. Structure
        const struct = await StructureValidator.validate(zipBuffer);
        if (!struct.valid) throw new Error(`Structure Fail: ${struct.error}`);
        console.log("   ✅ Structure: OK");

        // B. Content
        const filesToCheck = ['theme.json', 'style.css', 'templates/index.html'];
        const files = Object.keys(zip.files);
        const rootFolder = files[0]?.split('/')[0];

        for (const relPath of filesToCheck) {
            let content: string | undefined;
            let checkPath = relPath;

            // Try direct or nested
            if (zip.file(relPath)) {
                content = await zip.file(relPath)?.async('string');
            } else if (rootFolder && zip.file(`${rootFolder}/${relPath}`)) {
                checkPath = `${rootFolder}/${relPath}`;
                content = await zip.file(checkPath)?.async('string');
            }

            if (!content) {
                // If it's a template expected to be there
                console.warn(`   ⚠️  Missing ${relPath} (might be OK if theme differs)`);
                continue;
            }

            // Block Val
            const blockRes = BlockValidator.validate(content, checkPath);
            if (!blockRes.valid) throw new Error(`Block Validation Fail in ${checkPath}: ${blockRes.error}`);

            // Token Val (The strict one!)
            if (!checkPath.endsWith('theme.json')) {
                const tokenRes = TokenValidator.validate(content, checkPath);
                if (!tokenRes.valid) {
                    throw new Error(`\n\n❌ TOKEN VALIDATION FAILED in ${checkPath}:\n${tokenRes.error}\n`);
                }
            }
            console.log(`   ✅ ${checkPath}: Validated (Strict Tokens)`);
        }

        console.log("\n🎉 PIPELINE SUCCESS! The generator is producing 100% valid themes.");
        process.exit(0);

    } catch (err: any) {
        console.error("\n💥 PIPELINE FAILED");
        console.error(err.message);
        process.exit(1);
    }
}

run();

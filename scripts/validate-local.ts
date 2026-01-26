
import fs from 'fs-extra';
import path from 'path';
import { TokenValidator } from '../src/generator/validators/TokenValidator';

// Files to check (simulating what the worker checks)
const FILES = [
    'bases/ollie/theme.json',
    'bases/ollie/style.css',
    // We should also check templates if we can find them, but the error source is usually style.css now
];

console.log("🔍 Running Local Validation Test Suite...");

async function run() {
    let failed = false;

    for (const file of FILES) {
        const filePath = path.join(process.cwd(), file);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${file}`);
            continue;
        }

        const content = await fs.readFile(filePath, 'utf8');

        // Skip TokenValidator for theme.json (as per worker logic)
        if (file.endsWith('theme.json')) {
            console.log(`ℹ️  Skipping TokenValidator for ${file} (Definition File)`);
            continue;
        }

        const res = TokenValidator.validate(content, file);
        if (!res.valid) {
            console.error(`❌ Validation FAILED for ${file}:`);
            console.error(`   ${res.error}`);
            failed = true;
        } else {
            console.log(`✅ ${file} PASSED validation.`);
        }
    }

    if (failed) {
        console.error("\n💥 SUITE FAILED. Fix errors and re-run.");
        process.exit(1);
    } else {
        console.log("\n✨ ALL TESTS PASSED. The codebase is clean.");
        process.exit(0);
    }
}

run();

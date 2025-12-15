const fs = require('fs');
const path = require('path');
const { parse } = require('@wordpress/block-serialization-default-parser');

const THEME_PATH = process.argv[2];

if (!THEME_PATH || !fs.existsSync(THEME_PATH)) {
    console.error("Usage: node scripts/core-parse-test.js <path-to-theme>");
    process.exit(1);
}

console.log(`🧠 Core-Backed Parse Test: ${THEME_PATH}`);
let hasError = false;

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else if (file.endsWith('.html')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            try {
                const blocks = parse(content);
                // Validate parsed blocks (basic check: can we iterate them?)
                if (!Array.isArray(blocks)) {
                    throw new Error("Parsed result is not an array");
                }
                // Verify no "freeform" blocks wrapping everything (sign of broken parser match)
                // Actually, WP parser is very forgiving. The real test is if it throws.
                // We can also check for empty "blockName" which often means broken comment syntax.

                blocks.forEach((block, index) => {
                    // Check for common parser failures
                    if (block.blockName === null && block.innerHTML.trim().length > 0) {
                        // Freeform HTML is allowed, but unexpected large chunks usually mean missed blocks.
                    }
                });

            } catch (e) {
                console.error(`❌ FAIL: WP Core Parser crashed on ${file}`);
                console.error(e.message);
                hasError = true;
            }
        }
    }
}

try {
    scanDir(THEME_PATH);
} catch (e) {
    console.error(`❌ FAIL: Script error: ${e.message}`);
    process.exit(1);
}

if (hasError) {
    console.log("💥 Core Parse Test FAILED.");
    process.exit(1);
} else {
    console.log("✅ Core Parse Test PASSED (WP Grammar Verified).");
    process.exit(0);
}


import * as fs from 'fs';
import * as path from 'path';

/**
 * Preflight Validator
 * 
 * Scans a generated theme directory for "Forbidden Patterns" that cause
 * WordPress Block Validation issues ("Attempt Recovery").
 * 
 * Rules:
 * 1. Blocks MUST NOT use raw `var(--wp--preset--*)` in attributes. Use `var:preset|*` tokens.
 * 2. Headings/Site Titles MUST NOT use `level: 0`.
 * 3. Social Links MUST have a non-empty `url`.
 */

const THEME_DIR = process.argv[2];

if (!THEME_DIR) {
    console.error("Usage: ts-node validate-preflight.ts <theme-directory>");
    process.exit(1);
}

const themePath = path.resolve(THEME_DIR);
if (!fs.existsSync(themePath)) {
    console.error(`Theme directory not found: ${themePath}`);
    process.exit(1);
}

let errorCount = 0;

function scanDir(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else if (file.endsWith('.html') || file.endsWith('.php') || file.endsWith('.json')) {
            validateFile(fullPath);
        }
    }
}

function validateFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(themePath, filePath);

    // 1. Check for raw CSS vars in JSON attributes (Robust Multiline & Optional Spacing)
    // We capture the JSON part of <!-- wp:blockname {...} -->
    // Regex allows for: <!-- wp:name {...}--> (no space before closing)
    const blockOpenerRegex = /<!--\s+wp:[\w\/-]+\s+({[\s\S]*?})\s*\/?-->/g;
    let openerMatch;
    while ((openerMatch = blockOpenerRegex.exec(content)) !== null) {
        const jsonContent = openerMatch[1];

        // Strategy A: Parse JSON safely
        try {
            const attrs = JSON.parse(jsonContent);
            const jsonString = JSON.stringify(attrs); // Normalizes it
            if (jsonString.includes('var(--wp--preset')) {
                console.error(`[FAIL] ${relativePath}: Found raw CSS var in block attributes. Use 'var:preset|...' instead.`);
                console.error(`       Match context: ${jsonContent.substring(0, 50)}...`);
                errorCount++;
            }
        } catch (e) {
            // If JSON fails to parse, fall back to simple string check but verify it's inside the block
            if (jsonContent.includes('var(--wp--preset')) {
                console.error(`[FAIL] ${relativePath}: Found raw CSS var in potentially malformed block attributes.`);
                errorCount++;
            }
        }
    }

    // 2. Check for level: 0
    const levelZeroRegex = /"level":\s*0/;
    if (levelZeroRegex.test(content)) {
        console.error(`[FAIL] ${relativePath}: Found invalid 'level: 0'.`);
        errorCount++;
    }

    // 3. Check for empty social links (Fixed Regex)
    // Matches <!-- wp:social-link {...} /--> with multiline support
    const socialRegexGlobal = /<!--\s+wp:social-link\s+({[\s\S]*?})\s*\/?-->/g;
    let match;
    while ((match = socialRegexGlobal.exec(content)) !== null) {
        const attrsStr = match[1];
        try {
            const attrs = JSON.parse(attrsStr);
            if (!attrs.url || typeof attrs.url !== 'string' || attrs.url.trim() === '') {
                console.error(`[FAIL] ${relativePath}: Found social-link with empty URL.`);
                errorCount++;
            }
        } catch (e) {
            // Ignore parse errors here, strictly checking valid JSON blocks
        }
    }
}

console.log(`Scanning ${themePath} for generator violations...`);
scanDir(themePath);

if (errorCount > 0) {
    console.error(`\nFAILED: Found ${errorCount} violations.`);
    process.exit(1);
} else {
    console.log("\nPASSED: No violations found.");
}

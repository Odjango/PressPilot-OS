import * as fs from 'fs';
import * as path from 'path';

const THEME_PATH = process.argv[2];

if (!THEME_PATH || !fs.existsSync(THEME_PATH)) {
    console.error("Usage: npx tsx scripts/validateGenerator.ts <path-to-theme>");
    process.exit(1);
}

console.log(`🔒 PressPilot Hard Gates Validation: ${THEME_PATH}`);

let hasError = false;

// --- Load Theme Context ---
let themeJson: any = {};
if (fs.existsSync(path.join(THEME_PATH, 'theme.json'))) {
    try {
        themeJson = JSON.parse(fs.readFileSync(path.join(THEME_PATH, 'theme.json'), 'utf8'));
    } catch (e) {
        console.error(`❌ FAIL: theme.json is invalid JSON.`);
        hasError = true;
    }
} else {
    console.error(`❌ FAIL: theme.json missing.`);
    hasError = true;
}

function getDefinedPresets(obj: any): string[] {
    if (!obj || !obj.settings) return [];
    let presets: string[] = [];
    const extract = (section: any, prefix: string) => {
        if (!section) return;
        section.forEach((p: any) => presets.push(`--wp--preset--${prefix}--${p.slug}`));
    };
    extract(obj.settings.color?.palette, "color");
    extract(obj.settings.typography?.fontSizes, "font-size");
    extract(obj.settings.typography?.fontFamilies, "font-family");
    extract(obj.settings.spacing?.spacingSizes, "spacing");
    return presets;
}
const VALID_PRESETS = getDefinedPresets(themeJson);

// --- Gate 1: Block Markup Structural Gate ---
function checkStructure(filename: string, content: string) {
    const stack: string[] = [];
    const lines = content.split('\n');
    const blockStartRegex = /<!-- wp:([a-z0-9\/-]+)(?:\s+{.*?})?\s+-->/g; // Open
    const blockEndRegex = /<!-- \/wp:([a-z0-9\/-]+)\s+-->/g;         // Close
    const selfClosingRegex = /<!-- wp:([a-z0-9\/-]+)(?:\s+{.*?})?\s+\/-->/g; // Self-closing

    // Simplified tokenizing: find all tags in order
    const tagRegex = /<!-- \/?wp:.*?(?:\/)?-->/g;
    let match;
    while ((match = tagRegex.exec(content)) !== null) {
        const tag = match[0];

        // 1. Check for TRUNC-01 (Gate 1.1)
        if (tag.includes('...')) {
            console.error(`❌ FAIL [G1]: Truncated artifact '...' found in ${filename}`);
            hasError = true;
        }

        if (tag.startsWith('<!-- wp:') && !tag.endsWith('/-->')) {
            // Opener
            const nameMatch = tag.match(/^<!-- wp:([a-z0-9\/-]+)/);
            if (nameMatch) stack.push(nameMatch[1]);
        } else if (tag.startsWith('<!-- /wp:')) {
            // Closer
            const nameMatch = tag.match(/^<!-- \/wp:([a-z0-9\/-]+)/);
            if (nameMatch) {
                const name = nameMatch[1];
                const last = stack.pop();
                if (last !== name) {
                    console.error(`❌ FAIL [G1]: Structure Mismatch in ${filename}. Expected closing ${last}, found ${name}.`);
                    hasError = true;
                }
            }
        }
        // Self-closing tags are ignored by stack
    }

    if (stack.length > 0) {
        console.error(`❌ FAIL [G1]: Unclosed blocks in ${filename}: ${stack.join(', ')}`);
        hasError = true;
    }
}

// --- Gate 2: Attributes JSON Gate ---
function checkAttributes(filename: string, content: string) {
    const blockRegex = /<!-- wp:[a-z0-9\/-]+\s+({.*?})\s+(?:\/)?-->/g;
    let match;
    while ((match = blockRegex.exec(content)) !== null) {
        const jsonStr = match[1];
        try {
            JSON.parse(jsonStr);
        } catch (e) {
            console.error(`❌ FAIL [G2]: Malformed JSON in ${filename}: ${jsonStr.substring(0, 50)}...`);
            hasError = true;
        }
        // Corruption Check
        if (jsonStr.includes('||||') || jsonStr.includes('undefined')) {
            console.error(`❌ FAIL [G2]: Corruption signature found in ${filename}`);
            hasError = true;
        }
    }
}

// --- Gate 3: PressPilot Hard Rules Gate ---
function checkRules(filename: string, content: string) {
    // REV-REF BAN
    if (content.includes('"ref":')) {
        console.error(`❌ FAIL [G3]: Forbidden "ref" attribute in ${filename}.`);
        hasError = true;
    }

    // PRESET EXISTENCE
    const presetRegex = /var\((--wp--preset--[a-z0-9-]+--[a-z0-9-]+)\)/g;
    let match;
    while ((match = presetRegex.exec(content)) !== null) {
        if (!VALID_PRESETS.includes(match[1])) {
            console.error(`❌ FAIL [G3]: Undefined Preset ${match[1]} in ${filename}`);
            hasError = true;
        }
    }
}

// --- Gate 4: Layout Discipline Gate ---
function checkLayout(filename: string, content: string) {
    if (filename.includes('front-page.html')) {
        // Enforce top-level grouping (heuristic)
        // We expect major sections to be wrapped in a group.
        // A simple check: if we have headings (h2) they should be inside a Group.
        // This is hard to strictly enforce without a DOM parser, but we can check for "naked" major elements.
    }

    // Deep Nesting Check (Gate 4.2)
    // Max Row/Group Depth > 6 is dangerous.
    // We count consecutive "<!-- wp:group" or "<!-- wp:columns" without closing.
    // This is valid stack logic.
    let depth = 0;
    let maxDepth = 0;
    const tokens = content.match(/<!-- \/?wp:(group|columns|row|stack|cover)/g) || [];
    for (const token of tokens) {
        if (!token.startsWith('<!-- /')) {
            depth++;
            if (depth > maxDepth) maxDepth = depth;
        } else {
            depth--;
        }
    }

    // Strict Limit: 8 levels deep is a "Hard Gate" failure for stability.
    if (maxDepth > 8) {
        console.error(`❌ FAIL [G4]: Excessive Nesting Depth (${maxDepth}) in ${filename}. Limit is 8.`);
        hasError = true;
    }

    // Media Constraint in Rows (Gate 4.3)
    // Check for "wp:row" containing "wp:image" without explicit width.
    // Heuristic: adjacent tokens.
}

// --- Main Scanner ---
function scanDir(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else if (file.endsWith('.html') || file.endsWith('.php')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            checkStructure(file, content);
            checkAttributes(file, content);
            checkRules(file, content);
            checkLayout(file, content);
        }
    }
}

scanDir(THEME_PATH);

// Gate 5: Diagnostics
console.log("\n--- Diagnostics [G5] ---");
console.log("ℹ️  Note: Database content shadows file templates. If you see changes not reflecting, clear the DB customization.");
console.log("ℹ️  Documentation: docs/pp-hard-gates.md");

if (hasError) {
    console.error("\n💥 Validation FAILED (Hard Gates).");
    process.exit(1);
} else {
    console.log("\n✅ Validation PASSED.");
    process.exit(0);
}

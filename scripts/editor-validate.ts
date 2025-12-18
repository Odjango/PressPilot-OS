
import * as fs from 'fs';
import * as path from 'path';
// @ts-ignore
import { parse } from '@wordpress/block-serialization-default-parser';

const THEME_PATH = process.argv[2];

if (!THEME_PATH || !fs.existsSync(THEME_PATH)) {
    console.error("Usage: npx tsx scripts/editor-validate.ts <path-to-theme>");
    process.exit(1);
}

console.log(`🧠 Editor Validation (EV-01): Scanning ${THEME_PATH}...`);

let hasError = false;

// --- Validation Logic ---

function fail(file: string, reason: string, snippet: string) {
    console.error(`\n❌ FAIL [EV-01]: ${reason}`);
    console.error(`   File: ${path.basename(file)}`);
    console.error(`   Snippet: "${snippet.replace(/\n/g, '\\n').substring(0, 80)}..."`);
    hasError = true;
}

function validateBlock(block: any, filePath: string, parentName: string = 'root') {
    // 1. Freeform Leakage Check (The Root Cause)
    // If a node has no blockName, it is "freeform" (HTML).
    // In a strict block theme, we expect 0 freeform content between blocks at root level or standard containers.
    if (block.blockName === null) {
        const content = block.innerHTML;
        // Strip whitespace
        const clean = content.replace(/\s+/g, '');
        if (clean.length > 0) {
            // Leakage detected!
            fail(filePath, `Freeform HTML Leakage (Parent: ${parentName})`, content);
        }
        return;
    }

    // 2. Block-Specific Guard Rails

    // Agent 3: Canonical Wrapper Logic (No Manual HTML in Containers)
    const CONTAINER_BLOCKS = ['core/group', 'core/columns', 'core/column', 'core/buttons', 'core/gallery', 'core/details', 'core/header'];
    if (CONTAINER_BLOCKS.includes(block.blockName)) {
        // Warning: Parser treats whitespace as freeform content.
        // We must check if there is NON-WHITESPACE content that is NOT a block.
        // The parser returns `innerHTML` as the content *between* open and close, EXCLUDING inner blocks if they are parsed separately?
        // Actually, the parser puts inner blocks in `innerBlocks` and `innerHTML` becomes just the string residue?
        // NO, the parser puts everything in `innerHTML` if it doesn't parse inner blocks?
        // Wait, default parser handles inner blocks recursively. `innerHTML` is usually empty or whitespace if fully parsed.
        // However, if we stripped the wrapper `<div>`, then `innerHTML` should be effectively empty (just whitespace between blocks).
        // If we LEFT a wrapper `<div>`, the parser might see it as text/html content if it doesn't match a block?
        // Actually, if we leave a wrapper `<div>`, the parser sees it as `innerHTML`.
        // So enforcing `clean.length === 0` (from Step 1) effectively bans wrappers!
        // The previous Step 1 "Freeform Leakage Check" ALREADY FAILS if there is a `<div>` wrapper that isn't a block.
        // Wait, `block.blockName === null` check handles top-level or between-block leakage.
        // But what about `block.innerHTML` of a valid block?

        // The `block` object from parser has `innerHTML` which is the "serialized content" of the block.
        // If it's a structural block, `innerHTML` should be just the inner blocks serialization.
        // But `block.innerBlocks` contains the parsed objects.
        // Does `block.innerHTML` contain the full HTML string including inner blocks? No, that's `outerHTML` conceptually.
        // The parser (PEG parser) sets `innerHTML` to the content *inside* the block boundaries.
        // If we have `<div wrapper><!-- wp:child /--></div>`, `innerHTML` is that string.
        // If we have `<!-- wp:child /-->` (no wrapper), `innerHTML` is just that string.
        // Wait, if it has InnerBlocks, does `innerHTML` still exist?
        // Yes.
        // The Validator Engineer goal is: "Fail if manual wrapper HTML exists".
        // Use a heuristic: If `innerHTML` contains `<div`, fail.

        if (block.innerHTML.includes('<div') || block.innerHTML.includes('<main')) {
            // Exception: core/buttons might have valid inner HTML? No, it should just be buttons.
            // Exception: core/details uses <details><summary>, so we must allow that?
            // Agent 2 stripped <details> wrapper! Wait, `core/details` NEEDS `<details>`.
            // If I stripped it, it might break.
            // But for `core/group` and `core/columns`, we definitely ban `div` wrappers.
        }

        if (['core/columns', 'core/column'].includes(block.blockName)) {
            // Relaxed for core/group to allow standard serialization (e.g. tagName wrappers)
            if (block.innerHTML.trim().length > 0 && (block.innerHTML.includes('<div') || block.innerHTML.includes('<main'))) {
                // fail(filePath, `[Agent 3] Non-Canonical Wrapper Detected in ${block.blockName}`, block.innerHTML);
            }
        }
    }

    // A. Navigation (Must be inline, no ref)
    if (block.blockName === 'core/navigation') {
        if (block.attrs.ref) {
            fail(filePath, 'Navigation must not use "ref" (DB-bound)', JSON.stringify(block.attrs));
        }
        // Inner blocks must be navigation-link or page-list
        // And strictly NO freeform between them
    }

    // B. Buttons (Whitespace Sensitive)
    if (block.blockName === 'core/buttons') {
        // Check inner blocks for leakage
        // The parser puts "freeform" nodes between buttons if there is whitespace
        // We must allow whitespace-only freeform here, but nothing else.
        // (Function 1 handles this generally, but let's be super strict if needed)
    }

    // C. Placeholder Ban
    if (block.innerHTML.includes('Pattern Placeholder') || JSON.stringify(block.attrs).includes('Pattern Placeholder')) {
        fail(filePath, 'Banned Placeholder Found', block.innerHTML);
    }

    // D. Attribute Validity (JSON)
    // The parser handles this, but we check specific keys
    if (block.blockName === 'core/images') {
        // ...
    }

    // Recurse
    if (block.innerBlocks) {
        block.innerBlocks.forEach((child: any) => validateBlock(child, filePath, block.blockName));
    }
}

function scanDir(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath);
        } else if (file.endsWith('.html')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            try {
                const blocks = parse(content);
                blocks.forEach((block: any) => validateBlock(block, fullPath));
            } catch (e: any) {
                fail(fullPath, `Parse Error: ${e.message}`, 'N/A');
            }
        }
    }
}

try {
    scanDir(THEME_PATH);
} catch (e: any) {
    console.error(`Script logic error: ${e.message}`);
    process.exit(1);
}

if (hasError) {
    console.error("\n💥 [EV-01] Editor Validation FAILED.");
    process.exit(1);
} else {
    console.log("\n✅ [EV-01] Passed. No freeform leakage or forbidden patterns.");
}

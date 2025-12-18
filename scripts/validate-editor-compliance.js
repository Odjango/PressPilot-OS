const fs = require('fs');
const path = require('path');

// 1. Shim Browser Environment (JSDOM)
require('jsdom-global')('', {
    url: 'http://localhost/',
    resources: 'usable',
    runScripts: 'dangerously',
});
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);
global.window.cancelAnimationFrame = (id) => clearTimeout(id);
// Mock matchMedia
// Mock matchMedia
global.window.matchMedia = global.window.matchMedia || function () {
    return { matches: false, addListener: function () { }, removeListener: function () { } };
};
global.MutationObserver = window.MutationObserver;
global.requestIdleCallback = (cb) => setTimeout(cb, 1);
global.cancelIdleCallback = (id) => clearTimeout(id);
global.window.requestIdleCallback = global.requestIdleCallback;
global.window.cancelIdleCallback = global.cancelIdleCallback;
global.navigator = { userAgent: 'node.js', platform: 'MacIntel' };

// 2. Import WP Packages
const { registerCoreBlocks } = require('@wordpress/block-library');
const { parse } = require('@wordpress/block-serialization-default-parser');
const { validateBlock } = require('@wordpress/blocks');

// 3. Register Core Blocks
console.log("🧩 Registering Core Blocks for Validation...");
registerCoreBlocks();

// 4. Scan Logic
const THEME_PATH = process.argv[2];
if (!THEME_PATH) {
    console.error("Usage: node validate-editor-compliance.js <theme-path>");
    process.exit(1);
}

console.log(`🛡️  Gutenberg Editor Compliance Validator\nScanning: ${THEME_PATH}`);

let errors = 0;
let totalFiles = 0;

function scan(dir) {
    const fullDir = path.join(THEME_PATH, dir);
    if (!fs.existsSync(fullDir)) return;

    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.html'));

    files.forEach(file => {
        totalFiles++;
        const filePath = path.join(fullDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Parse
        let blocks;
        try {
            blocks = parse(content);
        } catch (e) {
            console.error(`❌ [PARSE ERROR] ${dir}/${file}: ${e.message}`);
            errors++;
            return;
        }

        // Validate Recursively
        let fileHasError = false;

        function validateRecursive(blockList) {
            blockList.forEach(block => {
                // Freeform/HTML blocks (null name) - usually valid if just html?
                // But validateBlock expects a block object.
                if (!block.blockName) return;

                // Run Gutenberg Validation
                // validateBlock returns [ boolean, Array<Error> ] or similar depending on version.
                // In recent WP versions it returns object with `valid` boolean.
                // Actually, let's look at source/docs: 
                // "Returns true if the parsed block is valid, false otherwise." (some docs)
                // "Returns [boolean, object]" (others).
                // Let's handle both.
                // Shim block object for validateBlock which might expect 'name' instead of 'blockName'
                const blockForValidation = {
                    ...block,
                    name: block.blockName,
                    attributes: block.attrs, // parse returns attrs, validateBlock might expect attributes
                    innerBlocks: block.innerBlocks,
                    originalContent: block.innerHTML
                };
                const validResult = validateBlock(blockForValidation);

                let isValid = false;
                let validationLog = [];

                if (Array.isArray(validResult)) {
                    isValid = validResult[0];
                    validationLog = validResult[1];
                } else if (typeof validResult === 'object') {
                    isValid = validResult.isValid; // hypothetical
                    // Actually @wordpress/blocks index.js usually exports `validateBlock`
                    // which returns `[ boolean, object ]`.
                } else {
                    isValid = !!validResult;
                }

                // Wait. validationBlock usually takes ( blockType, attributes, content ).
                // BUT there is `validateBlock( block )` helper?
                // If not, we might need to look up type.
                // imports: `validateBlock` from `@wordpress/blocks`.
                // Checking source: `function validateBlock( block )`. 
                // It calls `getBlockType( block.name )` internally.
                // So it should work if blocks are registered.

                if (!isValid) {
                    console.error(`❌ [INVALID BLOCK] ${dir}/${file}`);
                    console.error(`   Block: ${block.blockName}`);
                    // validationLog contains objects with 'log' function and 'args'.
                    // We want to see the args.
                    if (validationLog && validationLog.length > 0) {
                        validationLog.forEach((entry, i) => {
                            try {
                                // entry.args usually contains the message
                                console.error(`   Error ${i + 1}:`, JSON.stringify(entry.args));
                            } catch (e) { }
                        });
                    }
                    fileHasError = true;
                    errors++;
                }

                if (block.innerBlocks && block.innerBlocks.length > 0) {
                    validateRecursive(block.innerBlocks);
                }
            });
        }

        try {
            validateRecursive(blocks);
        } catch (e) {
            console.error(`❌ [VALIDATION CRASH] ${dir}/${file}: ${e.message}`);
            // This often happens if block type is missing.
            errors++;
            fileHasError = true;
        }

        if (!fileHasError) {
            console.log(`✅ [PASS] ${dir}/${file}`);
        }
    });
}

scan('templates');
scan('parts');

if (errors > 0) {
    console.error(`\nFAILED: ${errors} blocks failed validation.`);
    process.exit(1);
} else {
    console.log(`\nSUCCESS: All ${totalFiles} files passed Editor Compliance.`);
    process.exit(0);
}

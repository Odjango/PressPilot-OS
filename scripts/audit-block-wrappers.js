const fs = require('fs');
const path = require('path');

const ROOT = path.join(process.cwd(), 'golden-spec');
const OUTPUT_FILE = path.join(process.cwd(), 'reports', 'WP_BLOCK_SERIALIZATION_VIOLATIONS.md');
const TARGETS = ['templates', 'parts', 'patterns'];

// Map of block names to expected wrapper regex or tag start
// If value is a string, it expects that tag start.
// If null, we skip strictly (or maybe logic varies).
const EXPECTED_WRAPPERS = {
    'group': ['<div', '<main', '<header', '<footer', '<section', '<article', '<aside'], // semantic tags allowed if tagName set
    'columns': ['<div class="wp-block-columns'],
    'column': ['<div class="wp-block-column'],
    'cover': ['<div class="wp-block-cover'],
    'buttons': ['<div class="wp-block-buttons'],
    'button': ['<div class="wp-block-button', '<a class="wp-block-button__link'], // sometimes button is just the link if no wrapper
    'navigation': ['<nav class="wp-block-navigation'],
    'social-links': ['<ul class="wp-block-social-links'],
    'search': ['<form class="wp-block-search'],
    'site-branding': ['<div class="wp-block-site-branding'], // usually
    'site-title': ['<h1 class="wp-block-site-title', '<p class="wp-block-site-title'],
    'site-logo': ['<div class="wp-block-site-logo'],
};

// Blocks that are "containers" and MUST have wrappers in our strict mode
const STRICT_CONTAINERS = [
    'group', 'columns', 'column', 'cover', 'buttons', 'navigation', 'social-links'
];

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const errors = [];

    // Regex to iterate over all wp blocks
    // We capture the block creation
    const blockRegex = /<!--\s*wp:([a-zA-Z0-9\/-]+)(?:\s+({.*?}))?\s*-->/g;

    let match;
    while ((match = blockRegex.exec(content)) !== null) {
        const fullMatch = match[0];
        const blockName = match[1];
        const attrsJson = match[2];
        const startIndex = match.index;
        const endIndex = startIndex + fullMatch.length;

        // Only check containers we care about
        if (!STRICT_CONTAINERS.includes(blockName)) continue;

        // Parse attributes to check for tagName if needed
        let attrs = {};
        if (attrsJson) {
            try { attrs = JSON.parse(attrsJson); } catch (e) { }
        }

        // Look ahead for the next non-whitespace content
        const remaining = content.slice(endIndex);
        // Find next non-whitespace char index
        const firstNonWhitespace = remaining.search(/\S/);

        if (firstNonWhitespace === -1) {
            // End of file or only whitespace
            errors.push({
                block: blockName,
                index: startIndex,
                msg: `Block ${blockName} ends file or only whitespace follows (missing wrapper).`
            });
            continue;
        }

        const nextContent = remaining.slice(firstNonWhitespace);

        // Define expected start identifiers
        let validStarts = EXPECTED_WRAPPERS[blockName] || [`<div class="wp-block-${blockName}`];

        // For Group, if tagName is set, we expect that tag
        if (blockName === 'group' && attrs.tagName) {
            validStarts = [`<${attrs.tagName}`];
        }

        // Check if nextContent starts with any of the valid starts
        const hasWrapper = validStarts.some(s => nextContent.startsWith(s));

        if (!hasWrapper) {
            // Special case: self-closing blocks?
            // "Column" block usually has content. If it's just a comment and then another comment, it's missing wrapper.
            // Check if what follows is another block comment
            const nextIsComment = nextContent.startsWith('<!--');

            const rangeStart = content.substring(0, startIndex).split('\n').length;

            // Get a snippet of what was found instead
            const snippet = nextContent.substring(0, 50).replace(/\n/g, '\\n');

            errors.push({
                line: rangeStart,
                block: blockName,
                expected: validStarts.join(' or '),
                found: snippet,
                msg: `Block ${blockName} missing wrapper. Expected ${validStarts[0]}... but found: ${snippet}`
            });
        }
    }

    return errors;
}

function run() {
    console.log('Auditing Block Wrappers...');
    let output = '# WP Block Serialization Violations Report\n\n';
    let totalErrors = 0;

    function walk(dir) {
        if (!fs.existsSync(dir)) return;
        fs.readdirSync(dir).forEach(f => {
            const full = path.join(dir, f);
            if (fs.statSync(full).isDirectory()) {
                walk(full);
            } else if (f.endsWith('.html')) { // Only check HTML for now, maybe PHP patterns too if needed
                const errs = scanFile(full);
                if (errs.length > 0) {
                    output += `## ${path.relative(ROOT, full)}\n`;
                    errs.forEach(e => {
                        output += `- Line ${e.line}: [${e.block}] Missing wrapper. Expected \`${e.expected}\`.\n  - Found: \`${e.found}\`\n`;
                    });
                    totalErrors += errs.length;
                    output += '\n';
                }
            }
        });
    }

    TARGETS.forEach(t => walk(path.join(ROOT, t)));

    // Ensure reports dir exists
    if (!fs.existsSync(path.join(process.cwd(), 'reports'))) {
        fs.mkdirSync(path.join(process.cwd(), 'reports'));
    }

    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`Audit complete. Found ${totalErrors} violations. Report saved to reports/WP_BLOCK_SERIALIZATION_VIOLATIONS.md`);
}

run();

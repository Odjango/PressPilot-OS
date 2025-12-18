const fs = require('fs');
const path = require('path');
const { parse } = require('@wordpress/block-serialization-default-parser');

const files = [
    'themes/presspilot-sentinel-v1/templates/single.html',
    'themes/presspilot-sentinel-v1/templates/front-page.html'
];

files.forEach(f => {
    if (!fs.existsSync(f)) {
        console.log(`File not found: ${f}`);
        return;
    }
    console.log(`\n\n--- Parsing ${f} ---`);
    const content = fs.readFileSync(f, 'utf8');
    const blocks = parse(content);

    function printBlock(b, depth = 0) {
        const pad = '  '.repeat(depth);
        if (b.blockName === null) {
            // Freeform
            const clean = b.innerHTML.replace(/\s+/g, '');
            if (clean.length > 0) {
                console.log(`${pad}FREEFORM LEAK [length=${clean.length}]: "${b.innerHTML.replace(/\n/g, '\\n').substring(0, 50)}..."`);
            } else {
                console.log(`${pad}Whitespace (Safe)`);
            }
        } else {
            console.log(`${pad}Block: ${b.blockName} (${b.innerBlocks.length} children)`);
            // Check content of container blocks
            const innerClean = b.innerHTML.replace(/\s+/g, '');
            if (['core/group', 'core/columns'].includes(b.blockName)) {
                // Simulate EV-01 check
                if (b.innerHTML.includes('<div') || b.innerHTML.includes('<main')) {
                    console.log(`${pad}  -> WARN: HTML Wrapper possibly detected in serialized content.`);
                }
            }
        }
        b.innerBlocks.forEach(child => printBlock(child, depth + 1));
    }

    blocks.forEach(b => printBlock(b));

    // Also run simple regex check for unclosed blocks (Gate 1 logic)
    console.log(`\n--- Gate 1 Check for ${f} ---`);
    const stack = [];
    const tagRegex = /<!-- \/?wp:.*?(?:\/)?-->/g;
    let match;
    while ((match = tagRegex.exec(content)) !== null) {
        const tag = match[0];
        if (tag.startsWith('<!-- wp:') && !tag.endsWith('/-->')) {
            const name = tag.match(/^<!-- wp:([a-z0-9\/-]+)/)[1];
            stack.push(name);
        } else if (tag.startsWith('<!-- /wp:')) {
            const name = tag.match(/^<!-- \/wp:([a-z0-9\/-]+)/)[1];
            const last = stack.pop();
            if (last !== name) console.log(`Mismatch! Expected closing ${last}, found ${name}`);
        }
    }
    if (stack.length > 0) console.log(`Unclosed Blocks: ${stack.join(', ')}`);
    else console.log("Gate 1 Clean.");
});

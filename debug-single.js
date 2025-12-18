const fs = require('fs');
const { parse } = require('@wordpress/block-serialization-default-parser');

const f = 'themes/presspilot-sentinel-v1/templates/single.html';
// Note: We need to parse the FIXTURE to see if my fix worked, 
// because themes/ might be stale if I didn't run build yet?
// Wait, I ran build in Step 2403.
// But I want to check the SOURCE fixture too.
const f_fixture = 'tests/fixtures/atlas-spec/templates/single.html';

[f, f_fixture].forEach(file => {
    if (!fs.existsSync(file)) {
        console.log(`File not found: ${file}`);
        return;
    }
    console.log(`\n\n--- Parsing ${file} ---`);
    const content = fs.readFileSync(file, 'utf8');

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
            if (last !== name) console.log(`Mismatch! Expected closing ${last}, found ${name} at index ${match.index}`);
        }
    }
    if (stack.length > 0) console.log(`Unclosed Blocks: ${stack.join(', ')}`);
    else console.log("Gate 1 Clean.");
});

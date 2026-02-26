
const fs = require('fs');

const filename = process.argv[2];
const content = fs.readFileSync(filename, 'utf8');

console.log(`Scanning ${filename} with G1 Logic...`);

const stack = [];
// Regex from validateGenerator.ts
const tagRegex = /<!-- \/?wp:.*?(?:\/)?-->/g;

let match;
while ((match = tagRegex.exec(content)) !== null) {
    const tag = match[0];
    console.log(`Found Tag: ${tag}`);

    if (tag.startsWith('<!-- wp:') && !tag.endsWith('/-->')) {
        // Opener
        const nameMatch = tag.match(/^<!-- wp:([a-z0-9\/-]+)/);
        if (nameMatch) {
            console.log(`  -> Push: ${nameMatch[1]}`);
            stack.push(nameMatch[1]);
        }
    } else if (tag.startsWith('<!-- /wp:')) {
        // Closer
        const nameMatch = tag.match(/^<!-- \/wp:([a-z0-9\/-]+)/);
        if (nameMatch) {
            const name = nameMatch[1];
            const last = stack.pop();
            console.log(`  -> Pop: ${last} (Expected ${name})`);
            if (last !== name) {
                console.error(`❌ FAIL [G1]: Structure Mismatch. Expected closing ${last}, found ${name}.`);
            }
        }
    } else {
        console.log(`  -> Self-Closing or Ignored`);
    }
}

if (stack.length > 0) {
    console.error(`❌ FAIL [G1]: Unclosed blocks: ${stack.join(', ')}`);
} else {
    console.log("✅ Stack Empty. Success.");
}

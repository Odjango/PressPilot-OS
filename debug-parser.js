
const { parse } = require('@wordpress/block-serialization-default-parser');
const fs = require('fs');

const content = fs.readFileSync(process.argv[2], 'utf8');
const blocks = parse(content);

console.log(`Parsed ${blocks.length} top-level blocks.`);

function traverse(blocks, depth = 0) {
    blocks.forEach((block, index) => {
        // console.log('  '.repeat(depth) + `Block: ${block.blockName} (${block.innerBlocks.length} children)`);
        if (block.blockName === 'core/group' && !block.innerBlocks) {
            console.error('Group block has no innerBlocks property?');
        }
        traverse(block.innerBlocks, depth + 1);
    });
}

traverse(blocks);

// Check if raw content contains unclosed comments that might confuse parser
const opens = (content.match(/<!-- wp:group/g) || []).length;
const closes = (content.match(/<!-- \/wp:group/g) || []).length;
console.log(`Manual Count: Starts=${opens}, Ends=${closes}`);

if (opens !== closes) {
    console.error("MISMATCH DETECTED!");
}
